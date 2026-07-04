import { dakinisGetJwtSecret } from "./auth-tenant.js";
import { dakinisJsonError } from "./responses.js";
import { dakinisVerifyTenantAccessToken } from "./jwt-verify.js";
import { dakinisQueryOne } from "../db/query.js";

function dakinisBusinessIdFromJwt(payload) {
  if (!payload || typeof payload !== "object") return "";
  const raw =
    (typeof payload.bid === "string" && payload.bid) ||
    (typeof payload.tenantId === "string" && payload.tenantId) ||
    (typeof payload.tenant === "string" && payload.tenant) ||
    "";
  return String(raw).trim();
}

/** Valida JWT y exige rol platform_admin (o admin del negocio type=platform). */
export async function dakinisRequirePlatformAdmin(req) {
  const authHeader = req.headers.authorization;
  if (typeof authHeader !== "string" || !authHeader.toLowerCase().startsWith("bearer ")) {
    return dakinisJsonError(401, "UNAUTHORIZED", "Se requiere Authorization: Bearer (JWT de administrador de plataforma)");
  }
  const token = authHeader.slice(7).trim();
  if (!token) {
    return dakinisJsonError(401, "UNAUTHORIZED", "Token vacío");
  }
  try {
    const payload = dakinisVerifyTenantAccessToken(token, dakinisGetJwtSecret());
    const role = typeof payload.role === "string" ? payload.role : "";

    if (role === "platform_admin") {
      req.dakinisPlatformAuth = {
        userId: typeof payload.sub === "string" ? payload.sub : "",
        email: typeof payload.email === "string" ? payload.email : ""
      };
      return null;
    }

    if (role === "admin") {
      const businessId = dakinisBusinessIdFromJwt(payload);
      if (businessId) {
        const biz = await dakinisQueryOne("SELECT type FROM business WHERE id = ?", [businessId]);
        if (String(biz?.type || "").toLowerCase() === "platform") {
          req.dakinisPlatformAuth = {
            userId: typeof payload.sub === "string" ? payload.sub : "",
            email: typeof payload.email === "string" ? payload.email : ""
          };
          return null;
        }
      }
    }

    return dakinisJsonError(403, "FORBIDDEN", "Solo cuentas administrador de plataforma pueden acceder a este recurso");
  } catch {
    return dakinisJsonError(401, "INVALID_TOKEN", "JWT inválido o expirado");
  }
}
