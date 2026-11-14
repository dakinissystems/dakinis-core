import { DAKINIS_BUSINESS_ID_HEADER } from "../api/contracts.js";
import { dakinisResolveBusinessFromHeader } from "../api/business-context.js";
import { dakinisJsonError } from "../api/responses.js";
import { dakinisDecodeTenantFromJwt, dakinisReadBearerToken } from "./auth.js";

/**
 * Elige la referencia de tenant. Con Bearer, solo el JWT (A4).
 * @returns {{ tenantRef: string } | { errorStatus: number, message: string }}
 */
export function dakinisPickTenantRef({ fromJwt, fromHeader, hasBearer, isProd }) {
  if (hasBearer) {
    if (!fromJwt) {
      return {
        errorStatus: isProd ? 401 : 400,
        message: "JWT sin tenant. El header x-business-id no sustituye al claim del token"
      };
    }
    return { tenantRef: fromJwt };
  }
  if (!fromHeader) {
    return {
      errorStatus: 400,
      message: "Tenant no identificado. Usa JWT con tenantId o x-business-id"
    };
  }
  return { tenantRef: fromHeader };
}

export async function dakinisResolveTenant(req) {
  const jwtIdentity = await dakinisDecodeTenantFromJwt(req);
  const fromJwt = typeof jwtIdentity?.tenantId === "string" ? jwtIdentity.tenantId.trim() : "";
  const bidHeader = req.headers[DAKINIS_BUSINESS_ID_HEADER];
  const fromHeader = typeof bidHeader === "string" ? bidHeader.trim() : "";
  const hasBearer = Boolean(dakinisReadBearerToken(req));
  const isProd = process.env.NODE_ENV === "production";

  const picked = dakinisPickTenantRef({ fromJwt, fromHeader, hasBearer, isProd });
  if (picked.errorStatus) {
    return {
      error: dakinisJsonError(picked.errorStatus, "MISSING_TENANT", picked.message)
    };
  }
  const tenantRef = picked.tenantRef;

  const business = await dakinisResolveBusinessFromHeader(tenantRef);
  if (!business) {
    return {
      error: dakinisJsonError(404, "UNKNOWN_TENANT", "Tenant no encontrado", {
        [DAKINIS_BUSINESS_ID_HEADER]: tenantRef
      })
    };
  }

  req.dakinisBusiness = business;
  return { business };
}
