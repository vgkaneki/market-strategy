# Market Decision Engine

The Market Decision Engine is the layer where all registered engines come together.

It does not replace the individual engines. Each engine remains modular and produces normalized outputs. The Market Decision Engine ranks and combines those outputs into one trader-facing decision.

## Registered engine categories

```txt
liquidity-level-engine
structural-swing-pivot-engine
exported-levels-engine
real-level-engines-bundle
orderbook-wall-engine
trade-tape-engine
absorption-engine
dom-engine
confluence-optimizer
replay-validation-engine
forward-proof-engine
data-health-engine
multi-exchange-source-status-engine
```

## Outputs

```txt
Strong Demand Zone
Strong Supply Zone
Watch Zone
No Clean Edge
Low Quality Data
Forward-Proof Pending
```
