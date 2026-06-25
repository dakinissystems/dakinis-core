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

/** Lotes de demostración (misma fuente que InventoryLotsPanel hasta API de lotes). */
export function dakinisDemoInventoryLots(now = new Date()) {
  const in3 = new Date(now);
  in3.setDate(in3.getDate() + 3);
  const in7 = new Date(now);
  in7.setDate(in7.getDate() + 6);
  const in30 = new Date(now);
  in30.setDate(in30.getDate() + 28);
  const fmt = (d) => d.toISOString().slice(0, 10);

  const raw = [
    {
      id: "demo-1",
      labelCode: "LOT-2026-000042",
      productName: "Yogur natural 1L",
      supplierLot: "YG2548",
      expiryDate: fmt(in3),
      quantityRemaining: 24,
      locationName: "Nevera 1"
    },
    {
      id: "demo-2",
      labelCode: "LOT-2026-000041",
      productName: "Queso manchego",
      supplierLot: "QM1122",
      expiryDate: fmt(in7),
      quantityRemaining: 8,
      locationName: "Nevera 2"
    },
    {
      id: "demo-3",
      labelCode: "LOT-2026-000040",
      productName: "Pollo troceado",
      supplierLot: "PO8891",
      expiryDate: fmt(in30),
      quantityRemaining: 12,
      locationName: "Congelador"
    }
  ];

  return raw.map((lot) => {
    const daysUntilExpiry = dakinisDaysUntilExpiry(lot.expiryDate, now);
    return {
      ...lot,
      daysUntilExpiry,
      expirySeverity: dakinisExpirySeverity(lot.expiryDate, now)
    };
  });
}

export function dakinisLotQrUrl(labelCode, size = 200) {
  const code = String(labelCode || "").trim();
  if (!code) return "";
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(code)}`;
}

export function dakinisIsLotLabelCode(code) {
  return /^LOT-\d{4}-\d{6}$/i.test(String(code || "").trim());
}
