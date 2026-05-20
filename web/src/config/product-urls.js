/**
 * Sitio corporativo (landing). Core no enlaza al resto del ecosistema desde aquí.
 */

function dakinisNormalizeUrl(raw, fallback) {
  const u = String(raw ?? "").trim();
  if (!u) return fallback;
  try {
    const parsed = new URL(u);
    return parsed.href.endsWith("/") ? parsed.href : `${parsed.href}/`;
  } catch {
    return fallback;
  }
}

export const DAKINIS_MARKETING_SITE_URL = dakinisNormalizeUrl(
  import.meta.env.VITE_MARKETING_SITE_URL || import.meta.env.VITE_LANDING_SITE_URL,
  "https://dakinissystems.com/"
);
