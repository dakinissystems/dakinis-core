/** Slug efectivo para headers tenant: sesión real o fallback vertical demo. */
export function dakinisEffectiveTenantSlug(apiSession, tenantSlugForVertical) {
  const fromSession = String(apiSession?.business?.slug || "").trim();
  if (apiSession?.token && fromSession) return fromSession;
  return tenantSlugForVertical;
}
