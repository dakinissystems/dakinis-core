/**
 * Redis Streams — event bus distribuido (opcional).
 * Env: REDIS_URL, DAKINIS_EVENT_STREAM=dakinis:events
 */

let redisClient = null;

async function getRedis() {
  if (redisClient) return redisClient;
  const url = String(process.env.REDIS_URL || "").trim();
  if (!url) throw new Error("REDIS_URL not set");
  const { createClient } = await import("redis");
  redisClient = createClient({ url });
  redisClient.on("error", (err) => console.error("[event-bus-redis]", err.message));
  await redisClient.connect();
  return redisClient;
}

export async function dakinisPublishRedisEvent(event) {
  const client = await getRedis();
  const stream = process.env.DAKINIS_EVENT_STREAM || "dakinis:events";
  await client.xAdd(stream, "*", {
    type: event.type,
    payload: JSON.stringify(event.payload || {}),
    ts: event.ts
  });
}
