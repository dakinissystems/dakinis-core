/** Fecha/hora de la comanda para ticket e impresión PDF. */
export function ferminaFormatOrderPlacedAt(iso, locale = "es-ES") {
  if (!iso) return new Date().toLocaleString(locale);
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(locale);
}
