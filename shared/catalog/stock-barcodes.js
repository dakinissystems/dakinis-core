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
  let out = "";
  for (const ch of String(code || "").trim()) {
    if (ch === " " || ch === "\n" || ch === "\r" || ch === "\t") continue;
    out += ch.toUpperCase();
  }
  return out;
}

/** Slug estable para insumo creado desde un código escaneado. */
export function dakinisSlugFromBarcode(code) {
  const norm = dakinisNormalizeStockScanCode(code);
  if (!norm) return null;
  let body = "";
  for (const ch of norm) {
    const code = ch.charCodeAt(0);
    const digit = code >= 48 && code <= 57;
    const upper = code >= 65 && code <= 90;
    if (digit || upper) body += ch.toLowerCase();
    if (body.length === 40) break;
  }
  return body ? `bc-${body}` : null;
}

export function dakinisSlugFromName(name) {
  let out = "";
  let dash = false;
  for (const ch of String(name || "").trim().toLowerCase()) {
    const code = ch.charCodeAt(0);
    const ok = (code >= 97 && code <= 122) || (code >= 48 && code <= 57);
    if (ok) {
      if (out.length === 48) break;
      out += ch;
      dash = false;
    } else if (out && !dash && out.length < 48) {
      out += "-";
      dash = true;
    }
  }
  if (out.endsWith("-")) out = out.slice(0, -1);
  return out || null;
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
