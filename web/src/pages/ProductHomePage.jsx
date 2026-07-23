import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dakinisTrackEvent, DAKINIS_ANALYTICS_EVENTS } from "../utils/analytics.js";
import { DAKINIS_URL_CORPORATE } from "../config/product-urls.js";
import { DAKINIS_LOGO_LARGE } from "../config/brand-assets.js";
import { company } from "@dakinis/shared-brand";
import { useLocale } from "../context/LocaleContext.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisIsPlatformAdminSession } from "../utils/businessDemoMode.js";
import DemoVerticalCards from "../components/commercial/DemoVerticalCards.jsx";
import ExcelVsDakinisTable from "../components/commercial/ExcelVsDakinisTable.jsx";
import ExcelCostSimulator from "../components/commercial/ExcelCostSimulator.jsx";
import ModuleMarketplaceVisual from "../components/commercial/ModuleMarketplaceVisual.jsx";
import GettingStartedSteps from "../components/commercial/GettingStartedSteps.jsx";
import ProductShowcaseSection from "../components/commercial/ProductShowcaseSection.jsx";
import ProductVideoSection from "../components/commercial/ProductVideoSection.jsx";
import ProductSocialProofTeaser from "../components/commercial/ProductSocialProofTeaser.jsx";

/** Entrada SaaS Dakinis One — funnel problema → ahorro → confianza → demo → extras. */
export default function ProductHomePage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { session } = useDakinisSession();

  useEffect(() => {
    if (!session?.token) return;
    if (dakinisIsPlatformAdminSession(session)) {
      navigate("/hub", { replace: true });
      return;
    }
    if (session.business?.type && session.business.type !== "platform") {
      navigate("/app/dashboard", { replace: true });
    }
  }, [session?.token, session?.user?.role, session?.business?.type, navigate]);

  useEffect(() => {
    dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.CORE_PAGE_VIEW, { surface: "product_home" });
  }, []);

  const openDemo = () => {
    dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.DEMO_OPENED, { from: "product_home_calculator" });
    navigate("/demo/restaurante");
  };

  return (
    <>
      <section className="hero product-home">
        <div className="container hero-grid">
          <div>
            <p className="kicker">{t("productHome.kicker")}</p>
            <h1>{t("productHome.h1")}</h1>
            <p className="lead hero-benefit">{t("productHome.tagline")}</p>
            <p className="lead">{t("productHome.lead")}</p>
            <div className="hero-actions">
              <button
                type="button"
                className="btn btn-lg product-home__demo-cta"
                onClick={() => {
                  dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.DEMO_OPENED, { from: "product_home_hero" });
                  navigate("/demo/restaurante");
                }}
              >
                {t("commercial.tryDemo")}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.LOGIN_STARTED, { from: "product_home" });
                  navigate("/login");
                }}
              >
                {t("productHome.login")}
              </button>
              <a href="#excel-simulator" className="btn btn-outline">
                {t("productHome.calcLink")}
              </a>
            </div>
            <p className="hero-actions-secondary">
              <button type="button" className="link-btn" onClick={() => navigate("/precios")}>
                {t("productHome.viewPlans")}
              </button>
              <span className="hero-actions-dot">·</span>
              <a href={DAKINIS_URL_CORPORATE} className="link-btn" target="_blank" rel="noreferrer">
                {t("productHome.corporateSite")}
              </a>
            </p>
          </div>
          <div className="hero-card">
            <img
              src={DAKINIS_LOGO_LARGE}
              alt={company.productLineName}
              className="hero-logo"
              width={320}
              height={120}
              loading="eager"
            />
            <ul className="product-home__hero-outcomes">
              {(t("productHome.heroOutcomes") || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="commercial-section product-home__calculator-section">
        <div className="container">
          <ExcelCostSimulator onTryDemo={openDemo} />
        </div>
      </section>

      <section className="commercial-section commercial-section--alt">
        <div className="container card commercial-trust-card">
          <p className="kicker">{t("productHome.trustKicker")}</p>
          <h2 className="commercial-trust-card__title">{t("productHome.trustTitle")}</h2>
          <p className="lead commercial-trust-card__experience">{t("productHome.trustExperience")}</p>
          <p className="commercial-trust-card__subtitle">{t("productHome.trustSubtitle")}</p>
          <p className="commercial-trust-card__story">{t("productHome.trustStory")}</p>
          <ul className="commercial-roi-list commercial-trust-list">
            {(t("productHome.trustBullets") || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="commercial-section">
        <div className="container">
          <GettingStartedSteps />
        </div>
      </section>

      <section className="commercial-section commercial-section--alt product-home__showcase-section">
        <div className="container">
          <ProductShowcaseSection onTryDemo={openDemo} />
        </div>
      </section>

      <section className="commercial-section">
        <div className="container">
          <ProductVideoSection onTryDemo={openDemo} onPricing={() => navigate("/precios")} />
        </div>
      </section>

      <section className="modules commercial-section">
        <div className="container">
          <h2>{t("productHome.demosTitle")}</h2>
          <p className="lead">{t("productHome.demosLead")}</p>
          <DemoVerticalCards navigate={navigate} />
        </div>
      </section>

      <section className="commercial-section commercial-section--alt">
        <div className="container">
          <ExcelVsDakinisTable />
        </div>
      </section>

      <section className="modules">
        <div className="container">
          <h2>{t("productHome.whatsIncluded")}</h2>
          <div className="pill-grid">
            {(t("productHome.screenItems") || []).map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <p className="lead product-home__whatsapp-pitch">{t("productHome.whatsappPitch")}</p>
        </div>
      </section>

      <section className="commercial-section commercial-section--alt">
        <div className="container">
          <ModuleMarketplaceVisual />
          <p className="lead product-home__extras-hint">{t("productHome.extrasHint")}</p>
        </div>
      </section>

      <section className="commercial-section commercial-section--alt">
        <div className="container">
          <ProductSocialProofTeaser onContact={() => navigate("/precios#contact")} />
        </div>
      </section>

      <section className="modules commercial-section">
        <div className="container card pricing-page-cta">
          <p className="kicker">{t("productHome.pricingCtaKicker")}</p>
          <h2 style={{ marginTop: "0.25rem" }}>{t("productHome.pricingCtaTitle")}</h2>
          <p className="lead">{t("productHome.pricingCtaLead")}</p>
          <button type="button" className="btn" onClick={() => navigate("/precios")}>
            {t("productHome.viewPlans")}
          </button>
        </div>
      </section>
    </>
  );
}
