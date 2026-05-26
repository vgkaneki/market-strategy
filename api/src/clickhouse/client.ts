import { createClient } from "@clickhouse/client";
import { config } from "../config.js";

export const clickhouse = createClient({
  url: config.CLICKHOUSE_URL,
  username: config.CLICKHOUSE_USER,
  password: config.CLICKHOUSE_PASSWORD ?? "",
  database: config.CLICKHOUSE_DATABASE,
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 0
  }
});
