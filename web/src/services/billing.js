import { dakinisTenantJsonFetch } from "./api.js";

export async function dakinisOpenBillingPortal(session, { returnUrl } = {}) {
  const json = await dakinisTenantJsonFetch("/api/billing/portal", session, {
    method: "POST",
    body: { returnUrl: returnUrl || (typeof window !== "undefined" ? window.location.href : undefined) },
  });
  const url = json?.data?.url;
  if (!url) {
    throw new Error("portal_url_missing");
  }
  window.location.href = url;
}

async function dakinisFetchTenantBillingSubscription(session) {
  const json = await dakinisTenantJsonFetch("/api/billing/subscription", session);
  return json?.data?.subscription || null;
}
