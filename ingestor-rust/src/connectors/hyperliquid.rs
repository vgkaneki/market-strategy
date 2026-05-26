use anyhow::Result;
use futures_util::{SinkExt, StreamExt};
use serde_json::json;
use tokio_tungstenite::connect_async;
use tracing::{error, info};

pub async fn run_hyperliquid() -> Result<()> {
    let url = "wss://api.hyperliquid.xyz/ws";
    let (mut ws, _) = connect_async(url).await?;
    info!("connected to Hyperliquid");

    for coin in ["BTC", "ETH", "SOL"] {
        ws.send(json!({
            "method": "subscribe",
            "subscription": { "type": "l2Book", "coin": coin }
        }).to_string().into()).await?;

        ws.send(json!({
            "method": "subscribe",
            "subscription": { "type": "trades", "coin": coin }
        }).to_string().into()).await?;
    }

    while let Some(msg) = ws.next().await {
        match msg {
            Ok(frame) => {
                if frame.is_text() {
                    // TODO: normalize and publish to Redis/Redpanda/ClickHouse.
                    info!(payload = %frame.to_text()?, "hyperliquid event");
                }
            }
            Err(err) => {
                error!(?err, "hyperliquid websocket error");
                break;
            }
        }
    }

    Ok(())
}
