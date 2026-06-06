import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dakinisTrackEvent, DAKINIS_ANALYTICS_EVENTS } from "../utils/analytics.js";
import { company } from "@dakinis/shared-brand";
import { DAKINIS_URL_CORPORATE } from "../config/product-urls.js";
import { dakinisGoHomeAnchor } from "../utils/homeAnchors.js";
import { DAKINIS_LOGO_LARGE } from "../config/brand-assets.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import PricingHybridSection from "../components/PricingHybridSection.jsx";

function dakinisIsPlatformAdminSession(session) {
  return session?.user?.role === "platform_admin" || session?.business?.type === "platform";
}

/** Entrada SaaS Dakinis One — sin marketing corporativo duplicado. */
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
      navigate("/hub", { replace: true });
    }
  }, [session, navigate]);

  return (
    <>
      <section className="hero product-home">
        <div className="container hero-grid">
          <div>
            <p className="kicker">{company.tradingName}</p>
            <h1>{company.productLineName}</h1>
            <p className="lead hero-benefit">{t("productHome.tagline")}</p>
            <p className="lead">{t("productHome.lead")}</p>
            <div className="hero-actions">
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
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.HUB_OPENED, { from: "product_home" });
                  navigate("/hub");
                }}
              >
                {t("productHome.openHub")}
              </button>
            </div>
            <p className="hero-actions-secondary">
              <a
                href="/#precios"
                className="link-btn"
                onClick={(e) => {
                  e.preventDefault();
                  dakinisGoHomeAnchor(navigate, "precios");
                  dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.DEMO_OPENED, { from: "product_home" });
                }}
              >
                {t("productHome.requestDemo")}
              </a>
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
            <ul>
              <li>{t("productHome.bullet1")}</li>
              <li>{t("productHome.bullet2")}</li>
              <li>{t("productHome.bullet3")}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="modules">
        <div className="container">
          <h2>{t("productHome.whatsIncluded")}</h2>
          <div className="pill-grid">
            {(t("productHome.modules") || []).map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <p className="lead" style={{ marginTop: "1rem" }}>
            {t("productHome.whatsappPitch")}
          </p>
        </div>
      </section>

      <PricingHybridSection variant="saas" showContact />
    </>
  );
}
