import { DAKINIS_PUBLIC_DEFAULT_API_KEY } from "../config/public-defaults.js";

/** Trata `""`/solo espacios como indefinido (evita ?? que conserva cadena vacia). */
function dakinisTrimOr(value, fallback) {
  if (value === undefined || value === null) return fallback;
  const s = String(value).trim();
  return s === "" ? fallback : s;
}

/** Base URL sin barra final; '' usa rutas relativas (proxy Vite `/api`). */
export function dakinisApiBaseUrl() {
  const base = dakinisTrimOr(import.meta.env.VITE_API_BASE_URL, "");
  return base.replace(/\/+$/, "");
}

/** GET / POST JSON con multi-tenant. `businessId` puede ser slug o UUID. */
export async function dakinisTenantJsonFetch(path, session, options = {}) {
  const base = dakinisApiBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const businessIdRaw =
    dakinisTrimOr(options.businessId, "") ||
    dakinisTrimOr(session?.business?.slug, "") ||
    dakinisTrimOr(session?.business?.id, "") ||
    dakinisTrimOr(import.meta.env.VITE_BUSINESS_ID, "") ||
    "";

  const businessId = businessIdRaw;

  if (!businessId) {
    throw new Error("Falta x-business-id: configura sesion tras login o VITE_BUSINESS_ID");
  }

  const method = String(options.method || "GET").toUpperCase();
  const mergedHeaders = { ...(options.headers || {}) };

  if (method !== "GET") {
    mergedHeaders["Content-Type"] = mergedHeaders["Content-Type"] || "application/json";
  }

  mergedHeaders["x-business-id"] = businessId;

  if (options.businessTypeHeader) {
    mergedHeaders["x-business-type"] = options.businessTypeHeader;
  }

  if (session?.token && String(session.token).trim()) {
    mergedHeaders.Authorization = `Bearer ${String(session.token).trim()}`;
  } else {
    const keyFromSession =
      dakinisTrimOr(session?.apiKey, "") || dakinisTrimOr(import.meta.env.VITE_API_KEY, "");
    mergedHeaders["x-api-key"] = keyFromSession || DAKINIS_PUBLIC_DEFAULT_API_KEY;
  }

  let bodyPayload = options.body;
  if (bodyPayload !== undefined && typeof bodyPayload === "object" && !(bodyPayload instanceof FormData)) {
    bodyPayload = JSON.stringify(bodyPayload);
  }

  const fetchOpts = {
    method,
    headers: mergedHeaders,
    signal: options.signal
  };

  if (bodyPayload !== undefined) {
    fetchOpts.body = bodyPayload;
  }

  const res = await fetch(url, fetchOpts);
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const msg = json?.error?.message || res.statusText || "Error HTTP";
    throw new Error(`${msg} (${res.status})`);
  }

  return json;
}

export async function dakinisPublicJsonFetch(path, options = {}) {
  const base = dakinisApiBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const method = String(options.method || "GET").toUpperCase();
  const headers = { ...(options.headers || {}) };
  if (method !== "GET" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  let body = options.body;
  if (body !== undefined && typeof body === "object" && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }
  const init = {
    method,
    headers,
    signal: options.signal,
    credentials: options.credentials,
    cache: options.cache,
    redirect: options.redirect,
    mode: options.mode,
    referrerPolicy: options.referrerPolicy
  };
  if (body !== undefined) {
    init.body = body;
  }
  const res = await fetch(url, init);
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  if (!res.ok) {
    const msg = json?.error?.message || res.statusText || "Error HTTP";
    throw new Error(`${msg} (${res.status})`);
  }
  return json;
}
