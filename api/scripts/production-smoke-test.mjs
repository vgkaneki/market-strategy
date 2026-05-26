const base = process.env.API_BASE ?? "http://localhost:8787";

const paths = [
  "/health",
  "/v1/backtest/engines",
  "/v1/backfill/status",
  "/v1/reports"
];

for (const path of paths) {
  const res = await fetch(`${base}${path}`);
  console.log(path, res.status);
  if (!res.ok) process.exitCode = 1;
}
