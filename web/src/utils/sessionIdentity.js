/**
 * Identidad estable de sesión para deps de efectos / setSession.
 * Evita refetch storms cuando el objeto session se recrea con el mismo contenido útil.
 */

export function dakinisSessionToken(session) {
  return typeof session?.token === "string" ? session.token : "";
}

export function dakinisBusinessIdentityFingerprint(business) {
  if (!business || typeof business !== "object") return "";
  return [
    business.id,
    business.slug,
    business.type,
    business.plan,
    business.accessState,
    business.subscriptionStatus,
    business.trialEndsAt,
    business.name
  ]
    .map((v) => String(v ?? ""))
    .join("|");
}

export function dakinisSessionIdentityFingerprint(session) {
  if (!session || typeof session !== "object") return "";
  return [
    dakinisSessionToken(session),
    session.user?.id,
    session.user?.email,
    session.user?.role,
    dakinisBusinessIdentityFingerprint(session.business)
  ]
    .map((v) => String(v ?? ""))
    .join("::");
}

/** Clave corta para deps de fetch tenant (token + tenant). */
export function dakinisTenantFetchKey(session, extras = []) {
  return [
    dakinisSessionToken(session),
    session?.business?.slug || "",
    session?.business?.type || "",
    ...extras.map((v) => String(v ?? ""))
  ].join("|");
}
