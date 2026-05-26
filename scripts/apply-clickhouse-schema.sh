#!/usr/bin/env bash
set -euo pipefail

CONTAINER_ID="$(docker compose ps -q clickhouse)"
if [ -z "$CONTAINER_ID" ]; then
  echo "ClickHouse container not found. Run: docker compose up -d clickhouse"
  exit 1
fi

cat db/clickhouse/schema.sql | docker exec -i "$CONTAINER_ID" clickhouse-client --multiquery
echo "ClickHouse schema applied."
