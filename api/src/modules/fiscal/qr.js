/**
 * Build QR payload / verification URL for a fiscal invoice.
 * Format is intentionally versioned; align with AEAT published QR when wiring production.
 *
 * @param {{
 *   invoiceNumber: string,
 *   issuerTaxId: string,
 *   totalAmount: number,
 *   issuedAt: string,
 *   recordHash: string,
 *   invoiceId: string
 * }} inv
 */
export function dakinisFiscalBuildQr(inv) {
  const issued = String(inv.issuedAt || "").slice(0, 10);
  const nif = String(inv.issuerTaxId || "").replace(/\s+/g, "").toUpperCase();
  const total = Number(inv.totalAmount || 0).toFixed(2);
  const num = String(inv.invoiceNumber || "");
  const hash = String(inv.recordHash || "").slice(0, 16);

  // Placeholder AEAT-style query; replace host/path when official production endpoint is wired.
  const qrUrl =
    `https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR` +
    `?nif=${encodeURIComponent(nif)}` +
    `&numserie=${encodeURIComponent(num)}` +
    `&fecha=${encodeURIComponent(issued)}` +
    `&importe=${encodeURIComponent(total)}`;

  const qrPayload = JSON.stringify({
    v: 1,
    soft: "dakinis-one-fiscal",
    id: inv.invoiceId,
    nif,
    num,
    fecha: issued,
    importe: total,
    huella: hash
  });

  return { qrUrl, qrPayload };
}
