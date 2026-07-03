import { dakinisParseCommercialPlanForStorage } from "@dakinis/shared/catalog/plan-modules.js";
import { dakinisQueryOne, dakinisRun } from "../db/query.js";
import { dakinisStructuredLog } from "../api/structured-logger.js";

/**
 * Sincroniza plan comercial en Core tras eventos billing (Redis / in-process).
 * @param {{ businessId?: string; tenantId?: string; plan?: string; status?: string }} payload
 * @param {"activate"|"degrade"} mode
 */
export async function dakinisSyncBusinessPlanFromBilling(payload, mode) {
  const businessId = payload.businessId || payload.tenantId;
  if (!businessId) return { ok: false, reason: "missing_business_id" };

  const business = await dakinisQueryOne("SELECT id, plan FROM business WHERE id = ?", [businessId]);
  if (!business) {
    dakinisStructuredLog({
      level: "warn",
      msg: "billing_sync_unknown_business",
      businessId,
    });
    return { ok: false, reason: "business_not_found" };
  }

  if (mode === "activate") {
    const planParsed = dakinisParseCommercialPlanForStorage(payload.plan || business.plan);
    if (!planParsed) return { ok: false, reason: "invalid_plan" };

    await dakinisRun("UPDATE business SET plan = ? WHERE id = ?", [planParsed, businessId]);
    await dakinisUpsertTenantSubscriptionRow({
      businessId,
      plan: planParsed,
      status: payload.status || "active",
      accessState: "active",
      accessReason: null,
      entitledPlan: planParsed,
      stripeCustomerId: payload.stripeCustomerId || null,
      stripeSubscriptionId: payload.stripeSubscriptionId || null,
    });

    return { ok: true, businessId, plan: planParsed, accessState: "active" };
  }

  const entitled = dakinisParseCommercialPlanForStorage(business.plan) || business.plan || "starter";
  await dakinisRun("UPDATE business SET plan = ? WHERE id = ?", ["starter", businessId]);
  await dakinisUpsertTenantSubscriptionRow({
    businessId,
    plan: "starter",
    status: payload.status || "past_due",
    accessState: "degraded",
    accessReason: "payment_past_due",
    entitledPlan: entitled,
    stripeCustomerId: payload.stripeCustomerId || null,
    stripeSubscriptionId: payload.stripeSubscriptionId || null,
  });

  return { ok: true, businessId, plan: "starter", accessState: "degraded", entitledPlan: entitled };
}

/**
 * @param {{
 *   businessId: string;
 *   plan: string;
 *   status: string;
 *   accessState: string;
 *   accessReason: string | null;
 *   entitledPlan: string;
 *   stripeCustomerId?: string | null;
 *   stripeSubscriptionId?: string | null;
 * }} row
 */
async function dakinisUpsertTenantSubscriptionRow(row) {
  const updatedAt = new Date().toISOString();
  const exists = await dakinisQueryOne(
    "SELECT business_id FROM tenant_subscriptions WHERE business_id = ?",
    [row.businessId]
  );

  if (!exists) {
    await dakinisRun(
      `INSERT INTO tenant_subscriptions (
         business_id, plan, status, stripe_customer_id, stripe_subscription_id,
         entitled_plan, access_state, access_reason, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.businessId,
        row.plan,
        row.status,
        row.stripeCustomerId || null,
        row.stripeSubscriptionId || null,
        row.entitledPlan,
        row.accessState,
        row.accessReason,
        updatedAt,
      ]
    );
    return;
  }

  await dakinisRun(
    `UPDATE tenant_subscriptions SET
       plan = ?,
       status = ?,
       stripe_customer_id = COALESCE(?, stripe_customer_id),
       stripe_subscription_id = COALESCE(?, stripe_subscription_id),
       entitled_plan = ?,
       access_state = ?,
       access_reason = ?,
       updated_at = ?
     WHERE business_id = ?`,
    [
      row.plan,
      row.status,
      row.stripeCustomerId || null,
      row.stripeSubscriptionId || null,
      row.entitledPlan,
      row.accessState,
      row.accessReason,
      updatedAt,
      row.businessId,
    ]
  );
}
