import { dakinisIsSeedDemoTenantSession } from "./demoSession.js";

export function dakinisIsPlatformAdminSession(session) {
  return session?.user?.role === "platform_admin" || session?.business?.type === "platform";
}

/** Tenant de demo comercial (seed *-demo) — ocultar UI técnica y mostrar datos demo. */
export function dakinisIsBusinessDemoSession(session) {
  return dakinisIsSeedDemoTenantSession(session);
}

/** Vista orientada a dueño de negocio (menú Clientes/Ventas/… en lugar de CRM/Hub). */
export function dakinisIsBusinessFacingSession(session) {
  return Boolean(session?.token) && !dakinisIsPlatformAdminSession(session);
}
