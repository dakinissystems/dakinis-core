import { dakinisNormalizeCommercialPlan } from "@dakinis/shared/catalog/plan-modules.js";
import { dakinisQueryOne, dakinisRun } from "../db/query.js";
import { dakinisSqlTimestampNow } from "../db/dialect.js";
import { dakinisEnsureSubscriptionRow } from "./bos-store.js";
import { dakinisStructuredLog } from "../api/structured-logger.js";

export const DAKINIS_TENANT_ACCESS_STATES = Object.freeze(["active", "degraded", "suspended", "closed"]);

export const DAKINIS_TENANT_ACCESS_REASONS = Object.freeze([
  "payment_past_due",
  "payment_canceled",
  "payment_unpaid",
  "admin_legal",
  "admin_abuse",
  "admin_fraud",
  "admin_contract",
  "admin_other"
]);

const DAKINIS_PAYMENT_OK_STRIPE = new Set(["active", "trialing"]);
const DAKINIS_PAYMENT_DEGRADE_STRIPE = new Set([
  "past_due",
  "unpaid",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "paused"
]);

function dakinisDefaultEntitledPlan(plan) {
  return dakinisNormalizeCommercialPlan(plan || "starter");
}

/** @param {Record<string, unknown>|null|undefined} row */
export function dakinisNormalizeAccessRow(row) {
  if (!row) {
    return {
      accessState: "active",
      accessReason: null,
      accessNote: null,
      entitledPlan: "starter",
      stripeStatus: "active",
      closedAt: null
    };
  }
  const entitled =
    row.entitled_plan != null && String(row.entitled_plan).trim()
      ? dakinisNormalizeCommercialPlan(row.entitled_plan)
      : dakinisDefaultEntitledPlan(row.plan);
  const accessState = DAKINIS_TENANT_ACCESS_STATES.includes(String(row.access_state))
    ? String(row.access_state)
    : "active";
  return {
    accessState,
    accessReason: row.access_reason ? String(row.access_reason) : null,
    accessNote: row.access_note ? String(row.access_note) : null,
    entitledPlan: entitled,
    stripeStatus: row.status ? String(row.status) : "active",
    closedAt: row.closed_at ? String(row.closed_at) : null
  };
}

export function dakinisEffectivePlanForAccess(access, businessPlan) {
  const entitled = access.entitledPlan || dakinisDefaultEntitledPlan(businessPlan);
  if (access.accessState === "degraded") return "starter";
  if (access.accessState === "active") {
    return dakinisNormalizeCommercialPlan(businessPlan || entitled);
  }
  return dakinisNormalizeCommercialPlan(businessPlan || entitled);
}

export async function dakinisLoadTenantSubscriptionAccess(businessId) {
  const row = await dakinisQueryOne(`SELECT * FROM tenant_subscriptions WHERE business_id = ?`, [businessId]);
  return dakinisNormalizeAccessRow(row);
}

async function dakinisPersistAccess(businessId, fields) {
  const nowExpr = dakinisSqlTimestampNow();
  await dakinisRun(
    `UPDATE tenant_subscriptions
     SET entitled_plan = COALESCE(?, entitled_plan),
         access_state = COALESCE(?, access_state),
         access_reason = ?,
         access_note = COALESCE(?, access_note),
         closed_at = ?,
         updated_at = ${nowExpr}
     WHERE business_id = ?`,
    [
      fields.entitledPlan ?? null,
      fields.accessState ?? null,
      fields.accessReason ?? null,
      fields.accessNote ?? null,
      fields.closedAt ?? null,
      businessId
    ]
  );
}

async function dakinisSyncBusinessPlan(businessId, plan) {
  const normalized = dakinisNormalizeCommercialPlan(plan);
  await dakinisRun(`UPDATE business SET plan = ? WHERE id = ?`, [normalized, businessId]);
  return normalized;
}

/**
 * Aplica degradación o restauración según estado Stripe + access_state admin.
 * @param {string} businessId
 * @param {{ stripeStatus?: string, entitledPlan?: string }} input
 */
