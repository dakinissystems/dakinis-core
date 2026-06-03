import { dakinisHandleApiRequest } from "../../api/router.js";
import { dakinisPlanModuleDenialOrNull } from "../../api/plan-access.js";
import {
  dakinisHandleWhatsappSend,
  dakinisHandleWhatsappConversations,
  dakinisHandleWhatsappThreadMessages,
  dakinisHandleWhatsappContacts,
  dakinisHandleWhatsappMessagesFlat,
  dakinisHandleWhatsappContactUpsert
} from "../../api/whatsapp-routes.js";

function dakinisWhatsappAdapterKey(business) {
  return String(business?.type || "").toLowerCase();
}

function dakinisWhatsappPlanGate(business, legacyPath) {
  return dakinisPlanModuleDenialOrNull(business, legacyPath);
}

export function dakinisHandleWhatsappRoute(req, rawBody, url) {
  const business = req.dakinisBusiness;
  if (!business) return null;

  const threadMatch = /^\/api\/v1\/whatsapp\/conversations\/([^/]+)\/messages$/.exec(url.pathname);
  if (threadMatch && req.method === "GET") {
    const denied = dakinisWhatsappPlanGate(business, "/api/whatsapp/conversations");
    if (denied) return denied;
    return dakinisHandleWhatsappThreadMessages(
      business,
      dakinisWhatsappAdapterKey(business),
      decodeURIComponent(threadMatch[1]),
      url
    );
  }

  if (req.method === "POST" && url.pathname === "/api/v1/whatsapp/send") {
    const denied = dakinisWhatsappPlanGate(business, "/api/whatsapp/send");
    if (denied) return denied;
    return dakinisHandleWhatsappSend(req, rawBody, business, dakinisWhatsappAdapterKey(business));
  }

  if (req.method === "GET" && url.pathname === "/api/v1/whatsapp/conversations") {
    const denied = dakinisWhatsappPlanGate(business, "/api/whatsapp/conversations");
    if (denied) return denied;
    return dakinisHandleWhatsappConversations(business, dakinisWhatsappAdapterKey(business), url);
  }

  if (req.method === "GET" && url.pathname === "/api/v1/whatsapp/messages") {
    const denied = dakinisWhatsappPlanGate(business, "/api/whatsapp/conversations");
    if (denied) return denied;
    return dakinisHandleWhatsappMessagesFlat(business, dakinisWhatsappAdapterKey(business), url);
  }

  if (req.method === "GET" && url.pathname === "/api/v1/whatsapp/contacts") {
    const denied = dakinisWhatsappPlanGate(business, "/api/whatsapp/contacts");
    if (denied) return denied;
    return dakinisHandleWhatsappContacts(business, dakinisWhatsappAdapterKey(business));
  }

  if (req.method === "POST" && url.pathname === "/api/v1/whatsapp/contacts") {
    const denied = dakinisWhatsappPlanGate(business, "/api/whatsapp/contacts");
    if (denied) return denied;
    return dakinisHandleWhatsappContactUpsert(
      business,
      dakinisWhatsappAdapterKey(business),
      rawBody
    );
  }

  const legacyUrl = new URL(url.toString());

  const routeMap = {
    "POST /api/v1/whatsapp/confirmation": "/api/whatsapp/confirmation",
    "POST /api/v1/whatsapp/reminder": "/api/whatsapp/reminder",
    "POST /api/v1/whatsapp/reactivation": "/api/whatsapp/reactivation",
    "GET /api/v1/whatsapp/rules": "/api/whatsapp/rules",
    "POST /api/v1/whatsapp/preview": "/api/whatsapp/preview",
    "POST /api/v1/whatsapp/send": "/api/whatsapp/send",
    "GET /api/v1/whatsapp/conversations": "/api/whatsapp/conversations",
    "GET /api/v1/whatsapp/contacts": "/api/whatsapp/contacts",
    "POST /api/v1/whatsapp/contacts": "/api/whatsapp/contacts",
    "GET /api/v1/whatsapp/messages": "/api/whatsapp/messages"
  };

  const key = `${req.method} ${url.pathname}`;
  const legacyPath = routeMap[key];
  if (!legacyPath) return null;

  legacyUrl.pathname = legacyPath;
  return dakinisHandleApiRequest(req, rawBody, legacyUrl);
}
