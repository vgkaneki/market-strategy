# Phase 5 Production Readiness Checklist

## Authentication

- [ ] Password hashing uses memory-hard hashing.
- [ ] JWT/session secret is strong and rotated.
- [ ] Refresh token strategy is finalized.
- [ ] MFA is enabled for admin roles.
- [ ] Rate limits exist on login/register.
- [ ] Auth audit events are stored.
- [ ] RBAC is enforced on sensitive routes.

## Custody

- [ ] Custody remains disabled until legal/compliance approval.
- [ ] All withdrawal requests require multi-approval.
- [ ] Hot wallet limit is enforced.
- [ ] Cold wallet movement requires out-of-band approval.
- [ ] Treasury admin uses multisig.
- [ ] No private keys are stored in the application database.
- [ ] MPC/HSM provider is selected and security-reviewed.

## Heatmap

- [ ] Heatmap intensity matches known replay samples.
- [ ] Large order spoofing does not overstate signal quality.
- [ ] Rendering is batched and GPU accelerated.
- [ ] Historical order book data source is defined.
- [ ] Captured live order book data can replay.

## Backtesting and Reports

- [ ] No-lookahead tests pass.
- [ ] Walk-forward validation exists before public claims.
- [ ] Reports show assumptions and limitations.
- [ ] Exported HTML/PDF reports include disclaimers.
- [ ] Level-by-level performance ranking is included.

## Smart Contracts

- [ ] Slither passes or findings are documented.
- [ ] All roles are reviewed.
- [ ] Timelock/multisig controls are configured.
- [ ] Tests cover pause/unpause, roles, treasury withdrawal, rescue paths.
- [ ] External professional audit completed before deployment.
