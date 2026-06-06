import { dakinisSubscribeEvent } from "./event-bus.js";
import { dakinisCreatePendingAction } from "../services/bos-store.js";
import { dakinisEmitFeatureEvent } from "../services/telemetry-store.js";
import { dakinisQueryAll } from "../db/query.js";

/** Automatizaciones IA: evento → decisión → acción pendiente. */
export function dakinisInitAutomationEngine() {
  dakinisSubscribeEvent("inventory.low", async (event) => {
    const tenantId = event.payload?.tenantId;
    if (!tenantId) return;

    const rules = await dakinisQueryAll(
      `SELECT * FROM tenant_automation_rules WHERE business_id = ? AND event_type = ? AND enabled = 1`,
      [tenantId, "inventory.low"]
    ).catch(() => []);

    const item = event.payload?.itemName || event.payload?.itemSlug || "insumo";
    const qty = Number(event.payload?.suggestedQty) || 15;
    dakinisEmitFeatureEvent(tenantId, null, "inventory.low_stock.alert", {
      itemSlug: event.payload?.itemSlug,
      suggestedQty: qty
    });

    if (rules.length === 0) {
      await dakinisCreatePendingAction(tenantId, {
        actionType: "stock_reorder",
        label: `IA: comprar ${qty} uds de ${item}`,
        payload: { quantity: qty, itemSlug: event.payload?.itemSlug, automated: true }
      });
      return;
    }

    for (const rule of rules) {
      let config = {};
      try {
        config = JSON.parse(rule.config_json || "{}");
      } catch {
        config = {};
      }
      const reorderQty = Number(config.quantity) || qty;
      await dakinisCreatePendingAction(tenantId, {
        actionType: rule.action_type || "stock_reorder",
        label: `Regla ${rule.event_type}: comprar ${reorderQty} uds`,
        payload: { quantity: reorderQty, itemSlug: event.payload?.itemSlug, ruleId: rule.id }
      });
    }
  });

  dakinisSubscribeEvent("crm.lead.created", async (event) => {
    const tenantId = event.payload?.tenantId;
    if (!tenantId) return;
    await dakinisCreatePendingAction(tenantId, {
      actionType: "crm_followup",
      label: "IA: contactar nuevo lead en 24h",
      payload: { recordId: event.payload?.recordId, automated: true }
    });
  });
}
