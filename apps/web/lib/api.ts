export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8787";

export function createMarketSocket() {
  const url = API_BASE.replace("http", "ws") + "/v1/ws";
  return new WebSocket(url);
}
