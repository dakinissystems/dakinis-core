import jwt from "jsonwebtoken";
import { dakinisGetDb } from "../db/index.js";
import { dakinisJsonError } from "./responses.js";

const DAKINIS_JWT_SECRET = process.env.JWT_SECRET || "dakinis_dev_insecure_change_me";
const DAKINIS_MASTER_API_KEY = String(process.env.DAKINIS_MASTER_API_KEY ?? "dakinis-dev-key").trim();
const DAKINIS_WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const DAKINIS_KEY_ROLE_FULL = "full-access";
const DAKINIS_KEY_ROLE_READ_ONLY = "read-only";

export function dakinisGetJwtSecret() {
  return DAKINIS_JWT_SECRET;
}

export function dakinisSignUserToken(userRow) {
  return jwt.sign(
    {
      sub: userRow.id,
      bid: userRow.business_id,
      role: userRow.role,
      email: userRow.email
    },
    DAKINIS_JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function dakinisAuthenticateTenant(req, business) {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    if (!token) {
      return dakinisJsonError(401, "UNAUTHORIZED", "Token ausente", {});
    }
    try {
      const payload = jwt.verify(token, DAKINIS_JWT_SECRET);
      const bid = typeof payload.bid === "string" ? payload.bid : "";
      if (bid !== business.id) {
        return dakinisJsonError(403, "BUSINESS_MISMATCH", "El token no corresponde al negocio indicado en x-business-id", {
          expectedBusinessId: business.id
        });
      }
      req.dakinisAuth = {
        method: "jwt",
        userId: typeof payload.sub === "string" ? payload.sub : "",
        role: typeof payload.role === "string" ? payload.role : "admin",
        email: typeof payload.email === "string" ? payload.email : ""
      };
    } catch {
      return dakinisJsonError(401, "INVALID_TOKEN", "JWT invalido o expirado", {});
    }
  } else {
    const apiKeyRaw = req.headers["x-api-key"];
    const candidate = Array.isArray(apiKeyRaw) ? apiKeyRaw[0] : apiKeyRaw;
    const keyString = typeof candidate === "string" ? candidate.trim() : "";
    if (!keyString) {
      return dakinisJsonError(401, "UNAUTHORIZED", "API key o Bearer token ausente", {
        hint: 'Incluye header x-api-key (maestra dakinis-dev-key en dev) o Authorization Bearer tras POST /api/auth/login'
      });
    }

    const masterMatches = keyString === DAKINIS_MASTER_API_KEY;
    if (masterMatches) {
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
        return dakinisJsonError(401, "UNAUTHORIZED", "API key invalida para este negocio", {
          businessSlug: business.slug
        });
      }

      req.dakinisAuth = {
        method: "tenant_key",
        role: row.role,
        source: "tenant_api_keys"
      };
    }
  }

  const role = req.dakinisAuth.role;
  if (role === DAKINIS_KEY_ROLE_READ_ONLY && DAKINIS_WRITE_METHODS.has(String(req.method || ""))) {
    return dakinisJsonError(403, "FORBIDDEN", "Esta credencial es read-only", { role });
  }

  return null;
}
