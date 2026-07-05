/** @typedef {{ type: string, payload: Record<string, unknown>, ts: string }} DakinisDomainEvent */

const listeners = new Map();

/**
 * Ejecuta handlers in-process sin republicar a Redis/BullMQ.
 * Usado por el consumer BullMQ para evitar bucles.
 * @param {string} type
 * @param {Record<string, unknown>} payload
 */
export async function dakinisDispatchEventLocally(type, payload = {}) {
  const event = {
    type: String(type),
    payload,
    ts: new Date().toISOString(),
  };

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

  if (String(process.env.DAKINIS_EVENT_BUS || "").toLowerCase() === "bullmq") {
    try {
      const { publishPlatformEvent } = await import("@dakinis/shared-ai/event-bus");
      await publishPlatformEvent(type, payload, { source: "core" });
    } catch (err) {
      console.warn("[event-bus] bullmq publish failed:", err instanceof Error ? err.message : err);
    }
  }

  return dakinisDispatchEventLocally(type, payload);
}

/** @param {string} type @param {(event: DakinisDomainEvent) => void | Promise<void>} handler */
export function dakinisSubscribeEvent(type, handler) {
  const key = String(type);
  if (!listeners.has(key)) listeners.set(key, []);
  listeners.get(key).push(handler);
}
