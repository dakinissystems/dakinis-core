import { DAKINIS_PUBLIC_DEFAULT_API_KEY } from "../config/public-defaults.js";
import { dakinisUserFacingMessage } from "./user-facing-error.js";

/** Gateway público: `VITE_API_BASE_URL` (preferido) o `VITE_API_URL` (p. ej. https://api.dakinissystems.com). */
const API_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "")
  .trim()
  .replace(/\/+$/, "");

/** Error de API con `error.code` del backend (p. ej. TOTP_REQUIRED). */
export class DakinisApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = "DakinisApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** Trata `""`/solo espacios como indefinido (evita ?? que conserva cadena vacia). */
function dakinisTrimOr(value, fallback) {
  if (value === undefined || value === null) return fallback;
  const s = String(value).trim();
  return s === "" ? fallback : s;
}

/** En producción (core.dakinissystems.com) el front hace proxy de `/api` → API_UPSTREAM. */
function dakinisPreferSameOriginApi() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "core.dakinissystems.com" || host.endsWith(".up.railway.app");
}

/** Normaliza URL de API (añade https:// si falta). */
function dakinisNormalizeApiBase(raw) {
  const s = String(raw || "").trim().replace(/\/+$/, "");
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

/** Base URL sin barra final; '' usa `/api` en el mismo origen (proxy dev o serve-production). */
export function dakinisApiBaseUrl() {
  if (dakinisPreferSameOriginApi()) return "";

  const fromMeta =
    typeof document !== "undefined"
      ? document.querySelector('meta[name="dakinis-api-base"]')?.getAttribute("content")?.trim()
      : "";
  const fromEnv = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";
  return dakinisNormalizeApiBase(fromMeta || fromEnv);
}

async function dakinisFetchJson(url, init) {
  let res;
  try {
    res = await fetch(url, init);
  } catch (err) {
    console.error("[dakinis] fetch failed", url);
    throw new DakinisApiError(
      "No hemos podido obtener los datos. Tus datos anteriores no se han modificado.",
      { status: 0, code: "NETWORK", details: err instanceof Error ? err.message : "" }
    );
  }
  return res;
}

/** Misma lectura de hostelería en vuelo (carta + pulso + panel) cuenta como una petición. */
const restaurantGetInflight = new Map();

function dakinisRestaurantGetKey(path, session, options) {
  const businessId =
    dakinisTrimOr(options.businessId, "") ||
    dakinisTrimOr(session?.business?.slug, "") ||
    dakinisTrimOr(session?.business?.id, "") ||
    "";
  const token = String(session?.token || "").slice(-16);
  return `${path}|${businessId}|${token}`;
}

/** GET / POST JSON con multi-tenant. `businessId` puede ser slug o UUID. */
export async function dakinisTenantJsonFetch(path, session, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (method === "GET" && normalizedPath.startsWith("/api/tenant/restaurant/")) {
    const key = dakinisRestaurantGetKey(normalizedPath, session, options);
    const pending = restaurantGetInflight.get(key);
    if (pending) return pending;
    const promise = dakinisTenantJsonFetchOnce(normalizedPath, session, options).finally(() => {
      if (restaurantGetInflight.get(key) === promise) restaurantGetInflight.delete(key);
    });
    restaurantGetInflight.set(key, promise);
    return promise;
  }
  return dakinisTenantJsonFetchOnce(normalizedPath, session, options);
}

async function dakinisTenantJsonFetchOnce(path, session, options = {}) {
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
    throw new DakinisApiError("No hay un negocio activo en esta sesión.", { code: "BUSINESS_REQUIRED" });
  }

  const method = String(options.method || "GET").toUpperCase();
  const mergedHeaders = { ...(options.headers || {}) };

  if (method !== "GET") {
    mergedHeaders["Content-Type"] = mergedHeaders["Content-Type"] || "application/json";
  }

  mergedHeaders["x-business-id"] = businessId;

  const actorToken = String(session?.idp?.accessToken || "").trim();
  if (actorToken) mergedHeaders["x-dakinis-actor"] = actorToken;

  if (options.businessTypeHeader) {
    mergedHeaders["x-business-type"] = options.businessTypeHeader;
  }

  if (session?.token && String(session.token).trim()) {
    mergedHeaders.Authorization = `Bearer ${String(session.token).trim()}`;
  } else {
    const keyFromSession =
      dakinisTrimOr(session?.apiKey, "") || dakinisTrimOr(import.meta.env.VITE_API_KEY, "");
    const devFallback = import.meta.env.DEV ? DAKINIS_PUBLIC_DEFAULT_API_KEY : "";
    const apiKey = keyFromSession || devFallback;
    if (apiKey) {
      mergedHeaders["x-api-key"] = apiKey;
    }
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

  const res = await dakinisFetchJson(url, fetchOpts);
  return dakinisParseJsonResponse(res, url);
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
  const res = await dakinisFetchJson(url, init);
  return dakinisParseJsonResponse(res, url);
}

async function dakinisParseJsonResponse(res, url) {
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  if (!res.ok) {
    const code = json?.error?.code;
    if (res.status === 401 && (code === "UNAUTHORIZED" || code === "INVALID_TOKEN")) {
      const { dakinisEmitAuthExpired } = await import("./auth-events.js");
      dakinisEmitAuthExpired({ url, code });
    }
    if (res.status === 429 || code === "RATE_LIMIT_EXCEEDED") {
      throw new DakinisApiError(
        "No hemos podido cargar estos datos. El servicio está recibiendo demasiadas solicitudes.",
        { status: 429, code: code || "RATE_LIMIT_EXCEEDED", details: json?.error?.details }
      );
    }
    const msg = dakinisUserFacingMessage(
      json?.error?.message || res.statusText,
      "No hemos podido completar la operación. Tus datos anteriores no se han modificado."
    );
    if (code) {
      throw new DakinisApiError(msg, {
        status: res.status,
        code,
        details: json?.error?.details
      });
    }
    throw new DakinisApiError(msg, { status: res.status });
  }
  if (json == null) {
    console.error("[dakinis] empty response", url);
    throw new DakinisApiError(
      "No hemos podido leer la respuesta. Tus datos anteriores no se han modificado.",
      { status: res.status, code: "EMPTY_RESPONSE" }
    );
  }
  return json;
}

/** Cliente API compartido con JWT del usuario (multi-tenant real por token). */
export async function api(endpoint, options = {}) {
  let sessionToken = "";
  try {
    const rawSession = sessionStorage.getItem("dakinis_session_v1");
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      if (parsed && typeof parsed === "object" && typeof parsed.token === "string") {
        sessionToken = parsed.token.trim();
      }
    }
  } catch {
    sessionToken = "";
  }
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("dakinis_token") ||
    localStorage.getItem("authToken") ||
    sessionToken;
  const url = `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (token && String(token).trim()) {
    headers.Authorization = `Bearer ${String(token).trim()}`;
  }
  const response = await fetch(url, { ...options, headers });
  return response.json();
}

/** GET/POST con solo `Authorization: Bearer` (panel plataforma; sin `x-business-id`). */
export async function dakinisBearerJsonFetch(path, token, options = {}) {
  const base = dakinisApiBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const method = String(options.method || "GET").toUpperCase();
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${String(token).trim()}`
  };
  if (method !== "GET" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  let body = options.body;
  if (body !== undefined && typeof body === "object" && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }
  const init = { method, headers, signal: options.signal };
  if (body !== undefined) {
    init.body = body;
  }
  const res = await dakinisFetchJson(url, init);
  return dakinisParseJsonResponse(res, url);
}
