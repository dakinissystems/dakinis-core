import { dakinisHandleApiRequest } from "../../api/router.js";

export function dakinisHandleAppointmentsRoute(req, rawBody, url) {
  const legacyUrl = new URL(url.toString());

  const routeMap = {
    "POST /api/v1/appointments/slots": "/api/agenda/slots",
    "POST /api/v1/appointments/can-schedule": "/api/agenda/can-schedule",
    "POST /api/v1/appointments/validate": "/api/booking/validate",
    "POST /api/v1/appointments/link": "/api/booking/link"
  };

  const key = `${req.method} ${url.pathname}`;
  const legacyPath = routeMap[key];
  if (!legacyPath) return null;

  legacyUrl.pathname = legacyPath;
  return dakinisHandleApiRequest(req, rawBody, legacyUrl);
}
