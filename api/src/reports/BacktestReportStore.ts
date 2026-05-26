import { randomUUID } from "node:crypto";
import { clickhouse } from "../clickhouse/client.js";
import type { BacktestReport } from "../backtest/types.js";

function dt(ms: number): string {
  return new Date(ms).toISOString().replace("Z", "");
}

export interface StoredBacktestReportSummary {
  id: string;
  createdAt: string;
  exchange: string;
  symbol: string;
  interval: string;
  reactionRate: number;
  levelsGenerated: number;
  touches: number;
  wins: number;
  losses: number;
  timeouts: number;
}

export class BacktestReportStore {
  async save(report: BacktestReport) {
    const id = randomUUID();
    const now = Date.now();

    await clickhouse.insert({
      table: "backtest_reports",
      format: "JSONEachRow",
      values: [{
        id,
        created_at: dt(now),
        exchange: report.request.exchange,
        symbol: report.request.symbol,
        interval: report.request.interval,
        lookback: report.request.lookback,
        reaction_rate: report.summary.reactionRate,
        levels_generated: report.summary.levelsGenerated,
        touches: report.summary.touches,
        wins: report.summary.wins,
        losses: report.summary.losses,
        timeouts: report.summary.timeouts,
        avg_mfe_bps: report.summary.avgMfeBps,
        avg_mae_bps: report.summary.avgMaeBps,
        report_json: JSON.stringify(report)
      }]
    });

    return { id, createdAt: now, report };
  }

  async list(limit = 50): Promise<StoredBacktestReportSummary[]> {
    const result = await clickhouse.query({
      query: `
        SELECT
          id,
          toString(created_at) AS createdAt,
          exchange,
          symbol,
          interval,
          reaction_rate AS reactionRate,
          levels_generated AS levelsGenerated,
          touches,
          wins,
          losses,
          timeouts
        FROM backtest_reports
        ORDER BY created_at DESC
        LIMIT {limit:UInt32}
      `,
      format: "JSONEachRow",
      query_params: { limit }
    });

    return result.json();
  }

  async get(id: string) {
    const result = await clickhouse.query({
      query: `
        SELECT report_json
        FROM backtest_reports
        WHERE id = {id:String}
        ORDER BY created_at DESC
        LIMIT 1
      `,
      format: "JSONEachRow",
      query_params: { id }
    });

    const rows = await result.json<{ report_json: string }>();
    if (!rows.length) return null;
    return JSON.parse(rows[0].report_json);
  }
}
