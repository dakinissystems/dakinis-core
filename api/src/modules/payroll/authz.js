import { dakinisJsonError } from "../../api/responses.js";
import { dakinisRequireTenantJwt } from "../../api/tenant-supply.js";
import { DAKINIS_ROLES, dakinisIsTenantAdminRole } from "../../middleware/rbac.js";

/**
 * Fine-grained payroll.* check. Admins/owners get all keys.
 * Members may hold an explicit permissions[] on the JWT auth object.
 * @param {import("node:http").IncomingMessage} req
 * @param {string} permission e.g. payroll.view
 */
export function dakinisRequirePayrollPermission(req, permission) {
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const role = String(req.dakinisAuth?.role || req.user?.role || "").toLowerCase();
  if (dakinisIsTenantAdminRole(role) || role === DAKINIS_ROLES.BILLING) {
    // billing role: view only unless admin-equivalent
    if (role === DAKINIS_ROLES.BILLING && permission !== "payroll.view") {
      return dakinisJsonError(403, "FORBIDDEN", "Rol billing solo puede consultar nómina", {
        required: permission,
        role
      });
    }
    return null;
  }

  const granted = Array.isArray(req.dakinisAuth?.permissions)
    ? req.dakinisAuth.permissions
    : Array.isArray(req.user?.permissions)
      ? req.user.permissions
      : [];

  if (granted.includes("*") || granted.includes("payroll.*") || granted.includes(permission)) {
    return null;
  }

  // Authenticated member default: view only
  if (permission === "payroll.view") {
    return null;
  }

  return dakinisJsonError(403, "FORBIDDEN", "Falta permiso de nómina", {
    required: permission,
    role: role || null
  });
}
