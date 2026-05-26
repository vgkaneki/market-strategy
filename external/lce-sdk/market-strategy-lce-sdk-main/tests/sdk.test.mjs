import test from 'node:test';
import assert from 'node:assert/strict';
import { createLceEngine, aggregateCandles } from '../packages/lce-core/src/index.mjs';
import { normalizeHyperliquidBook, normalizeDydxTrades } from '../packages/lce-adapters/src/index.mjs';
import { REQUIRED_ENGINE_IDS, registeredEngines, runRegisteredEngines } from '../packages/lce-engines/src/index.mjs';
import { decideMarket } from '../packages/lce-market-decision/src/index.mjs';
import { splitFormationHoldout, validateForwardTouches } from '../packages/lce-validation/src/index.mjs';

function candles(n){ return Array.from({length:n},(_,i)=>({time:Date.now()-(n-i)*60000,open:100+i*.01,high:101+i*.01,low:99+i*.01,close:100+i*.01,volume:100})); }

test('core engine creates zones and aggregates candles',()=>{ const e=createLceEngine({symbols:['BTC'],timeframes:['1m','15m']}); e.ingestCandles('BTC','1m',candles(200)); e.ingestOrderBook('BTC',{bids:[[100,20]],asks:[[101,20]]}); assert.ok(e.getZones('BTC').length>0); assert.ok(aggregateCandles(candles(60),'15m').length>0); });

test('adapters normalize exchange payloads',()=>{ assert.equal(normalizeHyperliquidBook({coin:'BTC',levels:[[[100,2]],[[101,3]]]}).symbol,'BTC'); assert.equal(normalizeDydxTrades({id:'ETH-USD',contents:{trades:[{price:'2000',size:'1',side:'BUY'}]}})[0].side,'buy'); });

test('all required engines are registered and output normalized',()=>{ const ids=new Set(registeredEngines.map(e=>e.id)); for(const id of REQUIRED_ENGINE_IDS) assert.ok(ids.has(id), id); const outputs=runRegisteredEngines({symbol:'BTC',timeframe:'4h',lastPrice:100,candles:candles(50)}); assert.ok(outputs.length>=REQUIRED_ENGINE_IDS.length); assert.ok(outputs.every(o=>o.engineId&&Number.isFinite(o.price))); });

test('market decision combines engine outputs',()=>{ const decision=decideMarket({symbol:'BTC',timeframe:'4h',lastPrice:100,candles:candles(100),dataHealth:{BTC:{overall:'healthy'}}}); assert.ok(['Strong Demand Zone','Strong Supply Zone','Watch Zone','No Clean Edge'].includes(decision.decision)); assert.equal(decision.marketDataOnly,true); });

test('validation helpers run',()=>{ const split=splitFormationHoldout(candles(100)); const zone={id:'z',symbol:'BTC',side:'demand',price:100,zoneLow:99,zoneHigh:101,strength:80}; const result=validateForwardTouches({zones:[zone],holdoutCandles:split.holdout}); assert.equal(result.summary.zones,1); });
