import { DAKINIS_BUSINESS_SLUG_BY_VERTICAL } from "@dakinis/shared/catalog/business-mapping.js";

const DAKINIS_SEED_DEMO_SLUGS = new Set(Object.values(DAKINIS_BUSINESS_SLUG_BY_VERTICAL));

/**
 * Sesión de los tenants seed (emails *@*-demo.local y slug clinica-demo, etc.).
 */
export function dakinisIsSeedDemoTenantSession(session) {
  if (!session?.token || !session.user?.email) return false;
  if (session.user.role === "platform_admin") return false;
  if (session.business?.type === "platform") return false;
  const slug = String(session.business?.slug || "").toLowerCase();
  const email = String(session.user.email).toLowerCase();
  if (!DAKINIS_SEED_DEMO_SLUGS.has(slug)) return false;
  if (!email.endsWith("-demo.local")) return false;
  return true;
}
