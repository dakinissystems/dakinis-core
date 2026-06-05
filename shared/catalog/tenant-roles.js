/** Roles avanzados por tenant (evolución de admin/member). */

export const DAKINIS_TENANT_ROLE_KEYS = Object.freeze([
  "owner",
  "manager",
  "employee",
  "accountant",
  "marketing",
  "support"
]);

/** Compatibilidad con roles legacy en DB. */
export const DAKINIS_LEGACY_TENANT_ROLES = Object.freeze(["admin", "member", "platform_admin"]);

export const DAKINIS_TENANT_ROLE_PERMISSIONS = Object.freeze({
  owner: ["*"],
  manager: [
    "users.manage",
    "settings.edit",
    "branches.manage",
    "modules.toggle",
    "dashboard.view",
    "crm.edit",
    "whatsapp.send",
    "inventory.edit",
    "billing.view"
  ],
  employee: ["dashboard.view", "crm.view", "booking.edit", "inventory.view"],
  accountant: ["dashboard.view", "billing.view", "invoices.edit", "crm.view"],
  marketing: ["dashboard.view", "crm.edit", "whatsapp.send", "analytics.view"],
  support: ["dashboard.view", "crm.view", "whatsapp.send", "portal.view"],
  admin: ["*"],
  member: ["dashboard.view", "crm.view", "booking.edit"]
});

/**
 * @param {string} role
 * @returns {string}
 */
export function dakinisNormalizeTenantRole(role) {
  const r = String(role || "employee").trim().toLowerCase();
  if (r === "admin") return "owner";
  if (r === "member") return "employee";
  return r;
}

/**
 * @param {string} role
 * @returns {boolean}
 */
export function dakinisRoleCanManageUsers(role) {
  const n = dakinisNormalizeTenantRole(role);
  return n === "owner" || n === "manager" || role === "admin";
}

/**
 * @param {string} role
 * @param {string} permission
 */
export function dakinisRoleHasPermission(role, permission) {
  const n = dakinisNormalizeTenantRole(role);
  const perms = DAKINIS_TENANT_ROLE_PERMISSIONS[n] || DAKINIS_TENANT_ROLE_PERMISSIONS.employee;
  if (perms.includes("*")) return true;
  return perms.includes(permission);
}

export function dakinisIsValidTenantRole(role) {
  const r = String(role || "").trim().toLowerCase();
  return (
    DAKINIS_TENANT_ROLE_KEYS.includes(r) || r === "admin" || r === "member"
  );
}

export function dakinisGetTenantRoleCatalog() {
  return DAKINIS_TENANT_ROLE_KEYS.map((key) => ({
    key,
    label:
      {
        owner: "Propietario",
        manager: "Gerente",
        employee: "Empleado",
        accountant: "Contabilidad",
        marketing: "Marketing",
        support: "Soporte"
      }[key] || key,
    permissions: DAKINIS_TENANT_ROLE_PERMISSIONS[key]
  }));
}
