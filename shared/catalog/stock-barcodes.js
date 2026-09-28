/** Check digit GTIN para códigos demo EAN-13. */
function dakinisGtinCheckDigit(bodyWithoutCheck) {
  const digits = String(bodyWithoutCheck)
    .split("")
    .map((d) => Number(d));
  let sum = 0;
  for (let i = digits.length - 1, pos = 0; i >= 0; i--, pos++) {
    sum += digits[i] * (pos % 2 === 0 ? 3 : 1);
  }
  return String((10 - (sum % 10)) % 10);
}

/** Códigos demo EAN-13 por slug (estables + checksum válido para cámara). */
export function dakinisStockDemoBarcode(slug) {
  const s = String(slug || "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const body12 = `770${String(h % 1_000_000_000).padStart(9, "0")}`.slice(0, 12);
  return `${body12}${dakinisGtinCheckDigit(body12)}`;
}

export function dakinisNormalizeStockScanCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

/** Slug estable para insumo creado desde un código escaneado. */
export function dakinisSlugFromBarcode(code) {
  const norm = dakinisNormalizeStockScanCode(code);
  if (!norm) return null;
  const body = norm.replace(/[^A-Z0-9]/g, "").toLowerCase().slice(0, 40);
  return body ? `bc-${body}` : null;
}

export function dakinisSlugFromName(name) {
  const s = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return s || null;
}

/** Resuelve código escaneado → itemSlug usando barcode, slug o alias DK-*. */
export function dakinisResolveStockItemSlug(scanCode, items) {
  const norm = dakinisNormalizeStockScanCode(scanCode);
  if (!norm || !Array.isArray(items)) return null;

  const barcodeSlug = dakinisSlugFromBarcode(norm);

  for (const item of items) {
    const slug = item.slug;
    if (barcodeSlug && slug === barcodeSlug) return slug;
    const barcode = item.barcode || dakinisStockDemoBarcode(slug);
    const aliases = [
      barcode,
      slug,
      slug.toUpperCase(),
      `DK-${slug}`,
      `DK${slug}`.replace(/-/g, "")
    ];
    for (const raw of aliases) {
      if (dakinisNormalizeStockScanCode(raw) === norm) return slug;
    }
  }
  return null;
}
