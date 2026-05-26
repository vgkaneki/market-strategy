#!/usr/bin/env bash
set -euo pipefail

echo "Phase 4 smoke test"
curl -s "http://localhost:8787/health" | jq .
curl -s "http://localhost:8787/v1/backfill/status" | jq .
curl -s "http://localhost:8787/v1/backtest/engines" | jq .
curl -s "http://localhost:8787/v1/reports" | jq .
