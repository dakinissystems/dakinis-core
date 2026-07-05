import { dakinisApiBaseUrl } from "./api.js";

let dakinisStripePlansCache = null;
let dakinisStripePlansCacheAt = 0;
const CACHE_MS = 60_000;

export async function dakinisFetchStripePlans() {
  const now = Date.now();
  if (dakinisStripePlansCache && now - dakinisStripePlansCacheAt < CACHE_MS) {
    return dakinisStripePlansCache;
  }
  const base = dakinisApiBaseUrl();
  const prefix = base ? `${base}/api` : "/api";
  const res = await fetch(`${prefix}/public/stripe/plans`);
  if (!res.ok) throw new Error("stripe_plans_unavailable");
  const json = await res.json();
  dakinisStripePlansCache = json?.data || json;
  dakinisStripePlansCacheAt = now;
  return dakinisStripePlansCache;
}

export function dakinisStripePaymentLinkUrl(paymentLink, { email } = {}) {
  if (!paymentLink) return null;
  try {
    const url = new URL(paymentLink);
    if (email) url.searchParams.set("prefilled_email", email);
    return url.toString();
  } catch {
    return paymentLink;
  }
}

export async function dakinisStartStripeCheckout({ plan, email, businessId, userId, token } = {}) {
  const base = dakinisApiBaseUrl();
  const prefix = base ? `${base}/api` : "/api";
  const headers = { "Content-Type": "application/json" };
  if (token && String(token).trim()) {
    headers.Authorization = `Bearer ${String(token).trim()}`;
  }
  const res = await fetch(`${prefix}/public/stripe/checkout-session`, {
    method: "POST",
    headers,
    body: JSON.stringify({ plan, email, businessId, userId })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message || "No se pudo iniciar el pago";
    throw new Error(msg);
  }
  const url = json?.data?.url || json?.url;
  if (!url) throw new Error("Stripe no devolvió URL de checkout");
  window.location.href = url;
}

export async function dakinisFetchStripeCheckoutSession(sessionId) {
  const base = dakinisApiBaseUrl();
  const prefix = base ? `${base}/api` : "/api";
  const res = await fetch(`${prefix}/public/stripe/session?session_id=${encodeURIComponent(sessionId)}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message || "Sesión no encontrada";
    throw new Error(msg);
  }
  return json?.data || json;
}
