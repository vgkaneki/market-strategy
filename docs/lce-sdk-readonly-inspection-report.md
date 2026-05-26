# LCE SDK Read-Only Inspection Report

## Uploaded ZIP

```text
market-strategy-lce-sdk-main.zip
```

## SHA-256

```text
d25ac66018311f7cf047bdce376bc88a070a0a761f3b1e25733bf8ddc13e6baf
```

## Result

The ZIP was inspected read-only and then copied unchanged into:

```text
external/lce-sdk/market-strategy-lce-sdk-main.zip
```

The copied artifact hash matches exactly.

## SDK package metadata

```json
{
  "name": "market-strategy-lce-sdk",
  "version": "1.1.1",
  "type": "module",
  "node": ">=20"
}
```

## SDK tests

The SDK's own test suite passed from a read-only extracted copy:

```text
5 tests
5 passed
0 failed
```

## Important integration decision

The platform does not rewrite the SDK.

Instead, the platform:
1. Installs/extracts a working copy beside the locked ZIP.
2. Dynamically imports the SDK modules.
3. Maps platform data into SDK input format.
4. Returns SDK Market Decision Engine output unchanged except for adding `source: "locked-lce-sdk"`.

## Preserved safety flags

```text
marketDataOnly: true
noOrderExecution: true
```
