Write-Host "Phase 4 smoke test"
Write-Host "1. Health"
Invoke-RestMethod "http://localhost:8787/health"

Write-Host "2. Backfill status"
Invoke-RestMethod "http://localhost:8787/v1/backfill/status"

Write-Host "3. Backtest engines"
Invoke-RestMethod "http://localhost:8787/v1/backtest/engines"

Write-Host "4. Reports"
Invoke-RestMethod "http://localhost:8787/v1/reports"
