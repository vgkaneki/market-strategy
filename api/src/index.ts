import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { randomUUID } from "node:crypto";
import { config } from "./config.js";
import { registerSecurity } from "./plugins/security.js";
import { healthRoutes } from "./routes/health.js";
import { marketRoutes } from "./routes/market.js";
import { kycRoutes } from "./routes/kyc.js";
import { alertRoutes } from "./routes/alerts.js";
import { replayRoutes } from "./routes/replay.js";
import { heatmapRoutes } from "./routes/heatmap.js";
import { backtestRoutes } from "./routes/backtest.js";
import { confluenceRoutes } from "./routes/confluence.js";
import { orderbookHistoryRoutes } from "./routes/orderbookHistory.js";
import { lceRoutes } from "./routes/lce.js";
import { custodyRoutes } from "./routes/custody.js";
import { authRoutes } from "./routes/auth.js";
import { reportsRoutes } from "./routes/reports.js";
import { backfillRoutes } from "./routes/backfill.js";
import { MarketStreamHub } from "./services/ws/MarketStreamHub.js";
import { HyperliquidAdapter } from "./services/ws/HyperliquidAdapter.js";
import { DydxAdapter } from "./services/ws/DydxAdapter.js";
import { MarketEventBus } from "./market/MarketEventBus.js";
import { MarketDataStore } from "./market/MarketDataStore.js";
import { HeatmapTileCache } from "./heatmap/HeatmapTileCache.js";
import { redis } from "./db.js";
import { LiquidityWallScanner } from "./scanners/LiquidityWallScanner.js";
import { ScannerWorker } from "./scanners/ScannerWorker.js";
import { AlertWorker } from "./alerts/AlertWorker.js";

const app = Fastify({ logger: true });
await registerSecurity(app);
await app.register(websocket);

const hub = new MarketStreamHub(app.log);
const bus = new MarketEventBus(app.log);
const marketDataStore = new MarketDataStore(app.log);
const heatmapCache = new HeatmapTileCache(redis, app.log, config.HEATMAP_BUCKET_SIZE);
const scannerWorker = new ScannerWorker(app.log, new LiquidityWallScanner(config.SCANNER_MIN_WALL_NOTIONAL), (topic, signal) => hub.broadcast(topic, signal));
const alertWorker = new AlertWorker(app.log, (topic, alert) => hub.broadcast(topic, alert));

bus.on("*", (topic, event) => {
  const marketEvent = event as any;
  hub.broadcast(topic as string, marketEvent);
  marketDataStore.enqueue(marketEvent);
  scannerWorker.handle(marketEvent);
  alertWorker.handle(marketEvent);

  if (marketEvent.type === "book_snapshot" || marketEvent.type === "book_delta") {
    void heatmapCache.handleBookEvent(marketEvent).then((tile) => {
      hub.broadcast(`heatmap:${marketEvent.exchange}:${marketEvent.symbol}`, tile);
    }).catch((err) => app.log.warn({ err }, "failed to build heatmap tile"));
  }
});

app.register(async function wsRoutes(server) {
  server.get("/v1/ws", { websocket: true }, (socket, req) => hub.addClient(randomUUID(), req.ip, socket));
});

app.get("/v1/ws/stats", async () => hub.stats());
await app.register(healthRoutes);
await app.register(marketRoutes);
await app.register(kycRoutes);
await app.register(alertRoutes);
await app.register(replayRoutes);
await app.register(heatmapRoutes);
await app.register(backtestRoutes);
await app.register(confluenceRoutes);
await app.register(orderbookHistoryRoutes);
await app.register(lceRoutes);
await app.register(custodyRoutes);
await app.register(authRoutes);
await app.register(reportsRoutes);
await app.register(backfillRoutes);

setInterval(() => hub.heartbeat(), 15_000);
marketDataStore.start();
alertWorker.start();

const hyperliquid = new HyperliquidAdapter(app.log, (events) => bus.publishMany(events));
const dydx = new DydxAdapter(app.log, (events) => bus.publishMany(events));
if (process.env.NODE_ENV !== "test") { hyperliquid.connect(); dydx.connect(); }

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => { marketDataStore.stop(); alertWorker.stop(); await app.close(); process.exit(0); });
}

await app.listen({ port: config.API_PORT, host: "0.0.0.0" });
