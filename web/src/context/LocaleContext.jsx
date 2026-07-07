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
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    vars && vars[k] !== undefined ? String(vars[k]) : `{${k}}`
  );
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
    (key, vars) => {
      const fromEn = dakinisGetByPath(DAKINIS_LOCALES.en, key);
      const fromLocale = dakinisGetByPath(DAKINIS_LOCALES[locale], key);
      const fromEs = dakinisGetByPath(DAKINIS_LOCALES.es, key);
      const val = fromLocale !== undefined ? fromLocale : fromEs !== undefined ? fromEs : fromEn;
      if (val === undefined) return key;
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
