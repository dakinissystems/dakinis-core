import { dakinisHandleApiRequest } from "../../api/router.js";
import { dakinisHandleCrmApi, dakinisIsCrmApiPath } from "../../api/tenant-crm.js";

export function dakinisHandleCrmRoute(req, rawBody, url) {
  if (dakinisIsCrmApiPath(url.pathname, req.method)) {
    return dakinisHandleCrmApi(req, rawBody, url);
  }

  const legacyUrl = new URL(url.toString());

  const routeMap = {
    "POST /api/v1/crm/segment": "/api/crm/segment",
    "POST /api/v1/crm/timeline": "/api/crm/timeline"
  };

  const key = `${req.method} ${url.pathname}`;
  const legacyPath = routeMap[key];
  if (!legacyPath) return null;

  legacyUrl.pathname = legacyPath;
  return dakinisHandleApiRequest(req, rawBody, legacyUrl);
}
