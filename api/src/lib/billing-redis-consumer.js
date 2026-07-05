import { createClient } from "redis";
import { dakinisPublishEvent } from "./event-bus.js";
import { dakinisStructuredLog } from "../api/structured-logger.js";

let started = false;

/**
 * Consume billing events from Redis list (published by dakinis-billing).
 * Omitido cuando DAKINIS_EVENT_BUS=bullmq (usa event-bus-bullmq-consumer).
 */
export function dakinisStartBillingRedisConsumer() {
  if (started) return;
  if (String(process.env.DAKINIS_EVENT_BUS || "").toLowerCase() === "bullmq") {
    dakinisStructuredLog({ level: "info", msg: "billing_redis_consumer_skipped", reason: "bullmq_mode" });
    return;
  }
  started = true;

  const url = String(process.env.REDIS_URL || "").trim();
  if (!url) {
    dakinisStructuredLog({ level: "info", msg: "billing_redis_consumer_skipped", reason: "no_redis" });
    return;
  }

  const queue = process.env.DAKINIS_EVENTS_QUEUE || "dakinis:events";
  /** @type {import("redis").RedisClientType | null} */
  let client = null;

  async function ensureClient() {
    if (client?.isOpen) return client;
    client = createClient({ url });
    client.on("error", (err) => console.error("[billing-consumer]", err.message));
    await client.connect();
    return client;
  }

  async function tick() {
    try {
      const redis = await ensureClient();
      const raw = await redis.rPop(queue);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const type = parsed.type || parsed.event;
      if (!type) return;

      await dakinisPublishEvent(type, parsed.payload || {});
    } catch (err) {
      dakinisStructuredLog({
        level: "warn",
        msg: "billing_redis_consumer_error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  setInterval(() => {
    tick().catch(() => {});
  }, 1500);

  dakinisStructuredLog({ level: "info", msg: "billing_redis_consumer_started", queue });
}
