import { decideMarket } from '../../packages/lce-market-decision/src/index.mjs';
const candles = Array.from({length:240},(_,i)=>({time:Date.now()-(240-i)*60000,open:75300+i*.1,high:75305+i*.1,low:75295+i*.1,close:75300+i*.1,volume:100}));
const decision = decideMarket({symbol:'BTC',timeframe:'4h',lastPrice:75371,candles,book:{bids:[[75360,20]],asks:[[75390,18]]},trades:[{price:75371,size:2,side:'buy'}],dataHealth:{BTC:{overall:'healthy'}},forwardProof:{status:'pending'}});
console.log(JSON.stringify(decision,null,2));
