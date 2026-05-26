# Security and Compliance Strategy

## 1. Core principle

Do not launch as a custodial exchange by default.

The first production version should be a **market-data, analytics, alerts, and non-custodial trading terminal**. Custody, pooled funds, broker routing, token sales, and revenue-sharing mechanisms can trigger licensing, securities, money transmission, commodities, tax, and consumer-protection requirements.

## 2. Compliance program

Required before handling customer assets or regulated order routing:

- Legal counsel by jurisdiction
- Terms of service
- Privacy policy
- Risk disclosures
- AML policy
- Sanctions policy
- Travel Rule policy where applicable
- Market manipulation monitoring
- Customer support and complaint handling
- Suspicious activity escalation workflow
- Record retention policy
- Incident response policy
- Data processing agreements with vendors

## 3. KYC/AML implementation

### Option A: Sumsub

Backend flow:

1. Create local user.
2. Create Sumsub applicant.
3. Generate access token / SDK token.
4. User completes verification in web/mobile.
5. Sumsub sends webhook.
6. Verify webhook signature.
7. Store status in `kyc_verifications`.
8. Unlock gated features based on status/risk.

Data to store locally:

- Provider user/applicant ID
- Verification level
- Review status
- Risk labels
- Timestamp
- Minimal metadata only
- Do not store identity documents unless legally required

### Option B: Veriff

Backend flow:

1. Create Veriff session.
2. Redirect user or open SDK.
3. Receive decision webhook.
4. Verify webhook signature.
5. Store normalized decision.
6. Gate features.

### KYC statuses

```text
not_started
pending
approved
rejected
resubmission_requested
expired
manual_review
```

### Feature gates

| Feature | KYC requirement |
|---|---|
| Public charts | None |
| Watchlists | Basic account |
| Alerts | Basic account |
| Wallet connect | None or lightweight screening |
| Trading integrations | KYC approved |
| Fiat on/off ramp | KYC + AML + sanctions |
| Custody/withdrawals | KYC + enhanced due diligence |

## 4. AML and sanctions controls

Add providers such as:

- Chainalysis
- TRM Labs
- Elliptic
- ComplyAdvantage

Minimum controls:

- Sanctions screening
- PEP screening
- Adverse media
- Wallet risk screening
- Transaction monitoring
- Withdrawal holds for high-risk flags
- Audit trail for compliance decisions

## 5. Wallet architecture

### Non-custodial default

- User connects wallet through Reown AppKit.
- User signs messages/transactions.
- Platform never receives private keys.
- Backend validates signatures and stores wallet ownership proof.

### Platform treasury/admin

- Use Safe multisig.
- Recommended threshold: 3-of-5 or 4-of-7.
- Separate signers by device, person, location, and role.
- Use hardware wallets.
- Enforce timelock for contract upgrades/admin changes.
- No single employee wallet should control contracts or funds.

### Hot/cold wallet model

Only relevant if custody is legally approved.

| Wallet tier | Purpose | Suggested allocation |
|---|---|---:|
| Hot | daily operational withdrawals | 1-3% |
| Warm | scheduled liquidity ops | 5-10% |
| Cold | reserves/treasury | 87-94% |

Controls:

- Hot wallet daily withdrawal limit.
- Warm wallet multisig approval.
- Cold wallet offline hardware custody.
- Address allowlists.
- Mandatory withdrawal delay for new addresses.
- Real-time anomaly alerts.
- Emergency pause.

## 6. Smart contract security

Required:

- OpenZeppelin base contracts
- Safe multisig owner
- Timelock for admin operations
- Pausable emergency stop
- ReentrancyGuard where transfers occur
- No upgradeability unless absolutely needed
- If upgradeable, use UUPS/transparency carefully and audit proxy storage
- Full unit tests
- Invariant/property tests
- Slither
- Mythril/Medusa/Echidna if applicable
- Independent audit

## 7. API security

### Authentication

- Passwordless email magic links or passkeys
- Optional SIWE/SIWX wallet login
- Short-lived JWT access token
- Refresh token rotation
- Device/session management
- 2FA for sensitive actions

### Authorization

- RBAC:
  - user
  - pro_user
  - compliance_admin
  - support_readonly
  - ops_admin
  - super_admin
- Every sensitive action logs to `audit_logs`.

### Rate limiting

Layers:

1. Cloudflare WAF/rate rules
2. API gateway
3. Fastify per-route limits
4. Redis-based user/IP limits
5. WebSocket connection/subscription limits
6. Exchange adapter vendor-rate protection

Suggested defaults:

| Endpoint | Limit |
|---|---:|
| Public REST | 240/min/IP |
| Login | 10/min/IP |
| KYC create session | 5/hour/user |
| Alerts create/update | 60/min/user |
| WebSocket connections | 20/IP |
| WebSocket subscriptions | 100/user |
| Admin actions | strict allowlist + 2FA |

## 8. DDoS protection

- Cloudflare proxy for web/API.
- Separate ingest services from public edge.
- No direct public access to internal stream bus.
- WebSocket handshake authentication.
- Drop idle sockets.
- Enforce max message size.
- Circuit breakers for downstream vendors.
- Autoscaling on API only, not uncontrolled ingestion.

## 9. Secrets management

Never store secrets in repo.

Use:

- AWS Secrets Manager / GCP Secret Manager / Doppler / Infisical
- Per-environment secrets
- Key rotation schedule
- Read-only runtime IAM
- No long-lived exchange keys in browser

## 10. Monitoring and incident response

Required alerts:

- WebSocket disconnect storms
- Message lag
- Out-of-order event rate
- DB write failures
- Alert engine backlog
- Login failure spikes
- KYC webhook signature failures
- Admin action anomalies
- Hot wallet movement
- Smart contract pause/unpause
- Contract ownership transfer
