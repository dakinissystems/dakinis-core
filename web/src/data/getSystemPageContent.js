import systemPagesEs from "../locales/systemPages.es.js";
import systemPagesEn from "../locales/systemPages.en.js";

export function dakinisGetSystemPageContent(locale, verticalKey) {
  const map = locale === "en" ? systemPagesEn : systemPagesEs;
  return map[verticalKey] ?? map.clinica;
}
