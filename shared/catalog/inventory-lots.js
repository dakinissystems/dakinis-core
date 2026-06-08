/** Ubicaciones por defecto (nevera, congelador, almacén). */
export const DAKINIS_DEFAULT_STOCK_LOCATIONS = [
  { slug: "nevera-1", name: "Nevera 1", kind: "fridge", sortOrder: 1 },
  { slug: "nevera-2", name: "Nevera 2", kind: "fridge", sortOrder: 2 },
  { slug: "congelador", name: "Congelador", kind: "freezer", sortOrder: 3 },
  { slug: "almacen", name: "Almacén", kind: "storage", sortOrder: 4 },
  { slug: "sala", name: "Sala / mostrador", kind: "floor", sortOrder: 5 },
  { slug: "prep", name: "Cocina / elaboración", kind: "prep", sortOrder: 6 }
];

/** Días para semáforo de caducidad. */
export const DAKINIS_EXPIRY_CRITICAL_DAYS = 3;
export const DAKINIS_EXPIRY_WARNING_DAYS = 7;

export function dakinisExpirySeverity(expiryDateIso, now = new Date()) {
  const exp = new Date(expiryDateIso);
  if (Number.isNaN(exp.getTime())) return "unknown";
  const days = Math.ceil((exp.getTime() - now.getTime()) / 86_400_000);
  if (days < 0) return "expired";
  if (days <= DAKINIS_EXPIRY_CRITICAL_DAYS) return "critical";
  if (days <= DAKINIS_EXPIRY_WARNING_DAYS) return "warning";
  return "ok";
}

export function dakinisDaysUntilExpiry(expiryDateIso, now = new Date()) {
  const exp = new Date(expiryDateIso);
  if (Number.isNaN(exp.getTime())) return null;
  return Math.ceil((exp.getTime() - now.getTime()) / 86_400_000);
}

export function dakinisLotQrUrl(labelCode, size = 200) {
  const code = String(labelCode || "").trim();
  if (!code) return "";
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(code)}`;
}

export function dakinisIsLotLabelCode(code) {
  return /^LOT-\d{4}-\d{6}$/i.test(String(code || "").trim());
}
