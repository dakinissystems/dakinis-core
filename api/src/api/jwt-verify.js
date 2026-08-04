import jwt from "jsonwebtoken";

const ALG = "HS256";

export function getPlatformJwtIssuer() {
  return process.env.JWT_ISSUER || "platform-auth";
}

export function getPlatformJwtAudience() {
  return process.env.JWT_AUDIENCE || "dakinis-platform";
}

export function getCoreJwtIssuer() {
  return process.env.JWT_CORE_ISSUER || "dakinis-core";
}

export function getCoreJwtAudience() {
  return process.env.JWT_CORE_AUDIENCE || "dakinis-core-api";
}

/**
 * Verifica JWT de acceso aceptados por el API core: IdP central o login local core.
 */
export function dakinisVerifyTenantAccessToken(token, secret) {
  const pairs = [
    [getPlatformJwtIssuer(), getPlatformJwtAudience()],
    [getCoreJwtIssuer(), getCoreJwtAudience()]
  ];
  const strictEnv = String(process.env.JWT_STRICT_ISS_AUD || "").toLowerCase();
  const strict =
    strictEnv === "true" || (strictEnv !== "false" && process.env.NODE_ENV === "production");

  for (const [issuer, audience] of pairs) {
    try {
      return jwt.verify(token, secret, { algorithms: [ALG], issuer, audience });
    } catch {
      /* siguiente par */
    }
  }

  if (!strict) {
    try {
      const decoded = jwt.verify(token, secret, { algorithms: [ALG] });
      if (decoded && decoded.iss == null) return decoded;
    } catch {
      /* inválido */
    }
  }

  throw new Error("Invalid token");
}
