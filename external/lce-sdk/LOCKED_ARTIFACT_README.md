# Locked LCE SDK Artifact

This folder contains the uploaded LCE SDK ZIP as a locked external source artifact.

## File

```text
market-strategy-lce-sdk-main.zip
```

## SHA-256

```text
d25ac66018311f7cf047bdce376bc88a070a0a761f3b1e25733bf8ddc13e6baf
```

## Rule

Do not edit or rewrite this ZIP.

The platform integrates with it through a compatibility layer under:

```text
services/api/src/lce-sdk/
```

To use the SDK at runtime, run:

```bash
node scripts/install-lce-sdk.mjs
```

That extracts a working copy to:

```text
external/lce-sdk/market-strategy-lce-sdk-main/
```

The original ZIP remains unchanged.
