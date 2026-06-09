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

export default function FerminaPrintLogo({ width = 160, src = "" }) {
  const resolved = ferminaPrintLogoSrc(src);
  if (!resolved) return null;
  return (
    <img
      src={resolved}
      alt=""
      className="fermina-print-sheet__logo"
      width={width}
      height="auto"
      loading="eager"
      decoding="sync"
    />
  );
}
