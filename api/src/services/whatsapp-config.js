/**
 * Configuración WhatsApp Cloud API (Meta). Solo variables de entorno — nunca commitear tokens.
 * @see docs/WHATSAPP-INTEGRATION.md
 */

export function dakinisWhatsappConfig() {
  const accessToken = String(process.env.WHATSAPP_ACCESS_TOKEN || "").trim();
  const phoneNumberId = String(process.env.WHATSAPP_PHONE_NUMBER_ID || "").trim();
  const businessAccountId = String(process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "").trim();
  const verifyToken = String(process.env.WHATSAPP_VERIFY_TOKEN || "").trim();
  const appSecret = String(process.env.WHATSAPP_APP_SECRET || "").trim();
  const graphVersion = String(process.env.WHATSAPP_GRAPH_API_VERSION || "v22.0").trim();
  const defaultBusinessId = String(process.env.WHATSAPP_DEFAULT_BUSINESS_ID || "").trim();

  return {
    accessToken,
    phoneNumberId,
    businessAccountId,
    verifyToken,
    appSecret,
    graphVersion,
    defaultBusinessId
  };
}

export function dakinisIsWhatsappConfigured() {
  const c = dakinisWhatsappConfig();
  return Boolean(c.accessToken && c.phoneNumberId);
}
