use anyhow::Result;
use futures_util::{SinkExt, StreamExt};
use serde_json::json;
use tokio_tungstenite::connect_async;
use tracing::{error, info};

pub async fn run_dydx() -> Result<()> {
    let url = "wss://indexer.dydx.trade/v4/ws";
    let (mut ws, _) = connect_async(url).await?;
    info!("connected to dYdX");

    for market in ["BTC-USD", "ETH-USD", "SOL-USD"] {
        ws.send(json!({
            "type": "subscribe",
            "channel": "v4_orderbook",
            "id": market,
            "batched": true
        }).to_string().into()).await?;

        ws.send(json!({
            "type": "subscribe",
            "channel": "v4_trades",
            "id": market,
            "batched": true
        }).to_string().into()).await?;
    }

    while let Some(msg) = ws.next().await {
        match msg {
            Ok(frame) => {
                if frame.is_text() {
                    // TODO: normalize and publish to Redis/Redpanda/ClickHouse.
                    info!(payload = %frame.to_text()?, "dydx event");
                }
            }
            Err(err) => {
                error!(?err, "dydx websocket error");
                break;
            }
        }
    }

    Ok(())
}
