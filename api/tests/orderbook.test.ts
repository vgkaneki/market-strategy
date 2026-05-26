import { describe, expect, it } from "vitest";
import { OrderBook } from "../src/market/OrderBook.js";

describe("OrderBook", () => {
  it("applies snapshots and deltas", () => {
    const book = new OrderBook();

    book.applySnapshot({
      seq: 1,
      ts: 1,
      bids: [["100", "1"], ["99", "2"]],
      asks: [["101", "1"], ["102", "2"]]
    });

    book.applyDelta({
      seq: 2,
      ts: 2,
      bids: [["100", "0"], ["98", "5"]],
      asks: [["101", "3"]]
    });

    const top = book.top(5);
    expect(top.bids).toEqual([["99", "2"], ["98", "5"]]);
    expect(top.asks[0]).toEqual(["101", "3"]);
  });

  it("ignores stale deltas", () => {
    const book = new OrderBook();

    book.applySnapshot({
      seq: 10,
      ts: 1,
      bids: [["100", "1"]],
      asks: [["101", "1"]]
    });

    book.applyDelta({
      seq: 9,
      ts: 2,
      bids: [["100", "0"]],
      asks: []
    });

    expect(book.top().bids[0]).toEqual(["100", "1"]);
  });
});
