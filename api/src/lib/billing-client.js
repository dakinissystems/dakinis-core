/**
 * Cliente HTTP hacia dakinis-billing (sin SDK Stripe en Core).
 */

function dakinisBillingBaseUrl() {
  const direct = (process.env.DAKINIS_BILLING_URL || "").replace(/\/$/, "");
  if (direct) return direct;
  const gateway = (process.env.DAKINIS_GATEWAY_URL || "").replace(/\/$/, "");
  if (gateway) return `${gateway}/billing`;
  return "http://dakinis-billing.railway.internal:4080";
}

function dakinisBillingHeaders() {
  const headers = { Accept: "application/json", "Content-Type": "application/json" };
  const key =
    process.env.DAKINIS_INTERNAL_API_KEY ||
    process.env.DAKINIS_INTERNAL_SERVICE_KEY ||
    process.env.INTERNAL_API_KEY ||
    "";
  if (key) {
    headers.Authorization = `Bearer ${key}`;
    headers["X-Internal-Api-Key"] = key;
  }
  return headers;
}

/**
 * @param {string} path
 * @param {RequestInit} [init]
 */
export async function dakinisBillingRequest(path, init = {}) {
  const url = `${dakinisBillingBaseUrl()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: { ...dakinisBillingHeaders(), ...(init.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function dakinisBillingPlans() {
  return dakinisBillingRequest("/v1/plans");
}

/**
 * @param {{ plan: string; email?: string; businessId?: string; userId?: string }} body
 */
export async function dakinisBillingCreateCheckout(body) {
  const frontend = (process.env.FRONTEND_URL || process.env.CORE_WEB_URL || "").replace(/\/$/, "");
  return dakinisBillingRequest("/v1/checkout", {
    method: "POST",
    body: JSON.stringify({
      plan: body.plan,
      planId: body.plan,
      email: body.email,
      businessId: body.businessId,
      tenantId: body.businessId,
      userId: body.userId,
      successUrl: frontend
        ? `${frontend}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
        : undefined,
      cancelUrl: frontend ? `${frontend}/precios` : undefined,
    }),
  });
}

/** @param {string} sessionId */
export async function dakinisBillingGetCheckoutSession(sessionId) {
  return dakinisBillingRequest(`/v1/checkout/sessions/${encodeURIComponent(sessionId)}`);
}

/** @param {string} sessionId */
export async function dakinisBillingSyncCheckoutSession(sessionId) {
  return dakinisBillingRequest(`/v1/checkout/sessions/${encodeURIComponent(sessionId)}/sync`, {
    method: "POST",
    body: "{}",
  });
}

/** @param {string} businessId */
export async function dakinisBillingGetSubscription(businessId) {
  return dakinisBillingRequest(`/v1/subscriptions/${encodeURIComponent(businessId)}`);
}

/** @param {{ userId: string; returnUrl?: string }} body */
export async function dakinisBillingCreatePortal(body) {
  return dakinisBillingRequest("/v1/portal", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function dakinisBillingConfigured() {
  return Boolean(process.env.DAKINIS_BILLING_URL || process.env.DAKINIS_GATEWAY_URL);
}
