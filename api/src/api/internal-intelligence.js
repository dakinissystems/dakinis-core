import { dakinisQueryOne } from "../db/query.js";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { dakinisRequireServiceAuth } from "../middleware/service-auth.js";
import {
  dakinisAnalyticsInactiveCrm,
  dakinisAnalyticsSlowProducts,
  dakinisAnalyticsSupplierOverview,
  dakinisAnalyticsExpiringLots
} from "./tenant-intelligence-analytics.js";
import { dakinisGatherTenantSignals } from "./tenant-signals.js";

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

async function dakinisResolveServiceBusiness(businessId) {
  return dakinisQueryOne(`SELECT id, slug, name, type, plan FROM business WHERE id = ?`, [businessId]);
}

/**
 * Rutas internas para tools del agente Dakinis AI (no JWT de tenant).
 * @returns {Promise<{status:number, body:object}|null>}
 */
export async function dakinisHandleInternalIntelligenceRoute(req, rawBody, path) {
  const authErr = dakinisRequireServiceAuth(req);
  if (authErr) {
    return { status: authErr.status, body: authErr.body };
  }

  const business = await dakinisResolveServiceBusiness(req.dakinisService.businessId);
  if (!business) {
    return dakinisJsonError(404, "NOT_FOUND", "Negocio no encontrado");
  }

  const body = dakinisParseJson(rawBody);
  if (body === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }

  const meta = { businessId: business.id, businessSlug: business.slug };

  if (req.method === "POST" && path === "/api/internal/intelligence/inactive-crm") {
    const data = await dakinisAnalyticsInactiveCrm(business.id, business.type, {
      daysInactive: body.daysInactive
    });
    return dakinisJsonSuccess(data, business.type, meta);
  }

  if (req.method === "POST" && path === "/api/internal/intelligence/supplier-overview") {
    const data = await dakinisAnalyticsSupplierOverview(business.id);
    return dakinisJsonSuccess(data, business.type, meta);
  }

  if (req.method === "POST" && path === "/api/internal/intelligence/slow-products") {
    const data = await dakinisAnalyticsSlowProducts(business.id);
    return dakinisJsonSuccess(data, business.type, meta);
  }

  if (req.method === "POST" && path === "/api/internal/intelligence/expiring-lots") {
    const data = await dakinisAnalyticsExpiringLots(business.id, business.type, {
      withinDays: body.withinDays
    });
    return dakinisJsonSuccess(data, business.type, meta);
  }

  if (req.method === "POST" && path === "/api/internal/intelligence/signals") {
    const signals = await dakinisGatherTenantSignals(business.id, business.type);
    return dakinisJsonSuccess({ signals, business: { name: business.name, type: business.type, plan: business.plan } }, business.type, meta);
  }

  return null;
}
