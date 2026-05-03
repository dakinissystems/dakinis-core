import { useMemo } from "react";
import { dakinisFormatBusinessTypeLabel } from "@dakinis/shared/catalog/business-type-display.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import {
  dakinisPackMvp,
  dakinisPackPro,
  dakinisPackAdvanced,
  dakinisMaintenanceTiers
} from "../data/pricingCatalog.js";

const logoGrande = "/Logo%20Grande.jpeg";

const DAKINIS_PACK_KEYS = ["mvp", "pro", "advanced"];
const DAKINIS_PACK_BASE = [dakinisPackMvp, dakinisPackPro, dakinisPackAdvanced];

/** Sustituye por tu email y número WhatsApp (formato internacional sin + en wa.me). */
const DAKINIS_CONTACT_EMAIL = "hola@tudominio.com";
const DAKINIS_CONTACT_WA = "https://wa.me/34600000000";

function dakinisIsPlatformAdminSession(session) {
  return session?.user?.role === "platform_admin" || session?.business?.type === "platform";
}

export default function HomePage({ navigate, dakinisSystemRegistry }) {
  const { session } = useDakinisSession();
  const { t } = useLocale();

  const sistemaButtons = useMemo(() => {
    const all = Object.entries(dakinisSystemRegistry);
    if (!session?.token) return all;
    if (dakinisIsPlatformAdminSession(session)) return [];
    const tenantType = session.business?.type;
    if (tenantType) return all.filter(([key]) => key === tenantType);
    return all;
  }, [session, dakinisSystemRegistry]);

  const vistaButtons = useMemo(() => {
    const all = Object.entries(dakinisSystemRegistry);
    if (!session?.token) return all;
    if (dakinisIsPlatformAdminSession(session)) return [];
    const tenantType = session.business?.type;
    if (tenantType) return all.filter(([key]) => key === tenantType);
    return all;
  }, [session, dakinisSystemRegistry]);

  const localizedPacks = useMemo(
    () =>
      DAKINIS_PACK_KEYS.map((key, i) => {
        const base = DAKINIS_PACK_BASE[i];
        const includes = t(`pricing.pack.${key}.includes`);
        return {
          ...base,
          badge: t(`pricing.pack.${key}.badge`),
          name: t(`pricing.pack.${key}.name`),
          audience: t(`pricing.pack.${key}.audience`),
          delivery: t(`pricing.pack.${key}.delivery`),
          pitch: t(`pricing.pack.${key}.pitch`),
          includes: Array.isArray(includes) ? includes : base.includes
        };
      }),
    [t]
  );

  const pricingIntro = useMemo(
    () => ({
      title: t("pricing.intro.title"),
      subtitle: t("pricing.intro.subtitle"),
      portfolioNote: t("pricing.intro.portfolioNote"),
      valuePoints: t("pricing.intro.valuePoints")
    }),
    [t]
  );

  const maintenanceTiers = useMemo(
    () =>
      dakinisMaintenanceTiers.map((tier) => ({
        ...tier,
        name: t(`pricing.maintenance.${tier.key}.name`),
        description: t(`pricing.maintenance.${tier.key}.description`)
      })),
    [t]
  );

  const valuePoints = Array.isArray(pricingIntro.valuePoints)
    ? pricingIntro.valuePoints
    : [];

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
            <img src={logoGrande} alt="Dakinis Scheduler + CRM + WhatsApp" className="hero-logo" />
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
          {dakinisIsPlatformAdminSession(session) ? (
            <div className="system-switcher">
              <button type="button" className="system-btn active" onClick={() => navigate("/admin")}>
                {t("home.modules.adminCta")}
              </button>
            </div>
          ) : (
            <div className="system-switcher">
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
          )}
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

      <section id="precios" className="modules pricing-section pricing-contact-unified">
        <div className="container">
          <p className="kicker">{t("home.pricing.kicker")}</p>
          <h2>{pricingIntro.title}</h2>
          <p className="lead">{pricingIntro.subtitle}</p>
          <p className="lead portfolio-lead">{pricingIntro.portfolioNote}</p>
          <ul className="pricing-value-points">
            {valuePoints.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <div className="pack-grid">
            {localizedPacks.map((pack) => (
              <article
                key={pack.key}
                className={`card pack-card${pack.featured ? " featured" : ""}`}
              >
                <p className="pack-badge">
                  {pack.badge} — {pack.name}
                </p>
                <p className="pack-audience">{pack.audience}</p>
                <p className="price pack-price">{pack.priceRange}</p>
                <p className="pack-delivery">
                  <strong>{t("pricing.deliveryLabel")}</strong> {pack.delivery}
                </p>
                <p className="pack-pitch">&ldquo;{pack.pitch}&rdquo;</p>
                <ul className="pack-includes">
                  {pack.includes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <h3 className="maint-heading" id="mantenimiento">
            {t("home.pricing.maintenanceHeading")}
          </h3>
          <p className="lead maint-sub">{t("pricing.maintenancePitch")}</p>
          <div className="maint-grid">
            {maintenanceTiers.map((tier) => (
              <div key={tier.key} className="card price-card">
                <h3>{tier.name}</h3>
                <p className="price">{tier.price}</p>
                <p className="setup">{tier.description}</p>
              </div>
            ))}
          </div>

          <div id="contact" className="contact-unified">
            <h2>{t("home.pricing.contactTitle")}</h2>
            <p className="lead contact-lead">{t("home.pricing.contactLead")}</p>
            <div className="contact-actions">
              <a href={`mailto:${DAKINIS_CONTACT_EMAIL}`} className="btn">
                {t("home.pricing.emailCta")}
              </a>
              <a href={DAKINIS_CONTACT_WA} className="btn btn-outline" target="_blank" rel="noreferrer">
                {t("home.pricing.whatsappCta")}
              </a>
            </div>
          </div>
        </div>
      </section>

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