export async function dakinisApplyPaymentAccessPolicy(businessId, input = {}) {
  const business = await dakinisQueryOne(`SELECT * FROM business WHERE id = ?`, [businessId]);
  if (!business) return { ok: false, reason: "business_not_found" };
  if (String(business.type).toLowerCase() === "platform") {
    return { ok: true, skipped: true };
  }

  await dakinisEnsureSubscriptionRow(business);
  const sub = await dakinisQueryOne(`SELECT * FROM tenant_subscriptions WHERE business_id = ?`, [businessId]);
  const access = dakinisNormalizeAccessRow(sub);

  if (access.accessState === "suspended" || access.accessState === "closed") {
    return { ok: true, skipped: true, accessState: access.accessState };
  }

  const stripeStatus = String(input.stripeStatus || access.stripeStatus || "active").toLowerCase();
  const entitledPlan = dakinisDefaultEntitledPlan(
    input.entitledPlan || access.entitledPlan || business.plan
  );

  let nextAccessState = "active";
  let nextReason = null;
  let effectivePlan = entitledPlan;

  if (DAKINIS_PAYMENT_OK_STRIPE.has(stripeStatus)) {
    nextAccessState = "active";
    effectivePlan = entitledPlan;
  } else if (DAKINIS_PAYMENT_DEGRADE_STRIPE.has(stripeStatus)) {
    nextAccessState = "degraded";
    nextReason =
      stripeStatus === "canceled"
        ? "payment_canceled"
        : stripeStatus === "unpaid"
          ? "payment_unpaid"
          : "payment_past_due";
    effectivePlan = "starter";
  }

  await dakinisRun(
    `UPDATE tenant_subscriptions
     SET status = ?, entitled_plan = ?, access_state = ?, access_reason = ?, updated_at = ${dakinisSqlTimestampNow()}
     WHERE business_id = ?`,
    [stripeStatus, entitledPlan, nextAccessState, nextReason, businessId]
  );
  await dakinisSyncBusinessPlan(businessId, effectivePlan);

  dakinisStructuredLog({
    level: "info",
    msg: "tenant_payment_access_applied",
    businessId,
    stripeStatus,
    accessState: nextAccessState,
    effectivePlan,
    entitledPlan
  });

  return {
    ok: true,
    accessState: nextAccessState,
    entitledPlan,
    effectivePlan,
    stripeStatus
  };
}

/**
 * @param {string} businessId
 * @param {{ action: string, reason?: string, note?: string }} input
 */
export async function dakinisApplyAdminTenantAccess(businessId, input) {
  const business = await dakinisQueryOne(`SELECT * FROM business WHERE id = ?`, [businessId]);
  if (!business) return { ok: false, reason: "business_not_found" };
  if (String(business.type).toLowerCase() === "platform") {
    return { ok: false, reason: "platform_account_protected" };
  }

  await dakinisEnsureSubscriptionRow(business);
  const action = String(input.action || "").toLowerCase();
  const reason = input.reason ? String(input.reason) : "admin_other";
  const note = typeof input.note === "string" ? input.note.trim().slice(0, 2000) : null;

  if (action === "suspend") {
    await dakinisPersistAccess(businessId, {
      accessState: "suspended",
      accessReason: DAKINIS_TENANT_ACCESS_REASONS.includes(reason) ? reason : "admin_other",
      accessNote: note,
      closedAt: null
    });
    dakinisStructuredLog({ level: "warn", msg: "tenant_admin_suspended", businessId, reason, note });
    return { ok: true, accessState: "suspended", reason };
  }

  if (action === "reactivate") {
    const sub = await dakinisQueryOne(`SELECT * FROM tenant_subscriptions WHERE business_id = ?`, [businessId]);
    const stripeStatus = String(sub?.status || "active").toLowerCase();
    await dakinisPersistAccess(businessId, {
      accessState: "active",
      accessReason: null,
      accessNote: note,
      closedAt: null
    });
    return dakinisApplyPaymentAccessPolicy(businessId, {
      stripeStatus,
      entitledPlan: sub?.entitled_plan || business.plan
    });
  }

  if (action === "close") {
    const closedSlug = `${business.slug}__closed_${Date.now().toString(36)}`.slice(0, 96);
    const nowExpr = dakinisSqlTimestampNow();
    await dakinisRun(`UPDATE business SET slug = ? WHERE id = ?`, [closedSlug, businessId]);
    await dakinisPersistAccess(businessId, {
      accessState: "closed",
      accessReason: DAKINIS_TENANT_ACCESS_REASONS.includes(reason) ? reason : "admin_other",
      accessNote: note,
      closedAt: new Date().toISOString()
    });
    await dakinisSyncBusinessPlan(businessId, "starter");
    dakinisStructuredLog({ level: "warn", msg: "tenant_admin_closed", businessId, reason, note, closedSlug });
    return { ok: true, accessState: "closed", slug: closedSlug, reason };
  }

  return { ok: false, reason: "invalid_action" };
}

export async function dakinisGetTenantAccessContext(businessId, businessPlan) {
  const access = await dakinisLoadTenantSubscriptionAccess(businessId);
  const effectivePlan = dakinisEffectivePlanForAccess(access, businessPlan);
  return {
    ...access,
    effectivePlan,
    degraded: access.accessState === "degraded",
    suspended: access.accessState === "suspended",
    closed: access.accessState === "closed"
  };
}
