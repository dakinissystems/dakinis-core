import { dakinisGetJwtSecret } from "./auth-tenant.js";
import { dakinisJsonError } from "./responses.js";
import { dakinisVerifyTenantAccessToken } from "./jwt-verify.js";

/** Valida JWT y exige rol `platform_admin` (sin contexto de tenant). */
export function dakinisRequirePlatformAdmin(req) {
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
    if (role !== "platform_admin") {
      return dakinisJsonError(403, "FORBIDDEN", "Solo cuentas administrador de plataforma pueden acceder a este recurso");
    }
    req.dakinisPlatformAuth = {
      userId: typeof payload.sub === "string" ? payload.sub : "",
      email: typeof payload.email === "string" ? payload.email : ""
    };
    return null;
  } catch {
    return dakinisJsonError(401, "INVALID_TOKEN", "JWT inválido o expirado");
  }
}
