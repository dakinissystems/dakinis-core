/** Mapeo ruta /app/* → clave de telemetría (adopción por pantalla). */
export function dakinisPathToTelemetryFeature(pathname) {
  if (!pathname || !pathname.startsWith("/app/")) return null;
  if (pathname.startsWith("/app/dashboard")) return "dashboard";
  if (pathname.startsWith("/app/crm")) return "crm";
  if (pathname.startsWith("/app/whatsapp/conversations")) return "whatsapp.inbox";
  if (pathname.startsWith("/app/whatsapp/contacts")) return "whatsapp.contacts";
  if (pathname.startsWith("/app/whatsapp/templates")) return "whatsapp.templates";
  if (pathname.startsWith("/app/whatsapp/automations")) return "whatsapp.automations";
  if (pathname.startsWith("/app/whatsapp/ai")) return "whatsapp.ai";
  if (pathname.startsWith("/app/settings")) return "settings";
  return `app.${pathname.replace(/^\/app\//, "").replace(/\//g, ".")}`;
}
