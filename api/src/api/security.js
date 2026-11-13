import { dakinisJsonError } from "./responses.js";

const DAKINIS_RATE_STORE = new Map();

const DAKINIS_API_KEY_HEADER = "x-api-key";
const DAKINIS_RATE_LIMIT_WINDOW_MS = Number(process.env.DAKINIS_RATE_LIMIT_WINDOW_MS || 60000);
const DAKINIS_RATE_LIMIT_MAX_REQUESTS = Number(process.env.DAKINIS_RATE_LIMIT_MAX_REQUESTS || 300);
const DAKINIS_AUTH_RATE_LIMIT_MAX = Number(process.env.DAKINIS_AUTH_RATE_LIMIT_MAX || 15);
/** Cupo propio de cada sesión. No usa DAKINIS_RATE_LIMIT_MAX_REQUESTS (ese tope es el anónimo / api-key). */
const DAKINIS_AUTHED_RATE_LIMIT_MAX = Number(process.env.DAKINIS_AUTHED_RATE_LIMIT_MAX || 1200);
const DAKINIS_AUTH_RATE_WINDOW_MS = Number(process.env.DAKINIS_AUTH_RATE_WINDOW_MS || 60000);

const DAKINIS_AUTH_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/exchange",
  "/api/auth/tenants"
]);

function dakinisGetClientKey(req) {
  const trustProxy = String(process.env.TRUST_PROXY || "").toLowerCase() === "true";
  const forwardedFor = req.headers["x-forwarded-for"];
  const ip =
    trustProxy && typeof forwardedFor === "string"
      ? forwardedFor.split(",")[0].trim()
      : req.socket?.remoteAddress || "unknown";
  const apiKey = req.headers[DAKINIS_API_KEY_HEADER] || "no-key";
  const biz = typeof req.headers["x-business-id"] === "string" ? req.headers["x-business-id"].trim() : "";
  return biz ? `${ip}:${apiKey}:biz:${biz}` : `${ip}:${apiKey}`;
}

/** Firma del JWT (no el payload) para un cupo por sesión. Detrás del proxy el IP es compartido. */
function dakinisBearerBucket(req) {
  const raw = req.headers.authorization || req.headers.Authorization;
  if (typeof raw !== "string") return "";
  const match = raw.match(/^Bearer\s+(\S+)/i);
  if (!match) return "";
  const sig = String(match[1].split(".")[2] || "");
  return sig.length >= 8 ? sig.slice(0, 32) : "";
}

function dakinisCleanupRateStore(now) {
  for (const [key, record] of DAKINIS_RATE_STORE.entries()) {
    if (now - record.windowStart > DAKINIS_RATE_LIMIT_WINDOW_MS) {
      DAKINIS_RATE_STORE.delete(key);
    }
  }
}

function dakinisCheckRateLimit(key, record, maxRequests, windowMs) {
  const now = Date.now();
  dakinisCleanupRateStore(now);
  const withinWindow = record && now - record.windowStart <= windowMs;
  const next = withinWindow ? { ...record, count: record.count + 1 } : { count: 1, windowStart: now };
  DAKINIS_RATE_STORE.set(key, next);
  return { record: next, now, maxRequests, windowMs };
}

export function dakinisEnforceRateLimit(req, res, url) {
  if (!url.pathname.startsWith("/api/")) return null;

  const isAuthPath = DAKINIS_AUTH_PATHS.has(url.pathname);
  const bearer = isAuthPath ? "" : dakinisBearerBucket(req);
  const biz = typeof req.headers["x-business-id"] === "string" ? req.headers["x-business-id"].trim() : "";
  const maxRequests = isAuthPath
    ? DAKINIS_AUTH_RATE_LIMIT_MAX
    : bearer
      ? DAKINIS_AUTHED_RATE_LIMIT_MAX
      : DAKINIS_RATE_LIMIT_MAX_REQUESTS;
  const windowMs = isAuthPath ? DAKINIS_AUTH_RATE_WINDOW_MS : DAKINIS_RATE_LIMIT_WINDOW_MS;
  const key = isAuthPath
    ? `auth:${dakinisGetClientKey(req)}:${url.pathname}`
    : bearer
      ? `user:${bearer}${biz ? `:biz:${biz}` : ""}`
      : dakinisGetClientKey(req);

  const current = DAKINIS_RATE_STORE.get(key);
  const { record, now } = dakinisCheckRateLimit(key, current, maxRequests, windowMs);

  const remaining = Math.max(0, maxRequests - record.count);
  const resetInSeconds = Math.ceil((record.windowStart + windowMs - now) / 1000);

  res.setHeader("X-RateLimit-Limit", String(maxRequests));
  res.setHeader("X-RateLimit-Remaining", String(remaining));
  res.setHeader("X-RateLimit-Reset", String(Math.max(0, resetInSeconds)));

  if (record.count > maxRequests) {
    res.setHeader("Retry-After", String(Math.max(1, resetInSeconds)));
    return dakinisJsonError(429, "RATE_LIMIT_EXCEEDED", "Demasiadas solicitudes, intenta de nuevo mas tarde", {
      windowMs,
      maxRequests,
      path: url.pathname
    });
  }

  return null;
}
