import { dakinisHandleApiRequest } from "../../api/router.js";

export function dakinisHandleMessagesRoute(req, rawBody, url) {
  const legacyUrl = new URL(url.toString());

  const routeMap = {
    "POST /api/v1/messages/confirmation": "/api/whatsapp/confirmation",
    "POST /api/v1/messages/reminder": "/api/whatsapp/reminder",
    "POST /api/v1/messages/reactivation": "/api/whatsapp/reactivation"
  };

  const key = `${req.method} ${url.pathname}`;
  const legacyPath = routeMap[key];
  if (!legacyPath) return null;

  legacyUrl.pathname = legacyPath;
  return dakinisHandleApiRequest(req, rawBody, legacyUrl);
}
