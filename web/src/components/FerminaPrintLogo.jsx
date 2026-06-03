/** Logo para ticket/comanda — URL absoluta y carga eager para que no salga en blanco al imprimir o PDF. */
export function ferminaPrintLogoSrc() {
  const path = "/assets/fermina-logo.png";
  if (typeof window !== "undefined" && window.location?.origin) {
    try {
      return new URL(path, window.location.origin).href;
    } catch {
      return path;
    }
  }
  return path;
}

export default function FerminaPrintLogo({ width = 160 }) {
  return (
    <img
      src={ferminaPrintLogoSrc()}
      alt="Fermina Food"
      className="fermina-print-sheet__logo"
      width={width}
      height="auto"
      loading="eager"
      decoding="sync"
    />
  );
}
