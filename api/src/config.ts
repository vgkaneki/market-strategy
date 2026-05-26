import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  API_PORT: z.coerce.number().default(8787),
  APP_ORIGIN: z.string().default("http://localhost:3000"),
  POSTGRES_URL: z.string(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  CLICKHOUSE_URL: z.string().default("http://localhost:8123"),
  CLICKHOUSE_USER: z.string().default("default"),
  CLICKHOUSE_PASSWORD: z.string().optional(),
  CLICKHOUSE_DATABASE: z.string().default("market_strategy"),
  HEATMAP_BUCKET_SIZE: z.coerce.number().default(25),
  SCANNER_MIN_WALL_NOTIONAL: z.coerce.number().default(1000000),
  HYPERLIQUID_WS_URL: z.string().default("wss://api.hyperliquid.xyz/ws"),
  HYPERLIQUID_INFO_URL: z.string().default("https://api.hyperliquid.xyz/info"),
  DYDX_WS_URL: z.string().default("wss://indexer.dydx.trade/v4/ws"),
  DYDX_INDEXER_URL: z.string().default("https://indexer.dydx.trade"),
  BACKTEST_MAX_CANDLES: z.coerce.number().default(5000),
  BACKFILL_MAX_RANGE_MS: z.coerce.number().default(86_400_000),
  BACKFILL_BATCH_LIMIT: z.coerce.number().default(5000),
  CONFLUENCE_DISTANCE_BPS: z.coerce.number().default(10),
  REPLAY_MAX_BATCH: z.coerce.number().default(1000),
  AUTH_JWT_SECRET: z.string().default("dev-only-change-me"),
  AUTH_ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().default(900),
  AUTH_REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().default(2_592_000),
  CUSTODY_ENABLED: z.coerce.boolean().default(false),
  CUSTODY_DRY_RUN: z.coerce.boolean().default(true),
  CUSTODY_DAILY_HOT_WALLET_LIMIT_USD: z.coerce.number().default(50_000),
  CUSTODY_WITHDRAWAL_QUORUM: z.coerce.number().default(2),
  REPORT_PUBLIC_BASE_URL: z.string().default("http://localhost:8787"),
  PDF_EXPORT_ENABLED: z.coerce.boolean().default(false),
  RATE_LIMIT_MAX: z.coerce.number().default(240),
  RATE_LIMIT_WINDOW: z.string().default("1 minute"),
  SUMSUB_BASE_URL: z.string().optional(),
  SUMSUB_APP_TOKEN: z.string().optional(),
  SUMSUB_SECRET_KEY: z.string().optional(),
  VERIFF_BASE_URL: z.string().optional(),
  VERIFF_API_KEY: z.string().optional(),
  VERIFF_SHARED_SECRET: z.string().optional()
});

export const config = EnvSchema.parse(process.env);
