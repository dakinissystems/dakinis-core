import { dakinisJsonError } from "./responses.js";

const DAKINIS_RATE_STORE = new Map();

const DAKINIS_API_KEY_HEADER = "x-api-key";
const DAKINIS_RATE_LIMIT_WINDOW_MS = Number(process.env.DAKINIS_RATE_LIMIT_WINDOW_MS || 60000);
const DAKINIS_RATE_LIMIT_MAX_REQUESTS = Number(process.env.DAKINIS_RATE_LIMIT_MAX_REQUESTS || 60);

function dakinisGetClientKey(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  const ip =
    typeof forwardedFor === "string"
      ? forwardedFor.split(",")[0].trim()
      : req.socket.remoteAddress || "unknown";
  const apiKey = req.headers[DAKINIS_API_KEY_HEADER] || "no-key";
  const biz = typeof req.headers["x-business-id"] === "string" ? req.headers["x-business-id"].trim() : "";
  return biz ? `${ip}:${apiKey}:biz:${biz}` : `${ip}:${apiKey}`;
}

function dakinisCleanupRateStore(now) {
  for (const [key, record] of DAKINIS_RATE_STORE.entries()) {
    if (now - record.windowStart > DAKINIS_RATE_LIMIT_WINDOW_MS) {
      DAKINIS_RATE_STORE.delete(key);
    }
  }
}

export function dakinisEnforceRateLimit(req, res, url) {
  if (!url.pathname.startsWith("/api/")) return null;

  const now = Date.now();
  dakinisCleanupRateStore(now);

  const key = dakinisGetClientKey(req);
  const current = DAKINIS_RATE_STORE.get(key);
  const withinWindow = current && now - current.windowStart <= DAKINIS_RATE_LIMIT_WINDOW_MS;
  const record = withinWindow ? { ...current, count: current.count + 1 } : { count: 1, windowStart: now };

  DAKINIS_RATE_STORE.set(key, record);

  const remaining = Math.max(0, DAKINIS_RATE_LIMIT_MAX_REQUESTS - record.count);
  const resetInSeconds = Math.ceil((record.windowStart + DAKINIS_RATE_LIMIT_WINDOW_MS - now) / 1000);

  res.setHeader("X-RateLimit-Limit", String(DAKINIS_RATE_LIMIT_MAX_REQUESTS));
  res.setHeader("X-RateLimit-Remaining", String(remaining));
  res.setHeader("X-RateLimit-Reset", String(Math.max(0, resetInSeconds)));

  if (record.count > DAKINIS_RATE_LIMIT_MAX_REQUESTS) {
    return dakinisJsonError(
      429,
      "RATE_LIMIT_EXCEEDED",
      "Demasiadas solicitudes, intenta de nuevo mas tarde",
      {
        windowMs: DAKINIS_RATE_LIMIT_WINDOW_MS,
        maxRequests: DAKINIS_RATE_LIMIT_MAX_REQUESTS
      }
    );
  }

  return null;
}
