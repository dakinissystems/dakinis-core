import { useLocale } from "../context/LocaleContext.jsx";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="lang-switch" role="group" aria-label={t("nav.language")}>
      <button
        type="button"
        className={`lang-switch-btn${locale === "es" ? " is-active" : ""}`}
        onClick={() => setLocale("es")}
        aria-pressed={locale === "es"}
      >
        ES
      </button>
      <button
        type="button"
        className={`lang-switch-btn${locale === "en" ? " is-active" : ""}`}
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
