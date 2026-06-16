import { dakinisJsonError } from "../api/responses.js";
import { dakinisGetTenantAccessContext } from "../services/tenant-access-store.js";

const DAKINIS_SUSPENDED_ALLOW = Object.freeze([
  { method: "GET", path: "/api/me" },
  { method: "GET", path: "/api/v1/tenant/profile" },
  { method: "GET", path: "/api/v1/tenant/billing/summary" }
]);

function dakinisIsSuspendedAllowlisted(method, pathname) {
  const m = String(method || "GET").toUpperCase();
  return DAKINIS_SUSPENDED_ALLOW.some((rule) => rule.method === m && rule.path === pathname);
}

export async function dakinisApplyTenantAccessToBusiness(req) {
  const business = req.dakinisBusiness;
  if (!business?.id) return;
  if (String(business.type).toLowerCase() === "platform") return;

  const ctx = await dakinisGetTenantAccessContext(business.id, business.plan);
  req.dakinisBusiness = {
    ...business,
    plan: ctx.effectivePlan,
    planEntitled: ctx.entitledPlan,
    _tenantAccess: ctx
  };
}

/**
 * @param {import("node:http").IncomingMessage & { dakinisBusiness?: object }} req
 * @param {string} pathname
 * @param {string} [method]
 */
export function dakinisTenantAccessDenialOrNull(req, pathname, method = "GET") {
  const access = req.dakinisBusiness?._tenantAccess;
  if (!access) return null;

  if (access.closed) {
    return dakinisJsonError(403, "TENANT_CLOSED", "Este negocio ha sido desactivado. Contacta con soporte.", {
      accessState: access.accessState,
      reason: access.accessReason
    });
  }

  if (access.suspended) {
    if (dakinisIsSuspendedAllowlisted(method, pathname)) return null;
    return dakinisJsonError(
      403,
      "TENANT_SUSPENDED",
      "Acceso suspendido temporalmente. Revisa tu email o contacta con soporte.",
      {
        accessState: access.accessState,
        reason: access.accessReason
      }
    );
  }

  if (access.degraded && pathname.startsWith("/api/")) {
    return null;
  }

  return null;
}

/** Bloqueo en login para tenants cerrados o suspendidos (suspendidos pueden entrar para ver billing). */
export function dakinisTenantLoginAccessDenialOrNull(accessContext) {
  if (!accessContext?.closed) return null;
  return dakinisJsonError(403, "TENANT_CLOSED", "Este negocio ha sido desactivado. Contacta con soporte.", {
    accessState: accessContext.accessState,
    reason: accessContext.accessReason
  });
}
