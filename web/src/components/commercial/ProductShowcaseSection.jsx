import { useLocale } from "../../context/LocaleContext.jsx";

const DAKINIS_SHOWCASE_IMAGE_BY_KEY = Object.freeze({
  inventory: "/showcase/inventario.png",
  whatsapp: "/showcase/whatsapp.png",
  sales: "/showcase/ventas.png"
});

export default function ProductShowcaseSection({ onTryDemo }) {
  const { t } = useLocale();
  const items = t("productHome.showcase.items");
  const list = Array.isArray(items) ? items : [];

  return (
    <section className="product-showcase" aria-labelledby="product-showcase-title">
      <p className="kicker">{t("productHome.showcase.kicker")}</p>
      <h2 id="product-showcase-title">{t("productHome.showcase.title")}</h2>
      <p className="lead product-showcase__lead">{t("productHome.showcase.lead")}</p>

      <div className="product-showcase__list">
        {list.map((item, index) => {
          const imageSrc = DAKINIS_SHOWCASE_IMAGE_BY_KEY[item.key];
          if (!imageSrc) return null;
          const reversed = index % 2 === 1;

          return (
            <article
              key={item.key}
              className={`product-showcase__item${reversed ? " product-showcase__item--reversed" : ""}`}
            >
              <div className="product-showcase__copy">
                <p className="product-showcase__problem">
                  <span className="product-showcase__problem-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.problemLabel}</span>
                </p>
                <h3 className="product-showcase__item-title">{item.title}</h3>
                <p className="lead product-showcase__item-text">{item.text}</p>
              </div>
              <figure className="product-showcase__figure card">
                <img
                  src={imageSrc}
                  alt={item.imageAlt}
                  className="product-showcase__image"
                  loading="lazy"
                  width={640}
                  height={480}
                />
              </figure>
            </article>
          );
        })}
      </div>

      {onTryDemo ? (
        <div className="product-showcase__cta-wrap">
          <button type="button" className="btn" onClick={onTryDemo}>
            {t("productHome.showcase.cta")}
          </button>
        </div>
      ) : null}
    </section>
  );
}
