import { useLocale } from "../../context/LocaleContext.jsx";
import BusinessNavHeroAskAi from "./BusinessNavHeroAskAi.jsx";

const DAKINIS_BUSINESS_TILES = [
  { key: "clients", icon: "👥", path: "/app/crm" },
  { key: "inventory", icon: "📦", path: "/app/inventario" },
  { key: "sales", icon: "💰", path: "/app/ventas" },
  { key: "reports", icon: "📊", path: "/app/reportes" },
  { key: "whatsapp", icon: "💬", path: "/app/whatsapp" }
];

export default function BusinessNavHero({ navigate, compact = false, showCopilot = !compact }) {
  const { t } = useLocale();

  return (
    <section className={`business-nav-hero${compact ? " business-nav-hero--compact" : ""}`}>
      {!compact ? (
        <div className="business-nav-hero__copy">
          <h2 className="business-nav-hero__title">{t("businessDemo.hero.title")}</h2>
          <p className="lead business-nav-hero__lead">{t("businessDemo.hero.lead")}</p>
          {showCopilot ? <BusinessNavHeroAskAi /> : null}
        </div>
      ) : null}
      <ul className="business-nav-hero__tiles">
        {DAKINIS_BUSINESS_TILES.map((tile) => (
          <li key={tile.key}>
            <button
              type="button"
              className="business-nav-hero__tile"
              onClick={() => navigate(tile.path)}
            >
              <span className="business-nav-hero__icon" aria-hidden>
                {tile.icon}
              </span>
              <span className="business-nav-hero__label">{t(`businessDemo.hero.tiles.${tile.key}`)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
