import WebSocket from "ws";
import type { FastifyBaseLogger } from "fastify";
import { config } from "../../config.js";
import { normalizeDydxMessage } from "../../market/normalizers/dydx.js";
import type { NormalizedMarketEvent } from "../../market/types.js";

type Handler = (events: NormalizedMarketEvent[]) => void;

export class DydxAdapter {
  private ws?: WebSocket;
  private reconnectTimer?: NodeJS.Timeout;
  private reconnectDelayMs = 1000;

  constructor(
    private readonly logger: FastifyBaseLogger,
    private readonly onEvents: Handler
  ) {}

  connect() {
    this.ws = new WebSocket(config.DYDX_WS_URL);

    this.ws.on("open", () => {
      this.logger.info("dYdX websocket connected");
      this.reconnectDelayMs = 1000;

      for (const market of ["BTC-USD", "ETH-USD", "SOL-USD"]) {
        this.subscribe("v4_trades", market);
        this.subscribe("v4_orderbook", market);
        this.subscribe("v4_candles", `${market}/1MIN`);
      }
    });

    this.ws.on("message", (data) => {
      const events = normalizeDydxMessage(JSON.parse(data.toString()));
      if (events.length > 0) this.onEvents(events);
    });

    this.ws.on("close", () => this.reconnect());
    this.ws.on("error", (err) => this.logger.error({ err }, "dYdX websocket error"));
  }

  private subscribe(channel: string, id: string) {
    const msg = {
      type: "subscribe",
      channel,
      id,
      batched: true
    };
    const send = () => this.ws?.send(JSON.stringify(msg));
    if (this.ws?.readyState === WebSocket.OPEN) send();
    else this.ws?.once("open", send);
  }

  private reconnect() {
    clearTimeout(this.reconnectTimer);
    this.logger.warn({ delay: this.reconnectDelayMs }, "dYdX websocket disconnected; reconnecting");
    this.ws = undefined;

    this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectDelayMs);
    this.reconnectDelayMs = Math.min(this.reconnectDelayMs * 2, 30_000);
  }
}
