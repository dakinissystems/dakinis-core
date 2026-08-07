import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
import es from "../locales/es.js";
import en from "../locales/en.js";

const DAKINIS_LOCALE_KEY = "dakinis-locale";
const DAKINIS_LOCALES = Object.freeze({ es, en });

function dakinisGetByPath(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) cur = cur[p];
    else return undefined;
  }
  return cur;
}

function dakinisInterpolate(template, vars) {
  if (template == null || typeof template !== "string") return template;
  if (!vars || typeof vars !== "object") return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{${k}}`
  );
}

/** Evita filtrar claves i18n tipo `fermina.viewPedido` a la UI. */
function dakinisHumanizeI18nKey(key) {
  const leaf = String(key || "").split(".").pop() || String(key || "");
  const spaced = leaf.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * @param {string} key
 * @param {string|object} [varsOrFallback] objeto de vars, o string fallback
 * @param {object} [maybeVars] vars si el 2º arg es fallback string
 */
function dakinisResolveLocaleArgs(varsOrFallback, maybeVars) {
  if (typeof varsOrFallback === "string") {
    return {
      fallback: varsOrFallback,
      vars: maybeVars && typeof maybeVars === "object" ? maybeVars : undefined
    };
  }
  if (varsOrFallback && typeof varsOrFallback === "object") {
    return { fallback: undefined, vars: varsOrFallback };
  }
  return { fallback: undefined, vars: undefined };
}

const LocaleContext = createContext(null);

function dakinisReadInitialLocale() {
  try {
    const stored = localStorage.getItem(DAKINIS_LOCALE_KEY);
    if (stored === "en" || stored === "es") return stored;
  } catch {
    /* ignore */
  }
  if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("en")) {
    return "en";
  }
  return "es";
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(dakinisReadInitialLocale);

  const setLocale = useCallback((next) => {
    if (next !== "en" && next !== "es") return;
    setLocaleState(next);
    try {
      localStorage.setItem(DAKINIS_LOCALE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key, varsOrFallback, maybeVars) => {
      const { fallback, vars } = dakinisResolveLocaleArgs(varsOrFallback, maybeVars);
      const fromEn = dakinisGetByPath(DAKINIS_LOCALES.en, key);
      const fromLocale = dakinisGetByPath(DAKINIS_LOCALES[locale], key);
      const fromEs = dakinisGetByPath(DAKINIS_LOCALES.es, key);
      const val = fromLocale !== undefined ? fromLocale : fromEs !== undefined ? fromEs : fromEn;
      if (val === undefined) {
        if (fallback !== undefined) return dakinisInterpolate(fallback, vars);
        if (typeof key === "string" && key.includes(".")) return dakinisHumanizeI18nKey(key);
        return key;
      }
      if (Array.isArray(val)) return val;
      if (typeof val === "string") return dakinisInterpolate(val, vars);
      return val;
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "es";
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = use(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

function useLocaleOptional() {
  return use(LocaleContext);
}
