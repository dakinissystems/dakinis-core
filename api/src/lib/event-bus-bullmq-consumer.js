import { dakinisDispatchEventLocally } from "./event-bus.js";
import { dakinisStructuredLog } from "../api/structured-logger.js";

let started = false;
/** @type {import('bullmq').Worker | null} */
let worker = null;

function isBullMqMode() {
  return (
    String(process.env.DAKINIS_EVENT_BUS || "").toLowerCase() === "bullmq" &&
    Boolean(String(process.env.REDIS_URL || "").trim())
  );
}

/**
 * Worker BullMQ en cola dakinis.events — despacha a consumidores in-process de Core.
 */
export async function dakinisStartBullMqEventsConsumer() {
  if (started || !isBullMqMode()) {
    if (!isBullMqMode()) {
      dakinisStructuredLog({ level: "info", msg: "bullmq_consumer_skipped", reason: "not_bullmq_mode" });
    }
    return;
  }
  started = true;

  try {
    const { createPlatformWorker } = await import("@dakinis/shared-ai/bullmq-bus");
    worker = await createPlatformWorker("default", async (event) => {
      const type = event?.event || event?.type;
      if (!type) return;
      await dakinisDispatchEventLocally(String(type), event.payload || {});
    });
    dakinisStructuredLog({ level: "info", msg: "bullmq_consumer_started", queue: "dakinis.events" });
  } catch (err) {
    started = false;
    dakinisStructuredLog({
      level: "error",
      msg: "bullmq_consumer_start_failed",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function dakinisStopBullMqEventsConsumer() {
  if (worker) {
    await worker.close();
    worker = null;
  }
  started = false;
}
