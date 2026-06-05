/** Configuración visual y operativa del negocio (persistida en business.config_json.settings). */

export const DAKINIS_DEFAULT_BUSINESS_SETTINGS = Object.freeze({
  logoUrl: "",
  primaryColor: "#1a4fd6",
  secondaryColor: "#0f172a",
  businessHours: "L-V 9:00-20:00",
  timezone: "Europe/Madrid",
  currency: "EUR",
  locale: "es",
  vatRate: 21,
  whatsappNumber: "",
  portalSubdomain: "",
  onboardingCompleted: false,
  onboardingStep: 0
});

/**
 * @param {unknown} configJsonRaw
 * @returns {{ settings: typeof DAKINIS_DEFAULT_BUSINESS_SETTINGS, raw: Record<string, unknown> }}
 */
export function dakinisParseBusinessConfig(configJsonRaw) {
  let raw = {};
  if (typeof configJsonRaw === "string" && configJsonRaw.trim()) {
    try {
      raw = JSON.parse(configJsonRaw);
    } catch {
      raw = {};
    }
  } else if (configJsonRaw && typeof configJsonRaw === "object") {
    raw = { ...configJsonRaw };
  }
  const incoming = raw.settings && typeof raw.settings === "object" ? raw.settings : {};
  const settings = {
    ...DAKINIS_DEFAULT_BUSINESS_SETTINGS,
    ...incoming
  };
  if (typeof settings.vatRate === "string") {
    settings.vatRate = Number(settings.vatRate) || DAKINIS_DEFAULT_BUSINESS_SETTINGS.vatRate;
  }
  settings.onboardingCompleted = Boolean(settings.onboardingCompleted);
  settings.onboardingStep = Number(settings.onboardingStep) || 0;
  return { settings, raw };
}

/**
 * @param {Record<string, unknown>} existingRaw
 * @param {Record<string, unknown>} patch
 */
export function dakinisMergeBusinessSettings(existingRaw, patch) {
  const { settings, raw } = dakinisParseBusinessConfig(JSON.stringify(existingRaw));
  const allowed = new Set(Object.keys(DAKINIS_DEFAULT_BUSINESS_SETTINGS));
  const nextSettings = { ...settings };
  for (const [k, v] of Object.entries(patch)) {
    if (!allowed.has(k)) continue;
    if (k === "vatRate") {
      const n = Number(v);
      if (Number.isFinite(n) && n >= 0 && n <= 100) nextSettings.vatRate = n;
      continue;
    }
    if (k === "onboardingStep") {
      nextSettings.onboardingStep = Math.max(0, Number(v) || 0);
      continue;
    }
    if (k === "onboardingCompleted") {
      nextSettings.onboardingCompleted = Boolean(v);
      continue;
    }
    if (typeof v === "string") nextSettings[k] = v.trim();
  }
  return { ...raw, settings: nextSettings };
}

export function dakinisSerializeBusinessConfig(raw) {
  return JSON.stringify(raw);
}
