import { DAKINIS_BUSINESS_ID_HEADER } from "../api/contracts.js";
import { dakinisResolveBusinessFromHeader } from "../api/business-context.js";
import { dakinisJsonError } from "../api/responses.js";
import { dakinisDecodeTenantFromJwt } from "./auth.js";

export async function dakinisResolveTenant(req) {
  const jwtIdentity = await dakinisDecodeTenantFromJwt(req);
  const fromJwt = typeof jwtIdentity?.tenantId === "string" ? jwtIdentity.tenantId.trim() : "";
  const bidHeader = req.headers[DAKINIS_BUSINESS_ID_HEADER];
  const fromHeader = typeof bidHeader === "string" ? bidHeader.trim() : "";
  const tenantRef = fromJwt || fromHeader;

  if (!tenantRef) {
    return {
      error: dakinisJsonError(400, "MISSING_TENANT", "Tenant no identificado. Usa JWT con tenantId o x-business-id")
    };
  }

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
