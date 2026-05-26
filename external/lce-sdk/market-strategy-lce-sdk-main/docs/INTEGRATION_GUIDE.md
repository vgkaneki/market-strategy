# Integration Guide

1. Normalize candles, order books, and trades.
2. Feed the data into the SDK.
3. Read `getZones(symbol)` or call `decideMarket(ctx)`.
4. Draw the returned zones and decision in your platform.

The charting platform should not contain the core decision logic. The SDK should.
