import { dakinisQueryAll } from "../db/query.js";
import { dakinisWhatsappConfig } from "./whatsapp-config.js";

/**
 * Resuelve business_id para webhooks según phone_number_id de Meta o WHATSAPP_DEFAULT_BUSINESS_ID.
 * @param {string} [phoneNumberId]
 */
export async function dakinisResolveBusinessIdForWhatsapp(phoneNumberId) {
  const { defaultBusinessId, phoneNumberId: envPhoneId } = dakinisWhatsappConfig();
  if (defaultBusinessId) return defaultBusinessId;

  const targetId = String(phoneNumberId || envPhoneId || "").trim();
  if (!targetId) return null;

  const rows = await dakinisQueryAll("SELECT id, config_json FROM business");
  for (const row of rows) {
    if (!row.config_json) continue;
    try {
      const cfg = JSON.parse(row.config_json);
      const wa = cfg?.whatsapp;
      if (
        wa &&
        (String(wa.phoneNumberId) === targetId ||
          String(wa.phone_number_id) === targetId)
      ) {
        return row.id;
      }
    } catch {
      /* ignore */
    }
  }

  if (rows.length === 1) return rows[0].id;
  return null;
}
