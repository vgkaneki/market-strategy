import type { BacktestReport } from "../backtest/types.js";

function esc(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export class HtmlReportRenderer {
  render(report: BacktestReport & { metrics?: any }) {
    const metrics = (report as any).metrics;
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Market Strategy Backtest Report</title>
  <style>
    body { background:#07101d; color:#e8edf5; font-family:Inter,Arial,sans-serif; margin:0; padding:32px; }
    .card { background:#0b1422; border:1px solid #1b2940; border-radius:14px; padding:18px; margin:14px 0; }
    .grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; }
    .metric { background:#08111d; border:1px solid #1b2940; border-radius:12px; padding:12px; }
    .small { color:#8d9bb3; font-size:12px; }
    table { width:100%; border-collapse:collapse; margin-top:10px; }
    th,td { border-bottom:1px solid #1b2940; padding:8px; text-align:left; }
    .green { color:#52d6a0; } .red { color:#ff7684; }
  </style>
</head>
<body>
  <h1>Market Strategy Backtest Report</h1>
  <div class="small">Analytics only. Not financial advice. No profit guarantee.</div>

  <div class="card">
    <h2>${esc(report.request.symbol)} · ${esc(report.request.interval)}</h2>
    <div class="grid">
      <div class="metric"><div class="small">Reaction Rate</div><strong>${esc(report.summary.reactionRate)}%</strong></div>
      <div class="metric"><div class="small">Touches</div><strong>${esc(report.summary.touches)}</strong></div>
      <div class="metric"><div class="small">Wins</div><strong class="green">${esc(report.summary.wins)}</strong></div>
      <div class="metric"><div class="small">Losses</div><strong class="red">${esc(report.summary.losses)}</strong></div>
      <div class="metric"><div class="small">Avg MFE</div><strong>${esc(report.summary.avgMfeBps)} bps</strong></div>
      <div class="metric"><div class="small">Avg MAE</div><strong>${esc(report.summary.avgMaeBps)} bps</strong></div>
      <div class="metric"><div class="small">Levels</div><strong>${esc(report.summary.levelsGenerated)}</strong></div>
      <div class="metric"><div class="small">Candles</div><strong>${esc(report.summary.candles)}</strong></div>
    </div>
  </div>

  ${metrics ? `<div class="card"><h2>Validation Metrics</h2><pre>${esc(JSON.stringify(metrics, null, 2))}</pre></div>` : ""}

  <div class="card">
    <h2>Recent Trades</h2>
    <table>
      <thead><tr><th>Engine</th><th>Side</th><th>Price</th><th>Result</th><th>MFE</th><th>MAE</th></tr></thead>
      <tbody>
        ${report.trades.slice(-100).map((t) => `<tr>
          <td>${esc(t.engine)}</td>
          <td>${esc(t.side)}</td>
          <td>${esc(t.price)}</td>
          <td>${esc(t.result)}</td>
          <td>${esc(t.maxFavorableBps)}</td>
          <td>${esc(t.maxAdverseBps)}</td>
        </tr>`).join("")}
      </tbody>
    </table>
  </div>
</body>
</html>`;
  }
}
