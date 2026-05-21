import { useLocale } from "../context/LocaleContext.jsx";
import { DAKINIS_MARKETING_SITE_URL } from "../config/product-urls.js";

function LegalShell({ navigate, docKey }) {
  const { t } = useLocale();
  const doc = t(`legal.${docKey}`);
  const isDoc = doc && typeof doc === "object" && !Array.isArray(doc);
  const title = isDoc && doc.title ? doc.title : docKey;
  const sections =
    isDoc && Array.isArray(doc.sections)
      ? doc.sections
      : isDoc && doc.body
        ? [{ h: null, p: doc.body }]
        : [];

  return (
    <div className="container legal-page">
      <p className="legal-back">
        <button type="button" className="link-btn" onClick={() => navigate("/")}>
          {t("legal.back")}
        </button>
      </p>
      <h1>{title}</h1>
      {t("legal.updated") ? <p className="kpi-label">{t("legal.updated")}</p> : null}
      <div className="legal-prose">
        {sections.map((section) => (
          <section key={section.h || section.p.slice(0, 24)}>
            {section.h ? <h2>{section.h}</h2> : null}
            <p>{section.p}</p>
          </section>
        ))}
      </div>
      <p className="kpi-label" style={{ marginTop: "1.5rem" }}>
        <a href={DAKINIS_MARKETING_SITE_URL} target="_blank" rel="noreferrer">
          {t("legal.corporateLink")}
        </a>
      </p>
    </div>
  );
}

export function FaqPage({ navigate }) {
  return <LegalShell navigate={navigate} docKey="faq" />;
}

export function PrivacyPage({ navigate }) {
  return <LegalShell navigate={navigate} docKey="privacy" />;
}

export function TermsPage({ navigate }) {
  return <LegalShell navigate={navigate} docKey="terms" />;
}

export function LegalNoticePage({ navigate }) {
  return <LegalShell navigate={navigate} docKey="notice" />;
}
