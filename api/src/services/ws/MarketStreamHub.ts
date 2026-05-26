import type { FastifyBaseLogger } from "fastify";
import WebSocket, { type RawData } from "ws";
import { isSupportedExchange, toVenueSymbol } from "../../market/symbols.js";

type ClientState = {
  id: string;
  ip: string;
  ws: WebSocket;
  subscriptions: Set<string>;
  isAlive: boolean;
  lastMessageAt: number;
};

const ALLOWED_CHANNELS = new Set(["book", "trades", "candles", "status", "scanner", "heatmap"]);

export class MarketStreamHub {
  private clients = new Map<string, ClientState>();
  private ipConnectionCount = new Map<string, number>();

  constructor(private readonly logger: FastifyBaseLogger) {}

  addClient(id: string, ip: string, ws: WebSocket) {
    const currentIpCount = this.ipConnectionCount.get(ip) ?? 0;
    if (currentIpCount >= 20) {
      ws.send(JSON.stringify({ type: "error", error: "connection_limit_exceeded" }));
      ws.close();
      return;
    }

    this.ipConnectionCount.set(ip, currentIpCount + 1);

    const state: ClientState = {
      id,
      ip,
      ws,
      subscriptions: new Set(),
      isAlive: true,
      lastMessageAt: Date.now()
    };

    this.clients.set(id, state);

    ws.on("pong", () => {
      const current = this.clients.get(id);
      if (current) current.isAlive = true;
    });

    ws.on("message", (raw) => this.handleMessage(id, raw));
    ws.on("close", () => this.removeClient(id));
    ws.on("error", () => this.removeClient(id));

    ws.send(JSON.stringify({ type: "connected", id }));
  }

  heartbeat() {
    for (const [id, client] of this.clients) {
      if (!client.isAlive) {
        client.ws.terminate();
        this.removeClient(id);
        continue;
      }
      client.isAlive = false;
      client.ws.ping();
    }
  }

  broadcast(topic: string, payload: unknown) {
    const data = JSON.stringify({ topic, payload });
    for (const client of this.clients.values()) {
      if (client.subscriptions.has(topic) && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  }

  stats() {
    return {
      clients: this.clients.size,
      ips: this.ipConnectionCount.size,
      subscriptions: [...this.clients.values()].reduce((sum, c) => sum + c.subscriptions.size, 0)
    };
  }

  private removeClient(id: string) {
    const client = this.clients.get(id);
    if (!client) return;

    this.clients.delete(id);
    const ipCount = Math.max(0, (this.ipConnectionCount.get(client.ip) ?? 1) - 1);
    if (ipCount === 0) this.ipConnectionCount.delete(client.ip);
    else this.ipConnectionCount.set(client.ip, ipCount);
  }

  private handleMessage(id: string, raw: RawData) {
    const client = this.clients.get(id);
    if (!client) return;
    client.lastMessageAt = Date.now();

    if (Buffer.byteLength(raw.toString()) > 4096) {
      client.ws.send(JSON.stringify({ type: "error", error: "message_too_large" }));
      return;
    }

    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type !== "subscribe" && msg.type !== "unsubscribe") {
        client.ws.send(JSON.stringify({ type: "error", error: "invalid_message_type" }));
        return;
      }

      const exchange = String(msg.exchange ?? "");
      const channel = String(msg.channel ?? "");
      const symbol = String(msg.symbol ?? "");

      if (!isSupportedExchange(exchange) || !ALLOWED_CHANNELS.has(channel) || !symbol) {
        client.ws.send(JSON.stringify({ type: "error", error: "invalid_subscription" }));
        return;
      }

      const venueSymbol = toVenueSymbol(exchange, symbol);
      const topic =
        channel === "scanner"
          ? `scanner:liquidity_wall:${symbol.toUpperCase()}`
          : channel === "heatmap"
            ? `heatmap:${exchange}:${symbol.toUpperCase()}`
            : `${exchange}:${channel}:${venueSymbol}`;

      if (msg.type === "subscribe") {
        if (client.subscriptions.size >= 100) {
          client.ws.send(JSON.stringify({ type: "error", error: "subscription_limit_exceeded" }));
          return;
        }
        client.subscriptions.add(topic);
        client.ws.send(JSON.stringify({ type: "subscribed", topic }));
      } else {
        client.subscriptions.delete(topic);
        client.ws.send(JSON.stringify({ type: "unsubscribed", topic }));
      }
    } catch (err) {
      this.logger.warn({ err }, "invalid websocket message");
      client.ws.send(JSON.stringify({ type: "error", error: "invalid_json" }));
    }
  }
}
