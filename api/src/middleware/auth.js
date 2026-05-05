import jwt from "jsonwebtoken";
import { dakinisGetDb } from "../db/index.js";
import { dakinisJsonError } from "../api/responses.js";
import { dakinisGetJwtSecret } from "../api/auth-tenant.js";

const DAKINIS_MASTER_API_KEY = String(process.env.DAKINIS_MASTER_API_KEY ?? "dakinis-dev-key").trim();
const DAKINIS_WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const DAKINIS_KEY_ROLE_FULL = "full-access";
const DAKINIS_KEY_ROLE_READ_ONLY = "read-only";

export function dakinisReadBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (typeof authHeader !== "string" || !authHeader.toLowerCase().startsWith("bearer ")) {
    return "";
  }
  return authHeader.slice(7).trim();
}

export function dakinisDecodeTenantFromJwt(req) {
  const token = dakinisReadBearerToken(req);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, dakinisGetJwtSecret());
    const tenantId =
      typeof payload.tenantId === "string"
        ? payload.tenantId
        : typeof payload.bid === "string"
          ? payload.bid
          : "";
    return {
      userId: typeof payload.sub === "string" ? payload.sub : "",
      email: typeof payload.email === "string" ? payload.email : "",
      role: typeof payload.role === "string" ? payload.role : "admin",
      tenantId
    };
  } catch {
    return null;
  }
}

export function dakinisAuthenticateRequest(req, business) {
  const jwtIdentity = dakinisDecodeTenantFromJwt(req);
  if (jwtIdentity) {
    if (!jwtIdentity.tenantId) {
      return dakinisJsonError(401, "INVALID_TOKEN", "JWT sin tenantId");
    }
    if (jwtIdentity.tenantId !== business.id) {
      return dakinisJsonError(403, "TENANT_MISMATCH", "El JWT no corresponde al tenant solicitado", {
        expectedTenantId: business.id
      });
    }
    req.user = {
      id: jwtIdentity.userId,
      email: jwtIdentity.email,
      role: jwtIdentity.role,
      tenantId: jwtIdentity.tenantId
    };
    req.dakinisAuth = {
      method: "jwt",
      userId: jwtIdentity.userId,
      role: jwtIdentity.role,
      email: jwtIdentity.email,
      tenantId: jwtIdentity.tenantId
    };
    return null;
  }

  const apiKeyRaw = req.headers["x-api-key"];
  const candidate = Array.isArray(apiKeyRaw) ? apiKeyRaw[0] : apiKeyRaw;
  const keyString = typeof candidate === "string" ? candidate.trim() : "";
  if (!keyString) {
    return dakinisJsonError(401, "UNAUTHORIZED", "Falta Authorization: Bearer o x-api-key");
  }

  if (keyString === DAKINIS_MASTER_API_KEY) {
    req.dakinisAuth = {
      method: "master_key",
      role: DAKINIS_KEY_ROLE_FULL,
      source: "DAKINIS_MASTER_API_KEY"
    };
  } else {
    const db = dakinisGetDb();
    const row = db
      .prepare("SELECT * FROM tenant_api_keys WHERE key_value = ? AND business_id = ?")
      .get(keyString, business.id);
    if (!row) {
      return dakinisJsonError(401, "UNAUTHORIZED", "API key invalida para este tenant");
    }
    req.dakinisAuth = {
      method: "tenant_key",
      role: row.role,
      source: "tenant_api_keys"
    };
  }

  if (req.dakinisAuth.role === DAKINIS_KEY_ROLE_READ_ONLY && DAKINIS_WRITE_METHODS.has(String(req.method))) {
    return dakinisJsonError(403, "FORBIDDEN", "Esta credencial es read-only");
  }

  return null;
}
