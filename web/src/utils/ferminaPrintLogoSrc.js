/** Logo opcional para ticket/comanda — URL absoluta y carga eager para impresión o PDF. */
export function ferminaPrintLogoSrc(logoPath = "") {
  if (!logoPath) return "";
  if (typeof window !== "undefined" && window.location?.origin) {
    try {
      return new URL(logoPath, window.location.origin).href;
    } catch {
      return logoPath;
    }
  }
  return logoPath;
}
