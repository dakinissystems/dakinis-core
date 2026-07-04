import { randomUUID } from "node:crypto";
import { dakinisSqlTimestampNow } from "../db/dialect.js";
import { dakinisQueryOne, dakinisRun } from "../db/query.js";

export async function dakinisUpsertWhatsappContactInline(businessId, phone, profileName) {
  const now = dakinisSqlTimestampNow();
  const existing = await dakinisQueryOne(
    `SELECT id FROM tenant_whatsapp_contacts WHERE business_id = ? AND phone = ?`,
    [businessId, phone]
  );
  if (existing) {
    await dakinisRun(
      `UPDATE tenant_whatsapp_contacts SET last_seen_at = ${now}, wa_profile_name = COALESCE(?, wa_profile_name) WHERE id = ?`,
      [profileName || null, existing.id]
    );
    return existing.id;
  }

  const id = `wac_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  await dakinisRun(
    `INSERT INTO tenant_whatsapp_contacts (id, business_id, phone, wa_profile_name, last_seen_at)
     VALUES (?, ?, ?, ?, ${now})`,
    [id, businessId, phone, profileName || null]
  );
  return id;
}
