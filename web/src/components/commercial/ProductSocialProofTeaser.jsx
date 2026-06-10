import { useLocale } from "../../context/LocaleContext.jsx";

export default function ProductSocialProofTeaser({ onContact }) {
  const { t } = useLocale();

  return (
    <aside className="product-social-teaser card">
      <p className="kicker">{t("productHome.socialProof.kicker")}</p>
      <h2 className="product-social-teaser__title">{t("productHome.socialProof.title")}</h2>
      <p className="lead">{t("productHome.socialProof.lead")}</p>
      <blockquote className="product-social-teaser__quote">{t("productHome.socialProof.quotePreview")}</blockquote>
      {onContact ? (
        <button type="button" className="btn btn-outline" onClick={onContact}>
          {t("productHome.socialProof.cta")}
        </button>
      ) : null}
    </aside>
  );
}
