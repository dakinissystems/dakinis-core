import { useLocale } from "../../context/LocaleContext.jsx";

const MODULE_IDS = ["crm", "whatsapp", "inventory", "reservations", "ai", "portal"];

export default function ModuleMarketplaceVisual() {
  const { t } = useLocale();
  const modules = t("commercial.marketplace.modules") || {};

  return (
    <section className="commercial-marketplace">
      <p className="kicker">{t("commercial.marketplace.kicker")}</p>
      <h3 style={{ margin: "0.25rem 0 0.5rem" }}>{t("commercial.marketplace.title")}</h3>
      <p className="lead" style={{ fontSize: "0.95rem", marginTop: 0 }}>
        {t("commercial.marketplace.lead")}
      </p>

      <ul className="commercial-marketplace__grid">
        {MODULE_IDS.map((id) => {
          const mod = modules[id] || {};
          return (
            <li key={id} className="card commercial-marketplace__item">
              <label className="commercial-marketplace__label">
                <input type="checkbox" defaultChecked={mod.defaultOn !== false} readOnly />
                <span className="commercial-marketplace__name">{mod.name || id}</span>
              </label>
              <p className="kpi-label" style={{ margin: "0.35rem 0 0" }}>
                {mod.roi || ""}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
