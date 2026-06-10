import { useLocale } from "../../context/LocaleContext.jsx";

export default function ProductVideoSection({ onTryDemo, onPricing }) {
  const { t } = useLocale();
  const scenes = t("productHome.video.scenes");
  const sceneList = Array.isArray(scenes) ? scenes : [];

  return (
    <section className="product-video card" aria-labelledby="product-video-title">
      <p className="kicker">{t("productHome.video.kicker")}</p>
      <h2 id="product-video-title">{t("productHome.video.title")}</h2>
      <p className="lead product-video__lead">{t("productHome.video.lead")}</p>

      <div className="product-video__player" role="group" aria-label={t("productHome.video.playerAria")}>
        <div className="product-video__placeholder">
          <span className="product-video__placeholder-icon" aria-hidden="true">
            ▶
          </span>
          <p className="product-video__placeholder-label">{t("productHome.video.placeholder")}</p>
          <p className="kpi-label product-video__placeholder-note">{t("productHome.video.placeholderNote")}</p>
        </div>
      </div>

      <ol className="product-video__scenes">
        {sceneList.map((scene, index) => (
          <li key={scene}>
            <span className="product-video__scene-num">{index + 1}</span>
            <span>{scene}</span>
          </li>
        ))}
      </ol>

      <div className="product-video__actions">
        {onTryDemo ? (
          <button type="button" className="btn" onClick={onTryDemo}>
            {t("productHome.video.cta")}
          </button>
        ) : null}
        {onPricing ? (
          <button type="button" className="btn btn-outline" onClick={onPricing}>
            {t("productHome.video.ctaPricing")}
          </button>
        ) : null}
      </div>
    </section>
  );
}
