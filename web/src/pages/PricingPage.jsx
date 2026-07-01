import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisTrackEvent, DAKINIS_ANALYTICS_EVENTS } from "../utils/analytics.js";
import PricingHybridSection from "../components/PricingHybridSection.jsx";

export default function PricingPage() {
  const { t } = useLocale();
  const location = useLocation();

  useEffect(() => {
    dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.CORE_PRICING_VIEW, { surface: "pricing_page" });
  }, []);

  useEffect(() => {
    if (location.hash !== "#contact") return undefined;
    const timer = window.setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [location.hash]);

  return (
    <>
      <section className="modules pricing-page-intro">
        <div className="container">
          <p className="kicker">{t("pricingPage.kicker")}</p>
          <h1>{t("pricingPage.title")}</h1>
          <p className="lead pricing-page-intro__value">{t("pricingPage.valueHeadline")}</p>
          <p className="lead pricing-page-intro__subvalue">{t("pricingPage.valueSubheadline")}</p>
          <ul className="pricing-page-intro__points">
            {(t("pricingPage.leadPoints") || []).map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </section>
      <PricingHybridSection variant="full" showContact sectionId="precios" />
    </>
  );
}
