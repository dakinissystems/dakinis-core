import { dakinisSubscribeEvent } from "./event-bus.js";
import { dakinisAuditLog } from "./audit-log.js";
import { dakinisStructuredLog } from "../api/structured-logger.js";

import { dakinisSyncBusinessPlanFromBilling } from "./billing-sync.js";

/**
 * Consumidores in-process (fase 1). Sustituibles por workers cuando escale.
 */
export function dakinisRegisterEventConsumers() {
  dakinisSubscribeEvent("tenant.created", async (ev) => {
    await dakinisAuditLog({
      action: "tenant.created",
      tenantId: ev.payload.tenantId,
      slug: ev.payload.slug
    });
    dakinisStructuredLog({ level: "info", msg: "consumer_analytics", event: ev.type });
  });

  dakinisSubscribeEvent("tenant.updated", async (ev) => {
    await dakinisAuditLog({ action: "tenant.updated", tenantId: ev.payload.tenantId });
  });

  dakinisSubscribeEvent("user.login", async (ev) => {
    await dakinisAuditLog({
      action: "user.login",
      userId: ev.payload.userId,
      tenantId: ev.payload.tenantId,
      source: ev.payload.source
    });
  });

  dakinisSubscribeEvent("booking.created", (ev) => {
    dakinisAuditLog({
      action: "booking.created",
      tenantId: ev.payload.tenantId,
      recordId: ev.payload.recordId
    });
  });

  dakinisSubscribeEvent("crm.lead.created", async (ev) => {
    await dakinisAuditLog({
      action: "crm.lead.created",
      tenantId: ev.payload.tenantId,
      recordId: ev.payload.recordId
    });
  });

  dakinisSubscribeEvent("message.sent", async (ev) => {
    await dakinisAuditLog({
      action: "message.sent",
      tenantId: ev.payload.tenantId,
      channel: ev.payload.channel
    });
  });

  dakinisSubscribeEvent("billing.payment_succeeded", async (ev) => {
    await dakinisSyncBusinessPlanFromBilling(ev.payload, "activate");
    await dakinisAuditLog({
      action: "billing.payment_succeeded",
      tenantId: ev.payload.businessId || ev.payload.tenantId,
      plan: ev.payload.plan
    });
  });

  dakinisSubscribeEvent("billing.payment_failed", async (ev) => {
    await dakinisSyncBusinessPlanFromBilling(ev.payload, "degrade");
    await dakinisAuditLog({
      action: "billing.payment_failed",
      tenantId: ev.payload.businessId || ev.payload.tenantId,
      status: ev.payload.status
    });
  });

  dakinisStructuredLog({ level: "info", msg: "event_consumers_registered" });
}
