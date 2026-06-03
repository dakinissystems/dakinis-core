import { dakinisHandleApiRequest } from "../../api/router.js";

export function dakinisHandleWhatsappRoute(req, rawBody, url) {
  const legacyUrl = new URL(url.toString());

  const routeMap = {
    "POST /api/v1/whatsapp/confirmation": "/api/whatsapp/confirmation",
    "POST /api/v1/whatsapp/reminder": "/api/whatsapp/reminder",
    "POST /api/v1/whatsapp/reactivation": "/api/whatsapp/reactivation",
    "GET /api/v1/whatsapp/rules": "/api/whatsapp/rules",
    "POST /api/v1/whatsapp/preview": "/api/whatsapp/preview"
  };

  const key = `${req.method} ${url.pathname}`;
  const legacyPath = routeMap[key];
  if (!legacyPath) return null;

  legacyUrl.pathname = legacyPath;
  return dakinisHandleApiRequest(req, rawBody, legacyUrl);
}
