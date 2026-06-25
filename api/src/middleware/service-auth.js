/**
 * Auth server-to-server (Dakinis AI → Core internal API).
 */
export function dakinisRequireServiceAuth(req) {
  const expected = String(
    process.env.DAKINIS_SERVICE_KEY || process.env.DAKINIS_AI_SERVICE_KEY || ""
  ).trim();
  if (!expected) {
    return { status: 503, body: { error: "service_auth_not_configured" } };
  }
  const header = String(req.headers.authorization || "");
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (token !== expected) {
    return { status: 401, body: { error: "unauthorized" } };
  }

  const businessId = String(req.headers["x-dakinis-business-id"] || "").trim();
  if (!businessId) {
    return { status: 400, body: { error: "missing_business", message: "X-Dakinis-Business-Id required" } };
  }

  req.dakinisService = {
    businessId,
    userId: String(req.headers["x-dakinis-user-id"] || "").trim() || null
  };
  return null;
}
