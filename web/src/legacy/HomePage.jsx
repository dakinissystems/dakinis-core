import { useMemo } from "react";
import { dakinisFormatBusinessTypeLabel } from "@dakinis/shared/catalog/business-type-display.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import PricingHybridSection from "../components/PricingHybridSection.jsx";
import { DAKINIS_LOGO_LARGE } from "../config/brand-assets.js";
import { dakinisIsSeedDemoTenantSession } from "../utils/demoSession.js";
import { dakinisIsPlatformAdminSession } from "../utils/businessDemoMode.js";

export default function HomePage({ navigate, dakinisSystemRegistry }) {
  const { session } = useDakinisSession();
  const { t } = useLocale();

  const sistemaButtons = useMemo(() => {
    const all = Object.entries(dakinisSystemRegistry);
    if (!session?.token) return all;
    if (dakinisIsPlatformAdminSession(session)) return all;
    const tenantType = session.business?.type;
    if (tenantType) return all.filter(([key]) => key === tenantType);
    return all;
  }, [session, dakinisSystemRegistry]);

  const vistaButtons = useMemo(() => {
    const all = Object.entries(dakinisSystemRegistry);
    if (!session?.token) return all;
    if (dakinisIsPlatformAdminSession(session)) return all;
    const tenantType = session.business?.type;
    if (tenantType) return all.filter(([key]) => key === tenantType);
    return all;
  }, [session, dakinisSystemRegistry]);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="kicker">{t("home.hero.kicker")}</p>
            <h1>
              {t("home.hero.h1Line1")}
              <br />
              {t("home.hero.h1Line2")}
              <br />
              {t("home.hero.h1Line3")}
            </h1>
            <p className="lead hero-benefit">{t("home.hero.benefit")}</p>
            <p className="lead">{t("home.hero.demoLead")}</p>
            <div className="hero-actions">
              <a href="#contact" className="btn">
                {t("home.hero.ctaQuote")}
              </a>
              <a href="#contact" className="btn btn-outline">
                {t("home.hero.ctaTalk")}
              </a>
            </div>
            <p className="hero-actions-secondary">
              <button type="button" className="link-btn" onClick={() => navigate("/login")}>
                {t("home.hero.loginAdmin")}
              </button>
              <span className="hero-actions-dot">·</span>
              <a href="#modulos" className="link-btn">
                {t("home.hero.viewDemos")}
              </a>
            </p>
            <p className="lead">{t("home.hero.stack")}</p>
          </div>
          <div className="hero-card">
            <img
              src={DAKINIS_LOGO_LARGE}
              alt="Dakinis One"
              className="hero-logo"
              width={320}
              height={120}
              loading="eager"
            />
            <ul>
              <li>
                {t("home.hero.cardLi1Prefix")}
                <code>x-business-id</code>
                {t("home.hero.cardLi1Suffix")}
              </li>
              <li>{t("home.hero.cardLi2")}</li>
              <li>{t("home.hero.cardLi3")}</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="modulos" className="modules">
        <div className="container">
          <h2>{t("home.modules.title")}</h2>
          <p className="lead">
            {t("home.modules.lead")}&nbsp;
            <code>dakinis-dev-key</code>
          </p>
          {session?.token && dakinisIsSeedDemoTenantSession(session) && !dakinisIsPlatformAdminSession(session) ? (
            <article className="home-demo-tenant-ribbon card">
              <h3 className="home-demo-tenant-ribbon-title">{t("home.demoTenant.ribbonTitle")}</h3>
              <p className="lead">{t("home.demoTenant.ribbonLead")}</p>
              <p className="home-demo-tenant-benefit-intro">{t("home.demoTenant.benefitIntro")}</p>
              <ul className="demo-tenant-benefits">
                {(() => {
                  const key = session.business?.type;
                  const raw = key ? t(`systemDemo.verticals.${key}.benefits`) : [];
                  return Array.isArray(raw) ? raw : [];
                })().map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <div className="demo-tenant-welcome-actions">
                <button
                  type="button"
                  className="btn demo-tenant-welcome-cta"
                  onClick={() => navigate(`/sistema/${encodeURIComponent(session.business.type)}`)}
                >
                  {t("home.demoTenant.toPanel")}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate(`/vista/${encodeURIComponent(session.business.type)}`)}
                >
                  {t("home.demoTenant.toMockup")}
                </button>
              </div>
            </article>
          ) : null}
          <div className="system-switcher">
            {dakinisIsPlatformAdminSession(session) ? (
              <button type="button" className="system-btn active" onClick={() => navigate("/admin")}>
                {t("home.modules.adminCta")}
              </button>
            ) : null}
            {sistemaButtons.map(([systemKey, systemInfo]) => (
              <button
                key={systemKey}
                type="button"
                className="system-btn"
                onClick={() => navigate(`/sistema/${encodeURIComponent(systemKey)}`)}
              >
                {systemInfo.label}
              </button>
            ))}
          </div>
          {vistaButtons.length > 0 ? (
            <>
              <h3 style={{ marginTop: "1.75rem" }}>{t("home.modules.mockTitle")}</h3>
              <p className="lead">{t("home.modules.mockLead")}</p>
              <div className="system-switcher">
                {vistaButtons.map(([systemKey, systemInfo]) => (
                  <button
                    key={`vista-${systemKey}`}
                    type="button"
                    className="system-btn"
                    onClick={() => navigate(`/vista/${encodeURIComponent(systemKey)}`)}
                  >
                    {t("home.modules.vistaPrefix")} {systemInfo.label}
                  </button>
                ))}
              </div>
            </>
          ) : null}
          {session?.token && session.business?.type && !dakinisIsPlatformAdminSession(session) ? (
            <p className="lead" style={{ marginTop: "0.75rem" }}>
              {t("home.modules.sessionNote")}
              <strong>
                {dakinisSystemRegistry[session.business.type]?.label ??
                  dakinisFormatBusinessTypeLabel(session.business.type)}
              </strong>
              {t("home.modules.sessionNoteEnd")}
            </p>
          ) : null}
        </div>
      </section>

      <PricingHybridSection variant="full" />

      <section id="demo" className="cta">
        <div className="container cta-card">
          <div>
            <h2>{t("home.demo.title")}</h2>
            <p>{t("home.demo.lead")}</p>
          </div>
          <button type="button" className="btn" onClick={() => navigate("/login")}>
            {t("home.demo.enterAdmin")}
          </button>
          <a href="#modulos" className="btn btn-outline">
            {t("home.demo.viewSystems")}
          </a>
        </div>
      </section>
    </>
  );
}
