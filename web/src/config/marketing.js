/**
 * Landing corporativa (Dakinis Systems). Configurable en build con VITE_MARKETING_SITE_URL.
 */

function dakinisNormalizeMarketingUrl(raw) {
  const fallback = "https://dakinissystems.onrender.com/";
  const u = String(raw ?? "").trim();
  if (!u) return fallback;
  try {
    const parsed = new URL(u);
    return parsed.href.endsWith("/") ? parsed.href : `${parsed.href}/`;
  } catch {
    return fallback;
  }
}

export const DAKINIS_MARKETING_SITE_URL = dakinisNormalizeMarketingUrl(
  import.meta.env.VITE_MARKETING_SITE_URL
);
