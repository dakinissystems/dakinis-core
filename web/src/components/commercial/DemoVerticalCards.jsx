import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import { DAKINIS_DEMO_VERTICALS } from "../../data/demoCommercialContent.js";
import { useLocale } from "../../context/LocaleContext.jsx";
import { dakinisTrackEvent, DAKINIS_ANALYTICS_EVENTS } from "../../utils/analytics.js";

const dakinisSystemRegistry = dakinisGetSystemRegistry();

export default function DemoVerticalCards({ navigate, variant = "grid" }) {
  const { t } = useLocale();

  return (
    <div className={`demo-vertical-cards demo-vertical-cards--${variant}`}>
      {DAKINIS_DEMO_VERTICALS.map((key) => {
        const label = dakinisSystemRegistry[key]?.label || key;
        return (
          <article key={key} className="card demo-vertical-card">
            <p className="kpi-label">{label}</p>
            <ul className="commercial-roi-list commercial-roi-list--compact">
              {(t(`commercial.roi.${key}`) || []).slice(0, 2).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <button
              type="button"
              className="btn demo-vertical-card__cta"
              onClick={() => {
                dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.DEMO_OPENED, { vertical: key, from: "vertical_cards" });
                navigate(`/demo/${encodeURIComponent(key)}`);
              }}
            >
              {t("commercial.tryDemo")}
            </button>
          </article>
        );
      })}
    </div>
  );
}
