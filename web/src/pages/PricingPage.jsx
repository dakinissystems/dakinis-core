import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLocale } from "../context/LocaleContext.jsx";
import PricingHybridSection from "../components/PricingHybridSection.jsx";

export default function PricingPage() {
  const { t } = useLocale();
  const location = useLocation();

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
          <p className="lead">{t("pricingPage.lead")}</p>
        </div>
      </section>
      <PricingHybridSection variant="full" showContact sectionId="precios" />
    </>
  );
}
