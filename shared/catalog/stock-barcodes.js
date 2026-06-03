/** Códigos demo EAN-13 por slug (estables para QR / barras en cocina-stock). */
export function dakinisStockDemoBarcode(slug) {
  const s = String(slug || "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const body = String(770000000000 + (h % 999999999)).padStart(9, "0");
  return `77${body}`;
}

export function dakinisNormalizeStockScanCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

/** Resuelve código escaneado → itemSlug usando barcode, slug o alias DK-*. */
export function dakinisResolveStockItemSlug(scanCode, items) {
  const norm = dakinisNormalizeStockScanCode(scanCode);
  if (!norm || !Array.isArray(items)) return null;

  for (const item of items) {
    const slug = item.slug;
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
