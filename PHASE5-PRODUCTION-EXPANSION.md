# Phase 5 — Production Expansion: Auth, Custody Controls, Mobile, Heatmap Engine, Level Catalog, Reports, Deployment, Audit Prep

## Summary

Phase 5 expands the Market Strategy platform toward a production-ready analytics product.

It adds:

- Production authentication scaffolding
- Role-based access controls
- API session/JWT services
- Custody policy and approval workflow scaffolding
- Non-custodial/multisig treasury controls
- Mobile Expo app
- High-density liquidity heatmap engine
- Historical order book backfill/capture framework
- Expanded level engine catalog
- Exportable HTML/PDF report services
- Production deployment hardening
- Smart contract audit-prep tooling and checklist

## Critical scope notes

### Custody

This package includes **custody architecture and policy scaffolding**, not live fund movement.

Real custody requires:
- Licensed legal/compliance review
- KYC/AML program approval
- Sanctions controls
- Insurance/risk review
- MPC/HSM provider integration
- Withdrawal operations policy
- Incident response
- Independent security review

The default implementation is **disabled/dry-run**.

### Bookmap-style heatmap

This package does not copy Bookmap's proprietary UI or implementation.

It adds a proprietary high-density liquidity heatmap engine with similar product goals:
- Depth aggregation
- Liquidity intensity
- Decay
- Replay compatibility
- Tile generation
- GPU/WebGL rendering path

### Professional smart contract audit

This package does **not** claim to be a professional audit.

It includes:
- Audit-prep checklist
- Slither config
- Foundry/Hardhat test hooks
- Security review template
- Threat model template

A real professional audit must be completed by an independent smart contract audit firm.

## Major new folders

```text
apps/mobile/
infra/production/
security/audit/
services/api/src/auth/
services/api/src/custody/
services/api/src/orderbook-history/
services/api/src/heatmap/HighDensityHeatmapEngine.ts
services/api/src/levels/catalog/
```

## Recommended next validation order

1. Run backend tests.
2. Start API.
3. Test auth register/login/me.
4. Test custody dry-run policy endpoints.
5. Test backfill/report routes.
6. Open web `/research`.
7. Start mobile app.
8. Run audit-prep scripts.
9. Review production deployment manifests.
