import { useLocale } from "../../context/LocaleContext.jsx";

/** Resumen rápido para dueño de restaurante (demo / sistema). */
export default function RestaurantBusinessIntro() {
  const { t } = useLocale();
  const kpis = t("restaurant.businessKpis") || [];

  return (
    <section className="restaurant-business-intro card">
      <p className="kicker">{t("restaurant.businessKicker")}</p>
      <h3 style={{ margin: "0.25rem 0 0" }}>{t("restaurant.businessTitle")}</h3>
      <p className="lead" style={{ margin: "0.35rem 0 1rem", fontSize: "0.95rem" }}>
        {t("restaurant.businessLead")}
      </p>
      {Array.isArray(kpis) && kpis.length ? (
        <div className="restaurant-business-intro__kpis">
          {kpis.map((kpi) => (
            <article key={kpi.label} className="restaurant-business-intro__kpi">
              <p className="kpi-label">{kpi.label}</p>
              <p className="kpi-value">{kpi.value}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
