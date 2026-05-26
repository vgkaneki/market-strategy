CREATE DATABASE IF NOT EXISTS market_strategy;

CREATE TABLE IF NOT EXISTS market_strategy.trades
(
    ts DateTime64(3, 'UTC'),
    exchange LowCardinality(String),
    symbol LowCardinality(String),
    trade_id String,
    side LowCardinality(String),
    price Decimal(38, 18),
    size Decimal(38, 18),
    received_at DateTime64(3, 'UTC') DEFAULT now64(3)
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(ts)
ORDER BY (exchange, symbol, ts, trade_id)
TTL ts + INTERVAL 90 DAY;

CREATE TABLE IF NOT EXISTS market_strategy.book_deltas
(
    ts DateTime64(3, 'UTC'),
    exchange LowCardinality(String),
    symbol LowCardinality(String),
    seq UInt64,
    side LowCardinality(String),
    price Decimal(38, 18),
    size Decimal(38, 18),
    action LowCardinality(String),
    received_at DateTime64(3, 'UTC') DEFAULT now64(3)
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(ts)
ORDER BY (exchange, symbol, ts, seq, side, price)
TTL ts + INTERVAL 30 DAY;

CREATE TABLE IF NOT EXISTS market_strategy.candles
(
    ts DateTime64(3, 'UTC'),
    exchange LowCardinality(String),
    symbol LowCardinality(String),
    interval LowCardinality(String),
    open Decimal(38, 18),
    high Decimal(38, 18),
    low Decimal(38, 18),
    close Decimal(38, 18),
    volume Decimal(38, 18),
    received_at DateTime64(3, 'UTC') DEFAULT now64(3)
)
ENGINE = ReplacingMergeTree(received_at)
PARTITION BY toYYYYMM(ts)
ORDER BY (exchange, symbol, interval, ts);

CREATE TABLE IF NOT EXISTS market_strategy.liquidity_levels
(
    ts DateTime64(3, 'UTC'),
    exchange LowCardinality(String),
    symbol LowCardinality(String),
    timeframe LowCardinality(String),
    level_type LowCardinality(String),
    side LowCardinality(String),
    price Decimal(38, 18),
    strength Float64,
    confidence Float64,
    metadata String
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(ts)
ORDER BY (exchange, symbol, timeframe, ts, level_type, price);

CREATE TABLE IF NOT EXISTS market_strategy.scanner_signals
(
    ts DateTime64(3, 'UTC'),
    symbol LowCardinality(String),
    timeframe LowCardinality(String),
    scanner LowCardinality(String),
    direction LowCardinality(String),
    score Float64,
    level_price Decimal(38, 18),
    invalidation_price Decimal(38, 18),
    target_price Decimal(38, 18),
    metadata String
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(ts)
ORDER BY (symbol, timeframe, scanner, ts);


CREATE TABLE IF NOT EXISTS market_strategy.heatmap_tiles
(
    ts DateTime64(3, 'UTC'),
    exchange LowCardinality(String),
    symbol LowCardinality(String),
    bucket_price Decimal(38, 18),
    bid_liquidity Decimal(38, 18),
    ask_liquidity Decimal(38, 18),
    intensity Float64,
    metadata String,
    received_at DateTime64(3, 'UTC') DEFAULT now64(3)
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(ts)
ORDER BY (exchange, symbol, ts, bucket_price)
TTL ts + INTERVAL 30 DAY;

CREATE TABLE IF NOT EXISTS market_strategy.replay_sessions
(
    id String,
    created_at DateTime64(3, 'UTC'),
    exchange LowCardinality(String),
    symbol LowCardinality(String),
    timeframe LowCardinality(String),
    start_ts DateTime64(3, 'UTC'),
    end_ts DateTime64(3, 'UTC'),
    metadata String
)
ENGINE = MergeTree
ORDER BY (exchange, symbol, created_at, id);

CREATE TABLE IF NOT EXISTS market_strategy.alert_events
(
    ts DateTime64(3, 'UTC'),
    user_id String,
    alert_rule_id String,
    symbol LowCardinality(String),
    condition LowCardinality(String),
    trigger_price Decimal(38, 18),
    message String,
    metadata String
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(ts)
ORDER BY (user_id, symbol, ts);

CREATE TABLE IF NOT EXISTS market_strategy.market_quality
(
    ts DateTime64(3, 'UTC'),
    exchange LowCardinality(String),
    symbol LowCardinality(String),
    metric LowCardinality(String),
    value Float64,
    metadata String
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(ts)
ORDER BY (exchange, symbol, metric, ts);


CREATE TABLE IF NOT EXISTS market_strategy.backfill_jobs
(
    id String,
    created_at DateTime64(3, 'UTC'),
    updated_at DateTime64(3, 'UTC'),
    exchange LowCardinality(String),
    symbol LowCardinality(String),
    interval LowCardinality(String),
    start_ts DateTime64(3, 'UTC'),
    end_ts DateTime64(3, 'UTC'),
    status LowCardinality(String),
    candles_inserted UInt64,
    error String,
    metadata String
)
ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (exchange, symbol, interval, id);

CREATE TABLE IF NOT EXISTS market_strategy.backtest_reports
(
    id String,
    created_at DateTime64(3, 'UTC'),
    exchange LowCardinality(String),
    symbol LowCardinality(String),
    interval LowCardinality(String),
    lookback UInt32,
    reaction_rate Float64,
    levels_generated UInt32,
    touches UInt32,
    wins UInt32,
    losses UInt32,
    timeouts UInt32,
    avg_mfe_bps Float64,
    avg_mae_bps Float64,
    report_json String
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(created_at)
ORDER BY (exchange, symbol, interval, created_at, id);

CREATE TABLE IF NOT EXISTS market_strategy.confluence_zones
(
    ts DateTime64(3, 'UTC'),
    exchange LowCardinality(String),
    symbol LowCardinality(String),
    zone_id String,
    side LowCardinality(String),
    low_price Decimal(38, 18),
    high_price Decimal(38, 18),
    score Float64,
    level_count UInt32,
    timeframes Array(String),
    engines Array(String),
    metadata String
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(ts)
ORDER BY (exchange, symbol, ts, score);
