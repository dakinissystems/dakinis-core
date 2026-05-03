import { useLocale } from "../context/LocaleContext.jsx";

function LegalShell({ navigate, title, children }) {
  const { t } = useLocale();
  return (
    <div className="container legal-page">
      <p className="legal-back">
        <button type="button" className="link-btn" onClick={() => navigate("/")}>
          {t("legal.back")}
        </button>
      </p>
      <h1>{title}</h1>
      <div className="legal-prose">{children}</div>
    </div>
  );
}

export function FaqPage({ navigate }) {
  const { t } = useLocale();
  return (
    <LegalShell navigate={navigate} title={t("legal.faq.title")}>
      <p>{t("legal.faq.body")}</p>
    </LegalShell>
  );
}

export function PrivacyPage({ navigate }) {
  const { t } = useLocale();
  return (
    <LegalShell navigate={navigate} title={t("legal.privacy.title")}>
      <p>{t("legal.privacy.body")}</p>
    </LegalShell>
  );
}

export function TermsPage({ navigate }) {
  const { t } = useLocale();
  return (
    <LegalShell navigate={navigate} title={t("legal.terms.title")}>
      <p>{t("legal.terms.body")}</p>
    </LegalShell>
  );
}

export function LegalNoticePage({ navigate }) {
  const { t } = useLocale();
  return (
    <LegalShell navigate={navigate} title={t("legal.notice.title")}>
      <p>{t("legal.notice.body")}</p>
    </LegalShell>
  );
}
