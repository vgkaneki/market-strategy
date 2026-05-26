# LCE SDK Compatibility Map

## SDK package → platform usage

| SDK package | Platform compatibility use |
|---|---|
| `lce-core` | Normalize candles, order books, trades; create LCE zones |
| `lce-adapters` | Optional exchange payload normalization helpers |
| `lce-engines` | Required registered engine IDs and normalized engine outputs |
| `lce-market-decision` | Final decision layer |
| `lce-replay` | JSONL recorder/replay helper |
| `lce-validation` | Formation/holdout and forward-touch validation |

## Platform data → SDK context

| Platform field | SDK field |
|---|---|
| `BTC-USD` | `BTC` through SDK `normalizeSymbol` |
| `NormalizedMarketEvent.trade` | SDK `trades[]` |
| `NormalizedBookSnapshot/Delta` | SDK `book` |
| ClickHouse `candles` rows | SDK `candles[]` |
| Platform timeframe `1m/15m/1h/4h` | SDK timeframe |

## SDK decision → platform output

The SDK returns:

```json
{
  "decision": "Strong Demand Zone | Strong Supply Zone | Watch Zone | No Clean Edge",
  "confidence": 0,
  "zoneLow": null,
  "zoneHigh": null,
  "enginesUsed": [],
  "marketDataOnly": true,
  "noOrderExecution": true
}
```

The platform displays this in the LCE panel and can also save it inside research/report flows later.
