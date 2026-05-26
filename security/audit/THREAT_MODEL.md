# Threat Model

## Assets

- User accounts
- Market data integrity
- Backtest/report integrity
- Treasury contracts
- Admin roles
- Custody workflow approvals
- API secrets
- Database credentials

## Threats

- Account takeover
- API abuse
- Market-data spoofing
- Backtest/report manipulation
- Privileged role compromise
- Withdrawal approval compromise
- Smart contract access-control error
- CI/CD secret leakage
- Database exfiltration

## Controls

- MFA for admins
- RBAC
- Rate limits
- Audit logging
- Multisig/timelock
- No private keys in app DB
- Separate hot/warm/cold policy
- Static analysis
- Deployment approvals
