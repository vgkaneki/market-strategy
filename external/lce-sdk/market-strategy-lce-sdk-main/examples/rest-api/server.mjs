import http from 'node:http';
import { createLceEngine } from '../../packages/lce-core/src/index.mjs';
const engine = createLceEngine({ symbols:['BTC','ETH','SOL'], marketDataOnly:true });
const port = Number(process.env.PORT || 8788);
async function readJson(req){ const chunks=[]; for await(const c of req) chunks.push(c); const text=Buffer.concat(chunks).toString('utf8'); return text ? JSON.parse(text) : {}; }
function send(res,data,status=200){ res.writeHead(status,{'content-type':'application/json; charset=utf-8'}); res.end(JSON.stringify(data,null,2)); }
const server = http.createServer(async (req,res)=>{ const url=new URL(req.url,`http://localhost:${port}`); try{
  if(req.method==='GET'&&url.pathname==='/status') return send(res,engine.getStatus());
  if(req.method==='GET'&&url.pathname.startsWith('/zones/')) return send(res,{zones:engine.getZones(url.pathname.split('/').at(-1))});
  if(req.method==='POST'&&url.pathname==='/ingest/candles'){ const b=await readJson(req); engine.ingestCandles(b.symbol,b.timeframe||'1m',b.candles||[]); return send(res,{ok:true}); }
  if(req.method==='POST'&&url.pathname==='/ingest/book'){ const b=await readJson(req); engine.ingestOrderBook(b.symbol,b.book||b); return send(res,{ok:true}); }
  if(req.method==='POST'&&url.pathname==='/ingest/trades'){ const b=await readJson(req); engine.ingestTrades(b.symbol,b.trades||[]); return send(res,{ok:true}); }
  send(res,{error:'not-found'},404);
}catch(err){ send(res,{error:String(err?.message||err)},500); }});
server.listen(port,()=>console.log(`Market Strategy LCE REST wrapper running at http://localhost:${port}`));
