# Edge Cases and Bugs to Avoid

## Market data

- Out-of-order WebSocket messages
- Duplicate trades
- Vendor reconnect sends fresh snapshot that conflicts with local delta state
- Missing sequence numbers
- Clock drift between exchanges
- Symbol naming mismatch: BTC vs BTC-USD vs BTCUSDT
- Contract size mismatch across venues
- Decimal precision loss from JavaScript numbers
- UI overload from too many book updates
- Heatmap memory leak from unbounded history
- Reconnection storms during vendor outage
- Backtest using future data accidentally
- Alert engine firing repeatedly on same condition

## Backend

- Unauthenticated WebSocket subscriptions
- Missing per-user subscription limit
- KYC webhook accepted without signature validation
- Admin action without audit log
- API key stored plaintext
- Redis unavailable causing open rate limit bypass
- SQL queries without pagination
- Unbounded query time ranges
- Missing idempotency keys for money movement
- Incorrect CORS origin

## Frontend

- Rendering every tick in React state
- Not batching market-data updates
- Using JavaScript number for price/size precision-sensitive values
- Blocking main thread with heatmap calculations
- Mobile canvas memory pressure
- Wallet connection state mismatch
- User sees stale exchange status as connected

## Smart contracts

- Single EOA owner
- No timelock on critical operations
- Upgradeable contract storage collisions
- Unbounded loops over users
- ERC20 transfer hooks causing paused vote updates to break unexpectedly
- Tokens sent to wrong contract without recovery method
- Role admin misconfiguration
- Liquidity unlocked too early
- No event emissions for treasury movement
