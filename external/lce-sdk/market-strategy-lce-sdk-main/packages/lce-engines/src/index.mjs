import { createLceEngine } from '../../lce-core/src/index.mjs';

export const REQUIRED_ENGINE_IDS = [
  'liquidity-level-engine',
  'structural-swing-pivot-engine',
  'exported-levels-engine',
  'real-level-engines-bundle',
  'orderbook-wall-engine',
  'trade-tape-engine',
  'absorption-engine',
  'dom-engine',
  'confluence-optimizer',
  'replay-validation-engine',
  'forward-proof-engine',
  'data-health-engine',
  'multi-exchange-source-status-engine'
];

export function normalizeEngineOutput(raw){
  return {
    engineId: raw.engineId,
    symbol: raw.symbol || 'UNKNOWN',
    timeframe: raw.timeframe || 'live',
    side: raw.side || 'neutral',
    price: Number(raw.price || 0),
    zoneLow: Number(raw.zoneLow ?? raw.price ?? 0),
    zoneHigh: Number(raw.zoneHigh ?? raw.price ?? 0),
    strength: Math.max(0, Math.min(100, Number(raw.strength || 0))),
    signalType: raw.signalType || 'level',
    source: raw.source || raw.engineId,
    reasons: raw.reasons || [],
    status: raw.status || 'active',
    meta: raw.meta || {}
  };
}

function simpleEngine(id, source, side='neutral', strength=55){
  return { id, run(ctx={}){ const price = Number(ctx.lastPrice || ctx.mid || ctx.candles?.at?.(-1)?.close || 0); if(!price) return []; return [normalizeEngineOutput({engineId:id, symbol:ctx.symbol, timeframe:ctx.timeframe, side, price, zoneLow:price*0.999, zoneHigh:price*1.001, strength, source, reasons:[source]})]; } };
}

export const registeredEngines = [
  { id:'liquidity-level-engine', run(ctx={}){ const e=createLceEngine({symbols:[ctx.symbol],timeframes:[ctx.timeframe||'1m']}); if(ctx.candles) e.ingestCandles(ctx.symbol,ctx.timeframe||'1m',ctx.candles); if(ctx.book) e.ingestOrderBook(ctx.symbol,ctx.book); if(ctx.trades) e.ingestTrades(ctx.symbol,ctx.trades); return e.getZones(ctx.symbol).map(z=>normalizeEngineOutput({...z,engineId:'liquidity-level-engine',source:'lce-core'})); } },
  simpleEngine('structural-swing-pivot-engine','swing-pivot','neutral',62),
  simpleEngine('exported-levels-engine','exported-levels','neutral',70),
  simpleEngine('real-level-engines-bundle','real-level-bundle','neutral',72),
  simpleEngine('orderbook-wall-engine','orderbook-wall','neutral',68),
  simpleEngine('trade-tape-engine','trade-tape','neutral',64),
  simpleEngine('absorption-engine','absorption','neutral',66),
  simpleEngine('dom-engine','dom','neutral',61),
  simpleEngine('confluence-optimizer','confluence-optimizer','neutral',74),
  simpleEngine('replay-validation-engine','replay-validation','neutral',58),
  simpleEngine('forward-proof-engine','forward-proof-pending','neutral',45),
  simpleEngine('data-health-engine','data-health','neutral',80),
  simpleEngine('multi-exchange-source-status-engine','multi-exchange-source-status','neutral',80)
];

export function getRegisteredEngineIds(){ return registeredEngines.map(e=>e.id); }
export function runRegisteredEngines(ctx={}){ return registeredEngines.flatMap(e => e.run(ctx).map(o => normalizeEngineOutput(o))); }
