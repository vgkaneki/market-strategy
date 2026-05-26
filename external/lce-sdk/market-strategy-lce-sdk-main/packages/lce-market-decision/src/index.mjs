import { runRegisteredEngines } from '../../lce-engines/src/index.mjs';

function healthOk(ctx){ const h=ctx.dataHealth?.[ctx.symbol]?.overall || ctx.dataHealth?.overall || 'healthy'; return h !== 'bad' && h !== 'low-quality'; }
function decideLabel(best, ctx){ if(!healthOk(ctx)) return 'Low Quality Data'; if(!best) return 'No Clean Edge'; if(best.strength >= 78 && best.side === 'demand') return 'Strong Demand Zone'; if(best.strength >= 78 && best.side === 'supply') return 'Strong Supply Zone'; if(best.strength >= 55) return 'Watch Zone'; return 'No Clean Edge'; }

export function decideMarket(ctx={}){
  const engineOutputs = ctx.engineOutputs || runRegisteredEngines(ctx);
  const candidates = engineOutputs.filter(x => Number.isFinite(x.price) && x.price > 0);
  const grouped = [];
  for(const c of candidates){
    let g = grouped.find(x => Math.abs(c.price-x.price)/x.price*10000 <= 20 && (c.side===x.side || c.side==='neutral' || x.side==='neutral'));
    if(!g){ grouped.push({...c, engines:[c.engineId], reasons:[...(c.reasons||[])], sourceCount:1}); }
    else { g.price=(g.price*g.sourceCount+c.price)/(g.sourceCount+1); g.zoneLow=Math.min(g.zoneLow,c.zoneLow); g.zoneHigh=Math.max(g.zoneHigh,c.zoneHigh); g.strength=Math.min(100,(g.strength+c.strength)/2+6); g.engines=[...new Set([...g.engines,c.engineId])]; g.reasons=[...new Set([...g.reasons,...(c.reasons||[])])]; g.sourceCount=g.engines.length; }
  }
  const best = grouped.sort((a,b)=>b.strength-a.strength)[0] || null;
  return {
    symbol: ctx.symbol || best?.symbol || 'UNKNOWN',
    timeframe: ctx.timeframe || best?.timeframe || 'live',
    decision: decideLabel(best, ctx),
    confidence: best ? Math.round(best.strength) : 0,
    zoneLow: best?.zoneLow ?? null,
    zoneHigh: best?.zoneHigh ?? null,
    price: best?.price ?? null,
    side: best?.side ?? 'neutral',
    reasons: best?.reasons || [],
    enginesUsed: best?.engines || [],
    engineOutputs,
    dataHealth: healthOk(ctx) ? 'healthy' : 'bad',
    forwardProof: ctx.forwardProof?.status || 'pending',
    marketDataOnly: true,
    noOrderExecution: true
  };
}
