/**
 * Login contra IdP central (platform/auth) + exchange en Core API.
 */

const IDP_REFRESH_KEY = "dakinis_idp_refresh_token";

export function getIdpAuthUrl() {
  const raw =
    import.meta.env.VITE_DAKINIS_AUTH_URL || import.meta.env.VITE_AUTH_URL || "";
  return String(raw).replace(/\/$/, "");
}

export function isIdpAuthEnabled() {
  const url = getIdpAuthUrl();
  if (!url) return false;
  if (import.meta.env.VITE_USE_IDP_AUTH === "false") return false;
  return true;
}

export function getIdpRefreshToken() {
  try {
    return sessionStorage.getItem(IDP_REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setIdpRefreshToken(token) {
  try {
    if (token) sessionStorage.setItem(IDP_REFRESH_KEY, token);
    else sessionStorage.removeItem(IDP_REFRESH_KEY);
  } catch {
    /* ignore */
  }
}

export async function loginViaIdp(email, password) {
  const base = getIdpAuthUrl();
  if (!base) throw new Error("VITE_DAKINIS_AUTH_URL not configured");

  const res = await fetch(`${base}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "IdP login failed");
    err.response = { status: res.status, data };
    throw err;
  }
  return data;
}

/** @param {string} token JWT del IdP (sin verificar firma; solo hints). */
export function dakinisDecodeIdpJwtPayload(token) {
  try {
    const part = String(token || "").split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function dakinisTenantRefFromIdpLogin(idpData) {
  const payload = dakinisDecodeIdpJwtPayload(idpData?.token);
  if (!payload || typeof payload !== "object") return "";
  const raw =
    payload.tenant ||
    payload.tenant_slug ||
    payload.tenantSlug ||
    payload.business_slug ||
    payload.businessSlug ||
    "";
  return String(raw).trim();
}

/** Slugs demo / producción cuando el JWT IdP no trae tenant. */
const DEMO_SLUG_BY_EMAIL = {
  "admin@dakinissystems.com": "dakinis-platform",
  "admin@dakinis-platform.local": "dakinis-platform",
  "admin@clinica-demo.local": "clinica-demo",
  "admin@peluqueria-demo.local": "peluqueria-demo",
  "admin@restaurante-demo.local": "restaurante-demo",
  "admin@inmobiliaria-demo.local": "inmobiliaria-demo"
};

export function dakinisResolveExchangeTenantRef(email, idpData, businessField) {
  const manual = String(businessField || "").trim();
  if (manual) return manual;

  const fromJwt = dakinisTenantRefFromIdpLogin(idpData);
  if (fromJwt) return fromJwt;
  const key = String(email || "")
    .trim()
    .toLowerCase();
  return DEMO_SLUG_BY_EMAIL[key] || "";
}
