import { createLceEngine } from '../../packages/lce-core/src/index.mjs';
const candles = Array.from({length:200},(_,i)=>({time:Date.now()-(200-i)*60000,open:100+i*.01,high:101+i*.01,low:99+i*.01,close:100+i*.01,volume:100}));
const engine = createLceEngine({symbols:['BTC'],timeframes:['1m','15m','1h','4h']});
engine.ingestCandles('BTC','1m',candles);
engine.ingestOrderBook('BTC',{bids:[[100,10],[99,30]],asks:[[101,12],[102,28]]});
engine.ingestTrades('BTC',[{price:100.5,size:1,side:'buy'}]);
console.log(JSON.stringify(engine.getZones('BTC').slice(0,3),null,2));
