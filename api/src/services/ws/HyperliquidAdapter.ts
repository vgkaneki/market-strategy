import WebSocket from "ws";
import type { FastifyBaseLogger } from "fastify";
import { config } from "../../config.js";
import { normalizeHyperliquidMessage } from "../../market/normalizers/hyperliquid.js";
import type { NormalizedMarketEvent } from "../../market/types.js";

type Handler = (events: NormalizedMarketEvent[]) => void;

export class HyperliquidAdapter {
  private ws?: WebSocket;
  private reconnectTimer?: NodeJS.Timeout;
  private readonly requested = new Set<string>();
  private reconnectDelayMs = 1000;

  constructor(
    private readonly logger: FastifyBaseLogger,
    private readonly onEvents: Handler
  ) {}

  connect() {
    this.ws = new WebSocket(config.HYPERLIQUID_WS_URL);

    this.ws.on("open", () => {
      this.logger.info("Hyperliquid websocket connected");
      this.reconnectDelayMs = 1000;
      this.requested.clear();

      for (const coin of ["BTC", "ETH", "SOL"]) {
        this.subscribeBook(coin);
        this.subscribeTrades(coin);
        this.subscribeCandle(coin, "1m");
      }
    });

    this.ws.on("message", (data) => {
      const events = normalizeHyperliquidMessage(JSON.parse(data.toString()));
      if (events.length > 0) this.onEvents(events);
    });

    this.ws.on("close", () => this.reconnect());
    this.ws.on("error", (err) => {
      this.logger.error({ err }, "Hyperliquid websocket error");
    });
  }

  subscribeBook(coin: string) {
    this.sendOnce(`l2Book:${coin}`, {
      method: "subscribe",
      subscription: { type: "l2Book", coin }
    });
  }

  subscribeTrades(coin: string) {
    this.sendOnce(`trades:${coin}`, {
      method: "subscribe",
      subscription: { type: "trades", coin }
    });
  }

  subscribeCandle(coin: string, interval: string) {
    this.sendOnce(`candle:${coin}:${interval}`, {
      method: "subscribe",
      subscription: { type: "candle", coin, interval }
    });
  }

  private sendOnce(key: string, msg: unknown) {
    if (this.requested.has(key)) return;
    this.requested.add(key);

    const send = () => this.ws?.send(JSON.stringify(msg));
    if (this.ws?.readyState === WebSocket.OPEN) send();
    else this.ws?.once("open", send);
  }

  private reconnect() {
    clearTimeout(this.reconnectTimer);
    this.logger.warn({ delay: this.reconnectDelayMs }, "Hyperliquid websocket disconnected; reconnecting");
    this.ws = undefined;
    this.requested.clear();

    this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectDelayMs);
    this.reconnectDelayMs = Math.min(this.reconnectDelayMs * 2, 30_000);
  }
}
