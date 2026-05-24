/**
 * Contacto comercial (Core / Dakinis One).
 * WhatsApp: +34 637 16 91 74 → wa.me sin espacios ni +
 */

function dakinisWhatsAppUrl(raw, fallbackE164) {
  const digits = String(raw ?? "")
    .replace(/\D/g, "")
    .trim();
  if (digits.length >= 9) return `https://wa.me/${digits}`;
  return `https://wa.me/${fallbackE164}`;
}

export const DAKINIS_CONTACT_EMAIL =
  String(import.meta.env.VITE_CONTACT_EMAIL || "").trim() || "contacto@dakinis-systems.com";

export const DAKINIS_CONTACT_WHATSAPP_URL = dakinisWhatsAppUrl(
  import.meta.env.VITE_CONTACT_WHATSAPP,
  "34637169174"
);

export const DAKINIS_CONTACT_WHATSAPP_DISPLAY = "+34 637 16 91 74";
