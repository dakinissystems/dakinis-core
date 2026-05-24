import { dakinisJsonError } from "../api/responses.js";

export const DAKINIS_ROLES = Object.freeze({
  PLATFORM_ADMIN: "platform_admin",
  TENANT_ADMIN: "tenant_admin",
  ADMIN: "admin",
  EMPLOYEE: "employee",
  MEMBER: "member",
  READONLY: "readonly",
  BILLING: "billing",
  USER: "user"
});

/**
 * @param {string[]} allowedRoles
 * @returns {(req: import("node:http").IncomingMessage) => import("./responses.js").DakinisJsonResult | null}
 */
export function dakinisRequireRoles(allowedRoles) {
  const set = new Set(allowedRoles.map((r) => String(r).toLowerCase()));
  return (req) => {
    const role = String(req.dakinisAuth?.role || req.user?.role || "").toLowerCase();
    if (!role || !set.has(role)) {
      return dakinisJsonError(403, "FORBIDDEN", "Rol insuficiente para esta operación", {
        required: [...set],
        role: role || null
      });
    }
    return null;
  };
}

/** platform_admin OR tenant admin (admin / tenant_admin). */
export function dakinisIsTenantAdminRole(role) {
  const r = String(role || "").toLowerCase();
  return r === "admin" || r === "tenant_admin" || r === "platform_admin";
}
