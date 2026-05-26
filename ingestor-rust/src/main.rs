mod connectors;

use anyhow::Result;
use connectors::hyperliquid::run_hyperliquid;
use connectors::dydx::run_dydx;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    let hl = tokio::spawn(async { run_hyperliquid().await });
    let dydx = tokio::spawn(async { run_dydx().await });

    let _ = tokio::try_join!(hl, dydx)?;
    Ok(())
}
