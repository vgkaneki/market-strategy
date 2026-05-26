import { clickhouse } from "../clickhouse/client.js";
import type { HistoricalBookFrame, HistoricalBookQuery } from "./types.js";

export class OrderBookHistoryService {
  /**
   * Phase 5 can replay historical order book frames from captured live book_deltas.
   *
   * True full-depth historical order book backfill requires either:
   * - a vendor archive,
   * - your own always-on recorder,
   * - or a paid historical market-data provider.
   */
  async fromCapturedLive(query: HistoricalBookQuery): Promise<HistoricalBookFrame[]> {
    const result = await clickhouse.query({
      query: `
        SELECT
          toUnixTimestamp64Milli(ts) AS ts,
          seq,
          groupArrayIf((toString(price), toString(size)), side = 'bid') AS bids,
          groupArrayIf((toString(price), toString(size)), side = 'ask') AS asks
        FROM book_deltas
        WHERE exchange = {exchange:String}
          AND symbol = {symbol:String}
          AND ts >= parseDateTime64BestEffort({startTs:String})
          AND ts <= parseDateTime64BestEffort({endTs:String})
        GROUP BY ts, seq
        ORDER BY ts ASC
        LIMIT {limit:UInt32}
      `,
      format: "JSONEachRow",
      query_params: { ...query }
    });

    const rows = await result.json<any>();
    return rows.map((row) => ({
      exchange: query.exchange,
      symbol: query.symbol,
      ts: Number(row.ts),
      seq: Number(row.seq),
      bids: row.bids ?? [],
      asks: row.asks ?? [],
      source: "captured_live"
    }));
  }
}
