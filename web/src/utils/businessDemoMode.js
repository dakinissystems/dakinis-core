import { dakinisIsSeedDemoTenantSession } from "./demoSession.js";

export function dakinisIsPlatformAdminSession(session) {
  return session?.user?.role === "platform_admin" || session?.business?.type === "platform";
}

const TENANT_ADMIN_ROLES = new Set(["admin", "owner", "manager"]);

/**
 * Admin de negocio (Settings, equipo, config). Los `member` operan sin estas superficies.
 * @param {object|null|undefined} session
 */
export function dakinisIsTenantAdminSession(session) {
  if (!session?.token) return false;
  if (dakinisIsPlatformAdminSession(session)) return true;
  return TENANT_ADMIN_ROLES.has(String(session?.user?.role || "").toLowerCase());
}

/** Tenant de demo comercial (seed *-demo) — ocultar UI técnica y mostrar datos demo. */
export function dakinisIsBusinessDemoSession(session) {
  return dakinisIsSeedDemoTenantSession(session);
}

/** Vista orientada a dueño de negocio (menú Clientes/Ventas/… en lugar de CRM/Hub). */
export function dakinisIsBusinessFacingSession(session) {
  return Boolean(session?.token) && !dakinisIsPlatformAdminSession(session);
}
