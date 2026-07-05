import { dakinisHandleApiRequest } from "../../api/router.js";
import {
  dakinisHandleWhatsappInbox,
  dakinisIsWhatsappInboxPath
} from "../../api/tenant-whatsapp-inbox.js";

export function dakinisHandleWhatsappRoute(req, rawBody, url) {
  if (dakinisIsWhatsappInboxPath(url.pathname, req.method)) {
    return dakinisHandleWhatsappInbox(req, rawBody, url);
  }

  const legacyUrl = new URL(url.toString());

  const routeMap = {
    "POST /api/v1/whatsapp/confirmation": "/api/whatsapp/confirmation",
    "POST /api/v1/whatsapp/reminder": "/api/whatsapp/reminder",
    "POST /api/v1/whatsapp/reactivation": "/api/whatsapp/reactivation",
    "POST /api/v1/whatsapp/preview": "/api/whatsapp/preview",
    "GET /api/v1/whatsapp/rules": "/api/whatsapp/rules"
  };

  const key = `${req.method} ${url.pathname}`;
  const legacyPath = routeMap[key];
  if (!legacyPath) return null;

  legacyUrl.pathname = legacyPath;
  return dakinisHandleApiRequest(req, rawBody, legacyUrl);
}
