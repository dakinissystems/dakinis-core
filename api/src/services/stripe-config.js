import { DAKINIS_COMMERCIAL_PLAN_KEYS } from "@dakinis/shared/catalog/plan-modules.js";

function dakinisTrimEnv(name) {
  return String(process.env[name] || "").trim();
}

/** @returns {string} */
export function dakinisStripeFrontendUrl() {
  const raw =
    dakinisTrimEnv("FRONTEND_URL") ||
    dakinisTrimEnv("CORS_ORIGIN") ||
    dakinisTrimEnv("FRONTEND_URLS").split(",")[0]?.trim() ||
    "https://core.dakinissystems.com";
  return raw.replace(/\/+$/, "");
}

export function dakinisStripeConfig() {
  const prices = Object.freeze({
    starter: dakinisTrimEnv("STRIPE_PRICE_STARTER_MONTHLY"),
    growth: dakinisTrimEnv("STRIPE_PRICE_GROWTH_MONTHLY"),
    pro: dakinisTrimEnv("STRIPE_PRICE_PRO_MONTHLY")
  });
  const paymentLinks = Object.freeze({
    starter: dakinisTrimEnv("STRIPE_PAYMENT_LINK_STARTER"),
    growth: dakinisTrimEnv("STRIPE_PAYMENT_LINK_GROWTH"),
    pro: dakinisTrimEnv("STRIPE_PAYMENT_LINK_PRO")
  });
  return Object.freeze({
    secretKey: dakinisTrimEnv("STRIPE_SECRET_KEY"),
    webhookSecret: dakinisTrimEnv("STRIPE_WEBHOOK_SECRET"),
    frontendUrl: dakinisStripeFrontendUrl(),
    prices,
    paymentLinks
  });
}

export function dakinisIsStripeConfigured() {
  return Boolean(dakinisStripeConfig().secretKey);
}

/** @param {string} planKey */
export function dakinisStripePriceIdForPlan(planKey) {
  const key = String(planKey || "").toLowerCase();
  if (!DAKINIS_COMMERCIAL_PLAN_KEYS.includes(key)) return "";
  return dakinisStripeConfig().prices[key] || "";
}

/** @param {string} priceId */
export function dakinisStripePlanFromPriceId(priceId) {
  const id = String(priceId || "").trim();
  if (!id) return null;
  const { prices } = dakinisStripeConfig();
  for (const plan of DAKINIS_COMMERCIAL_PLAN_KEYS) {
    if (prices[plan] === id) return plan;
  }
  return null;
}

export function dakinisStripePublicPlansPayload() {
  const { prices, paymentLinks } = dakinisStripeConfig();
  const plans = {};
  for (const key of DAKINIS_COMMERCIAL_PLAN_KEYS) {
    plans[key] = {
      priceId: prices[key] || null,
      paymentLink: paymentLinks[key] || null,
      checkoutAvailable: Boolean(prices[key]) || Boolean(paymentLinks[key])
    };
  }
  return {
    configured: dakinisIsStripeConfigured(),
    plans
  };
}
