/**
 * Core events worker — BullMQ consumer dakinis.events (Railway service separado opcional).
 * Uso: DAKINIS_EVENT_BUS=bullmq REDIS_URL=... node worker-events.js
 */
import "./src/load-env.js";
import { dakinisInitDb } from "./src/db/index.js";
import { dakinisRegisterEventConsumers } from "./src/lib/event-consumers.js";
import { dakinisStartBullMqEventsConsumer } from "./src/lib/event-bus-bullmq-consumer.js";

async function main() {
  if (String(process.env.DAKINIS_EVENT_BUS || "").toLowerCase() !== "bullmq") {
    console.error("[worker-events] Set DAKINIS_EVENT_BUS=bullmq");
    process.exit(1);
  }
  if (!process.env.REDIS_URL) {
    console.error("[worker-events] REDIS_URL required");
    process.exit(1);
  }

  await dakinisInitDb();
  dakinisRegisterEventConsumers();
  await dakinisStartBullMqEventsConsumer();
  console.log("[worker-events] BullMQ consumer running on dakinis.events");
}

main().catch((err) => {
  console.error("[worker-events] fatal", err);
  process.exit(1);
});
