import { dakinisJsonError } from "../api/responses.js";
import { dakinisGetJwtSecret } from "../api/auth-tenant.js";
import { dakinisResolveMasterApiKey } from "../api/master-key-config.js";
import { dakinisFindTenantApiKeyRow } from "../api/api-key-utils.js";
import { dakinisVerifyTenantAccessToken } from "../api/jwt-verify.js";
import {
  dakinisIsPlatformIdpPayload,
  dakinisResolveCoreUserFromPlatformToken,
  dakinisResolvePlatformTenantClaimToBusinessId
} from "../api/platform-user-bridge.js";

const DAKINIS_MASTER_API_KEY = dakinisResolveMasterApiKey();
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

function dakinisExtractCoreJwtTenantIdentity(payload) {
  const tenantId =
    typeof payload.tenant === "string"
      ? payload.tenant
      : typeof payload.tenantId === "string"
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
}

/**
 * Contexto de tenant antes de `dakinisAuthenticateRequest`: si el JWT es del IdP y el claim
 * `tenant` no mapea a un `business.id`, `tenantId` queda vacío y se usa `x-business-id`.
 */
export async function dakinisDecodeTenantFromJwt(req) {
  const token = dakinisReadBearerToken(req);
  if (!token) return null;
  try {
    const payload = dakinisVerifyTenantAccessToken(token, dakinisGetJwtSecret());
    if (dakinisIsPlatformIdpPayload(payload)) {
      const claim =
        (payload.tenant && String(payload.tenant).trim()) ||
        (payload.tenantId && String(payload.tenantId).trim()) ||
        "";
      const mapped = await dakinisResolvePlatformTenantClaimToBusinessId(claim);
      return {
        userId: "",
        email: typeof payload.email === "string" ? payload.email : "",
        role: typeof payload.role === "string" ? payload.role : "user",
        tenantId: mapped
      };
    }
    return dakinisExtractCoreJwtTenantIdentity(payload);
  } catch {
    return null;
  }
}

export async function dakinisAuthenticateRequest(req, business) {
  const token = dakinisReadBearerToken(req);
  if (!token) {
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
      const row = await dakinisFindTenantApiKeyRow(business.id, keyString);
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

  let payload;
  try {
    payload = dakinisVerifyTenantAccessToken(token, dakinisGetJwtSecret());
  } catch {
    return dakinisJsonError(401, "UNAUTHORIZED", "JWT invalido o expirado");
  }

  let jwtIdentity;
  if (dakinisIsPlatformIdpPayload(payload)) {
    try {
      const user = await dakinisResolveCoreUserFromPlatformToken(payload, business);
      jwtIdentity = {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.business_id
      };
    } catch (e) {
      const code = e && e.code;
      if (code === "PLATFORM_USER_TENANT_MISMATCH") {
        return dakinisJsonError(
          403,
          "PLATFORM_USER_TENANT_MISMATCH",
          "El email del IdP ya esta vinculado a otro negocio en core"
        );
      }
      return dakinisJsonError(
        401,
        "INVALID_PLATFORM_IDENTITY",
        e instanceof Error ? e.message : "Identidad del IdP invalida"
      );
    }
  } else {
    jwtIdentity = dakinisExtractCoreJwtTenantIdentity(payload);
    if (!jwtIdentity.tenantId) {
      return dakinisJsonError(401, "INVALID_TOKEN", "JWT sin tenant");
    }
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
