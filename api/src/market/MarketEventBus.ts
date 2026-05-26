import type { FastifyBaseLogger } from "fastify";
import { EventEmitter } from "node:events";
import type { NormalizedMarketEvent } from "./types.js";
import { topicFor } from "./types.js";

export class MarketEventBus extends EventEmitter {
  constructor(private readonly logger: FastifyBaseLogger) {
    super();
  }

  publish(event: NormalizedMarketEvent) {
    const topic = topicFor(event);
    this.emit(topic, event);
    this.emit("*", topic, event);
  }

  publishMany(events: NormalizedMarketEvent[]) {
    for (const event of events) {
      try {
        this.publish(event);
      } catch (err) {
        this.logger.warn({ err, event }, "failed to publish market event");
      }
    }
  }
}
