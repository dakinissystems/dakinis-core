import { ferminaPrintLogoSrc } from "../utils/ferminaPrintLogoSrc.js";

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
