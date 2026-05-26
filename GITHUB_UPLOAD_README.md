# Market Strategy GitHub Upload

Generated: 2026-05-26T05:46:09+00:00

This ZIP is the clean GitHub repository upload.

## Upload this folder's contents as the repository root

When extracted, the repository root should contain:

```text
apps/
contracts/
db/
docs/
external/
infra/
packages/
scripts/
security/
services/
docker-compose.yml
README.md
```

## Locked LCE SDK artifact

The uploaded LCE SDK ZIP is included unchanged at:

```text
external/lce-sdk/market-strategy-lce-sdk-main.zip
```

SHA-256:

```text
d25ac66018311f7cf047bdce376bc88a070a0a761f3b1e25733bf8ddc13e6baf
```

Do not edit this ZIP. The platform integrates with it through:

```text
services/api/src/lce-sdk/
```

## First setup after upload

```bash
npm install
node scripts/install-lce-sdk.mjs
node scripts/verify-lce-sdk.mjs
docker compose up -d postgres redis clickhouse
```

Apply ClickHouse schema:

```bash
bash scripts/apply-clickhouse-schema.sh
```

Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/apply-clickhouse-schema.ps1
```

Backend:

```bash
cd services/api
npm install
npm run test
npm run dev
```

Frontend:

```bash
cd apps/web
npm install
npm run dev
```

Mobile:

```bash
cd apps/mobile
npm install
npm run start
```

## Important

This is an analytics/research trading platform foundation.

It does not safely enable real custody, trading execution, or smart contract deployment without professional legal, security, compliance, and audit review.


## Final QA fixes included

This package includes the final QA/Render hardening fixes:

- fixed `services/api/src/routes/reports.ts` route closure
- added `passwordHash` to Prisma `User`
- added `@types/jsonwebtoken`
- added JSX declaration for `w3m-button`
- included hidden files `.env.example` and `.github/workflows/ci.yml`
- added root `package.json` verification scripts
- added `render.yaml`

Recommended verification:

```bash
npm run verify:local
```


## Final QA report

See `FINAL_QA_REPORT.md` for the verification results and Render-safe deployment note.
