/** @typedef {{ type: string, payload: Record<string, unknown>, ts: string }} DakinisDomainEvent */

const listeners = new Map();

/**
 * Bus de eventos in-process (fase 1). Sustituible por Redis Streams vía DAKINIS_EVENT_BUS=redis.
 * @param {string} type
 * @param {Record<string, unknown>} payload
 */
export async function dakinisPublishEvent(type, payload = {}) {
  const event = {
    type: String(type),
    payload,
    ts: new Date().toISOString()
  };

  if (String(process.env.DAKINIS_EVENT_BUS || "").toLowerCase() === "redis") {
    try {
      const { dakinisPublishRedisEvent } = await import("./event-bus-redis.js");
      await dakinisPublishRedisEvent(event);
    } catch (err) {
      console.warn("[event-bus] redis publish failed:", err instanceof Error ? err.message : err);
    }
  }

  const handlers = listeners.get(event.type) || [];
  for (const fn of handlers) {
    try {
      await fn(event);
    } catch (err) {
      console.error("[event-bus] handler error:", event.type, err);
    }
  }
  return event;
}

/** @param {string} type @param {(event: DakinisDomainEvent) => void | Promise<void>} handler */
export function dakinisSubscribeEvent(type, handler) {
  const key = String(type);
  if (!listeners.has(key)) listeners.set(key, []);
  listeners.get(key).push(handler);
}
