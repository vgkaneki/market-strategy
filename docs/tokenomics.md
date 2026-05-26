# Tokenomics Model

## Warning

A platform token may create securities, commodities, consumer-protection, tax, marketing, and exchange-listing obligations. Do not launch token sales, liquidity incentives, yield claims, profit-sharing, or buyback promises without legal review.

## Token

- Name: Market Strategy Token
- Symbol: MST
- Chain: EVM chain initially, preferably testnet first
- Total supply: 1,000,000,000 MST
- Decimals: 18
- Minting: fixed supply by default
- Burning: optional user burn or governance-approved burn only
- Admin: Safe multisig + timelock

## Distribution

| Bucket | Allocation | Tokens | Vesting |
|---|---:|---:|---|
| Community rewards | 30% | 300,000,000 | 48 months emissions, no guaranteed yield |
| Ecosystem/developer grants | 15% | 150,000,000 | 24-48 months milestone-based |
| Team | 18% | 180,000,000 | 12-month cliff, 36-month linear vest |
| Advisors | 5% | 50,000,000 | 6-month cliff, 24-month linear vest |
| Treasury | 20% | 200,000,000 | Multisig controlled |
| Initial liquidity | 7% | 70,000,000 | Locked 12-24 months |
| Strategic partners | 5% | 50,000,000 | 12-36 months |

## Mechanics

Recommended:

- Fixed max supply.
- No hidden mint function.
- No tax-on-transfer.
- No blacklist unless legally required and disclosed.
- Governance only after product-market fit.
- Utility should be access, discounts, governance, or staking for non-yield utility only after legal review.

Avoid:

- Promised profits.
- Revenue share.
- Guaranteed returns.
- Aggressive emissions that dilute users.
- Unaudited liquidity-lock contracts.

## Initial liquidity

Start with testnet simulations.

Production liquidity should use audited external AMMs and transparent lockups. The platform should not deploy a custom AMM unless there is a very strong reason and a full audit.
