import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import {
  dakinisBillingCreatePortal,
  dakinisBillingGetSubscription,
} from "../lib/billing-client.js";
import { dakinisSyncBusinessPlanFromBilling } from "../lib/billing-sync.js";

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

function dakinisRequireInternalKey(req) {
  const expected = String(
    process.env.DAKINIS_INTERNAL_SERVICE_KEY ||
      process.env.DAKINIS_INTERNAL_API_KEY ||
      process.env.INTERNAL_API_KEY ||
      ""
  ).trim();
  if (!expected) {
    return dakinisJsonError(503, "SERVICE_AUTH_NOT_CONFIGURED", "Internal API key no configurada");
  }
  const header = String(req.headers.authorization || "");
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const alt = String(req.headers["x-internal-api-key"] || "").trim();
  if (token !== expected && alt !== expected) {
    return dakinisJsonError(401, "UNAUTHORIZED", "Token interno invalido");
  }
  return null;
}

export async function dakinisHandleInternalBillingSync(req, rawBody) {
  const authErr = dakinisRequireInternalKey(req);
  if (authErr) return authErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }

  const event = body.event || body.type;
  const payload = body.payload || body;
  const mode =
    event === "billing.payment_succeeded" ||
    event === "billing.checkout.completed" ||
    payload.status === "active" ||
    payload.status === "trialing"
      ? "activate"
      : "degrade";

  const result = await dakinisSyncBusinessPlanFromBilling(payload, mode);
  if (!result.ok) {
    return dakinisJsonError(404, "SYNC_FAILED", result.reason || "sync_failed");
  }

  return dakinisJsonSuccess({ synced: true, ...result }, "custom");
}

export async function dakinisHandleTenantBillingSubscription(req) {
  const business = req.dakinisBusiness;
  const proxied = await dakinisBillingGetSubscription(business.id);
  const accessState = business.access_state || "active";
  const entitledPlan = business.entitled_plan || business.plan;

  if (!proxied.ok) {
    return dakinisJsonSuccess(
      {
        subscription: {
          businessId: business.id,
          planId: business.plan,
          status: business.subscription_status || "unknown",
          accessState,
          accessReason: business.access_reason || null,
          entitledPlan,
          source: "core",
        },
      },
      business.type,
      { businessId: business.id }
    );
  }

  return dakinisJsonSuccess(
    {
      subscription: {
        businessId: business.id,
        planId: proxied.data?.planId || business.plan,
        status: proxied.data?.status,
        currentPeriodEnd: proxied.data?.currentPeriodEnd,
        stripeSubscriptionId: proxied.data?.stripeSubscriptionId,
        accessState,
        accessReason: business.access_reason || null,
        entitledPlan,
        source: "billing",
      },
    },
    business.type,
    { businessId: business.id }
  );
}

export async function dakinisHandleTenantBillingPortal(req, rawBody) {
  const business = req.dakinisBusiness;
  const auth = req.dakinisAuth;
  if (!auth?.userId) {
    return dakinisJsonError(401, "UNAUTHORIZED", "Usuario requerido");
  }

  const body = dakinisParseJson(rawBody);
  const returnUrl =
    (typeof body?.returnUrl === "string" && body.returnUrl) ||
    process.env.FRONTEND_URL ||
    process.env.CORE_WEB_URL ||
    undefined;

  const proxied = await dakinisBillingCreatePortal({
    userId: auth.userId,
    returnUrl,
  });

  if (!proxied.ok) {
    return dakinisJsonError(
      proxied.status === 404 ? 404 : 502,
      "PORTAL_UNAVAILABLE",
      proxied.data?.error || "Portal de facturacion no disponible"
    );
  }

  return dakinisJsonSuccess({ url: proxied.data?.url }, business.type, { businessId: business.id });
}
