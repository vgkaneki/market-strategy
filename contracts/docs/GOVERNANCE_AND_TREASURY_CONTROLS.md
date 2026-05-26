# Governance and Treasury Controls

Recommended production setup:

```text
Contracts
  ↓ admin/owner
TimelockController
  ↓ proposer/executor
Safe multisig
```

## Minimum recommendations

- 2-of-3 or 3-of-5 multisig for early stage.
- Timelock delay before privileged upgrades/actions.
- Separate pauser role from treasury role.
- Emergency pause documented.
- Treasury withdrawal policy documented.
- No single externally owned account should control treasury funds.
