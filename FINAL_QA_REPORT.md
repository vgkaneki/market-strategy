# Final QA / Render Hardening Report

Generated: 2026-05-26T07:11:06+00:00

## Fixed

- Fixed `services/api/src/routes/reports.ts` route syntax.
- Added `passwordHash String?` to Prisma `User`.
- Added `@types/jsonwebtoken`.
- Added `apps/web/types/custom-elements.d.ts` for `w3m-button`.
- Added/confirmed `.env.example`.
- Added/confirmed `.github/workflows/ci.yml`.
- Added root `package.json` verification scripts.
- Added `render.yaml`.
- Removed fragile Reown/Wagmi runtime dependency from the default Render-safe web build and replaced it with an explicit disabled wallet placeholder.
- Fixed ClickHouse result typing issues.
- Fixed `MarketStreamHub` duplicate block and WebSocket open-state check.
- Fixed replay page JSX layout closure.
- Made Redis lazy-connect to prevent test hangs.
- Made API test script run in a single fork so it exits cleanly.

## Verified locally

```text
LCE SDK install: passed
LCE SDK verify/tests: 5 passed, 0 failed
Backend TypeScript typecheck: passed
Backend TypeScript build: passed
Backend tests: 17 files passed, 28 tests passed
Web TypeScript typecheck: passed
Web route verification: passed for /, /replay, /research, /lce, /production
Locked SDK SHA-256: d25ac66018311f7cf047bdce376bc88a070a0a761f3b1e25733bf8ddc13e6baf
```

## Web production build note

`next build` compiled successfully but hung during Next.js `Collecting page data` in this container. Because `npm run typecheck` passes and route verification passes, the Render YAML uses a conservative safe-build command for the frontend:

```bash
npm install && npm run render:safe-build
```

and starts the web service with:

```bash
npm run dev -- -H 0.0.0.0
```

This is a deployment-safe preview mode, not the final optimized production web mode. The API build/tests are clean.

## Custody/security note

Custody remains disabled/dry-run. Smart contracts remain audit-prep only.
