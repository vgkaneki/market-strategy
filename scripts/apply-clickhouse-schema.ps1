$containerId = docker compose ps -q clickhouse
if (-not $containerId) {
  Write-Error "ClickHouse container not found. Run: docker compose up -d clickhouse"
  exit 1
}

Get-Content db/clickhouse/schema.sql | docker exec -i $containerId clickhouse-client --multiquery
Write-Host "ClickHouse schema applied."
