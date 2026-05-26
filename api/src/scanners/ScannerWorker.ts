import type { FastifyBaseLogger } from "fastify";
import type { NormalizedMarketEvent } from "../market/types.js";
import { LiquidityWallScanner, type LiquidityWallSignal } from "./LiquidityWallScanner.js";

export class ScannerWorker {
  constructor(
    private readonly logger: FastifyBaseLogger,
    private readonly scanner: LiquidityWallScanner,
    private readonly onSignal: (topic: string, signal: LiquidityWallSignal) => void
  ) {}

  handle(event: NormalizedMarketEvent) {
    if (event.type !== "book_snapshot" && event.type !== "book_delta") return;
    try {
      for (const signal of this.scanner.scan(event)) {
        this.onSignal(`scanner:liquidity_wall:${event.symbol}`, signal);
      }
    } catch (err) {
      this.logger.warn({ err }, "scanner worker failed");
    }
  }
}
