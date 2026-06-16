import { dakinisNormalizeCommercialPlan } from "@dakinis/shared/catalog/plan-modules.js";
import { dakinisQueryOne, dakinisRun } from "../db/query.js";
import { dakinisSqlTimestampNow } from "../db/dialect.js";
import { dakinisEnsureSubscriptionRow } from "./bos-store.js";
import { dakinisStripePlanFromPriceId } from "./stripe-config.js";
import { dakinisStructuredLog } from "../api/structured-logger.js";
import { dakinisApplyPaymentAccessPolicy } from "./tenant-access-store.js";

function dakinisIsoOrNull(value) {
  if (!value) return null;
  if (typeof value === "number") return new Date(value * 1000).toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export async function dakinisFindBusinessByOwnerEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return null;
  const user = await dakinisQueryOne(`SELECT * FROM users WHERE lower(email) = lower(?)`, [normalized]);
  if (!user?.business_id) return null;
  return dakinisQueryOne(`SELECT * FROM business WHERE id = ?`, [user.business_id]);
}

/**
 * @param {string} businessId
 * @param {{
 *   plan?: string,
 *   stripeCustomerId?: string|null,
 *   stripeSubscriptionId?: string|null,
 *   status?: string,
 *   periodStart?: string|number|null,
 *   periodEnd?: string|number|null
 * }} input
 */
export async function dakinisApplyStripeSubscriptionToBusiness(businessId, input) {
  const business = await dakinisQueryOne(`SELECT * FROM business WHERE id = ?`, [businessId]);
  if (!business) return { applied: false, reason: "business_not_found" };

  const plan = dakinisNormalizeCommercialPlan(input.plan || business.plan);
  const status = String(input.status || "active").trim() || "active";
  const periodStart = dakinisIsoOrNull(input.periodStart);
  const periodEnd = dakinisIsoOrNull(input.periodEnd);
  const customerId = input.stripeCustomerId ? String(input.stripeCustomerId) : null;
  const subscriptionId = input.stripeSubscriptionId ? String(input.stripeSubscriptionId) : null;

  await dakinisRun(`UPDATE business SET plan = ? WHERE id = ?`, [plan, businessId]);
  await dakinisEnsureSubscriptionRow({ ...business, plan });

  const nowExpr = dakinisSqlTimestampNow();
  await dakinisRun(
    `UPDATE tenant_subscriptions
     SET plan = ?, status = ?, stripe_customer_id = COALESCE(?, stripe_customer_id),
         stripe_subscription_id = COALESCE(?, stripe_subscription_id),
         entitled_plan = COALESCE(?, entitled_plan, ?),
         current_period_start = COALESCE(?, current_period_start),
         current_period_end = COALESCE(?, current_period_end),
         updated_at = ${nowExpr}
     WHERE business_id = ?`,
    [plan, status, customerId, subscriptionId, plan, plan, periodStart, periodEnd, businessId]
  );

  await dakinisApplyPaymentAccessPolicy(businessId, {
    stripeStatus: status,
    entitledPlan: plan
  });

  dakinisStructuredLog({
    level: "info",
    msg: "stripe_subscription_applied",
    businessId,
    plan,
    status,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId
  });

  return { applied: true, businessId, plan, status };
}

/** @param {import('stripe').Stripe.Subscription} subscription */
export function dakinisPlanFromStripeSubscription(subscription) {
  const metaPlan = subscription?.metadata?.dakinis_plan;
  if (metaPlan) return dakinisNormalizeCommercialPlan(metaPlan);
  const item = subscription?.items?.data?.[0];
  const priceId = item?.price?.id || item?.plan?.id;
  return dakinisStripePlanFromPriceId(priceId) || "starter";
}

/**
 * @param {{
 *   email?: string|null,
 *   businessId?: string|null,
 *   plan: string,
 *   stripeCustomerId?: string|null,
 *   stripeSubscriptionId?: string|null,
 *   status?: string,
 *   periodStart?: string|number|null,
 *   periodEnd?: string|number|null
 * }} input
 */
export async function dakinisSyncStripeSubscription(input) {
  let business = null;
  if (input.businessId) {
    business = await dakinisQueryOne(`SELECT * FROM business WHERE id = ?`, [input.businessId]);
  }
  if (!business && input.email) {
    business = await dakinisFindBusinessByOwnerEmail(input.email);
  }
  if (!business) {
    dakinisStructuredLog({
      level: "warn",
      msg: "stripe_subscription_unmatched",
      email: input.email || undefined,
      businessId: input.businessId || undefined,
      plan: input.plan
    });
    return { applied: false, reason: "no_matching_business" };
  }
  return dakinisApplyStripeSubscriptionToBusiness(business.id, input);
}
