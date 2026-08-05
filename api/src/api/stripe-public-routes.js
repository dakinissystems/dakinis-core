import { dakinisParseCommercialPlanForStorage } from "@dakinis/shared/catalog/plan-modules.js";
import { dakinisQueryOne, dakinisRun } from "../db/query.js";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { dakinisDecodeTenantFromJwt } from "../middleware/auth.js";
import {
  dakinisBillingCreateCheckout,
  dakinisBillingGetCheckoutSession,
  dakinisBillingSyncCheckoutSession,
  dakinisBillingPlans,
} from "../lib/billing-client.js";

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

export async function dakinisHandlePublicStripePlans() {
  const proxied = await dakinisBillingPlans();
  if (!proxied.ok) {
    return dakinisJsonSuccess(
      {
        configured: false,
        plans: {},
        billingReachable: false,
      },
      "custom"
    );
  }

  return dakinisJsonSuccess(
    {
      configured: Boolean(proxied.data?.configured),
      plans: proxied.data?.plans || {},
      billingReachable: true,
    },
    "custom"
  );
}

export async function dakinisHandlePublicStripeCheckoutSession(req, rawBody) {
  const body = dakinisParseJson(rawBody);
  if (body === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }

  const jwtIdentity = await dakinisDecodeTenantFromJwt(req);
  if (!jwtIdentity?.tenantId) {
    return dakinisJsonError(401, "UNAUTHORIZED", "Authorization: Bearer con JWT de tenant requerido");
  }

  const plan = typeof body.plan === "string" ? body.plan.trim() : "";
  const planParsed = dakinisParseCommercialPlanForStorage(plan);
  if (!planParsed) {
    return dakinisJsonError(400, "INVALID_PLAN", "plan debe ser starter, growth o pro");
  }

  const claimedBusinessId =
    (typeof body.businessId === "string" ? body.businessId.trim() : "") ||
    String(req.headers["x-business-id"] || "").trim();
  if (claimedBusinessId && claimedBusinessId !== jwtIdentity.tenantId) {
    return dakinisJsonError(403, "TENANT_MISMATCH", "El JWT no corresponde al tenant solicitado", {
      expectedTenantId: jwtIdentity.tenantId
    });
  }

  const email =
    (typeof body.email === "string" ? body.email.trim() : "") || jwtIdentity.email || undefined;
  const resolvedBusinessId = jwtIdentity.tenantId;
  const userId =
    (typeof body.userId === "string" ? body.userId.trim() : "") || jwtIdentity.userId || undefined;

  const proxied = await dakinisBillingCreateCheckout({
    plan: planParsed,
    email,
    businessId: resolvedBusinessId,
    userId,
  });

  if (!proxied.ok) {
    const message =
      proxied.data?.error ||
      proxied.data?.message ||
      "No se pudo iniciar el checkout con billing";
    return dakinisJsonError(proxied.status >= 400 ? proxied.status : 502, "BILLING_ERROR", message);
  }

  return dakinisJsonSuccess(
    {
      url: proxied.data?.url,
      sessionId: proxied.data?.sessionId,
    },
    "custom"
  );
}

export async function dakinisHandlePublicStripeSessionLookup(req, sessionId) {
  const id = typeof sessionId === "string" ? sessionId.trim() : "";
  if (!id) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "session_id requerido");
  }

  const jwtIdentity = await dakinisDecodeTenantFromJwt(req);
  if (!jwtIdentity?.tenantId) {
    return dakinisJsonError(401, "UNAUTHORIZED", "Authorization: Bearer con JWT de tenant requerido");
  }

  const proxied = await dakinisBillingGetCheckoutSession(id);
  if (!proxied.ok) {
    return dakinisJsonError(
      proxied.status === 404 ? 404 : 502,
      "SESSION_NOT_FOUND",
      "Sesion de checkout no encontrada"
    );
  }

  const session = proxied.data || {};
  let syncResult = null;

  if (session.businessId && session.businessId !== jwtIdentity.tenantId) {
    return dakinisJsonError(403, "TENANT_MISMATCH", "La sesion no pertenece a este tenant");
  }

  const paid = session.paymentStatus === "paid" || session.status === "complete";
  if (paid && session.businessId && session.businessId === jwtIdentity.tenantId) {
    const synced = await dakinisBillingSyncCheckoutSession(id);
    if (synced.ok) {
      syncResult = synced.data;
    }
  }

  return dakinisJsonSuccess(
    {
      plan: session.plan,
      paymentStatus: session.paymentStatus,
      status: session.status,
      businessId: session.businessId,
      synced: syncResult?.ok === true,
      sync: syncResult,
    },
    "custom"
  );
}
