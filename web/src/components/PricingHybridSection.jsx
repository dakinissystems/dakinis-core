import { useMemo } from "react";
import { useLocale } from "../context/LocaleContext.jsx";
import { DAKINIS_CONTACT_EMAIL, DAKINIS_CONTACT_WHATSAPP_URL } from "../config/contact-urls.js";
import {
  dakinisBuildBosPlanCards,
  dakinisBosOverage,
  dakinisImplementationTiers,
  dakinisProfessionalServices,
  dakinisPackMvp,
  dakinisPackPro,
  dakinisPackAdvanced,
  dakinisMaintenanceTiers
} from "../data/pricingCatalog.js";

const DAKINIS_PACK_KEYS = ["mvp", "pro", "advanced"];
const DAKINIS_PACK_BASE = [dakinisPackMvp, dakinisPackPro, dakinisPackAdvanced];

/**
 * Sección precios modelo híbrido: planes BOS SaaS + implantación + paquetes proyecto + servicios.
 * @param {{ variant?: "full" | "saas", showContact?: boolean, sectionId?: string }} props
 */
export default function PricingHybridSection({
  variant = "full",
  showContact = true,
  sectionId = "precios"
}) {
  const { t } = useLocale();
  const showProjects = variant === "full";

  const bosPlans = useMemo(
    () =>
      dakinisBuildBosPlanCards().map((plan) => {
        const includes = t(`pricing.bos.plans.${plan.key}.includes`);
        return {
          ...plan,
          name: t(`pricing.bos.plans.${plan.key}.name`),
          audience: t(`pricing.bos.plans.${plan.key}.audience`),
          includes: Array.isArray(includes) ? includes : []
        };
      }),
    [t]
  );

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

  const valuePoints = Array.isArray(pricingIntro.valuePoints) ? pricingIntro.valuePoints : [];
  const serviceExamples = t("pricing.bos.examples");
  const serviceBundles = dakinisProfessionalServices.projectBundlesEur;

  return (
    <section id={sectionId} className="modules pricing-section pricing-contact-unified">
      <div className="container">
        <p className="kicker">{t("pricing.bos.kicker")}</p>
        <h2>{t("pricing.bos.title")}</h2>
        <p className="lead">{t("pricing.bos.subtitle")}</p>

        <div className="pack-grid bos-plan-grid">
          {bosPlans.map((plan) => (
            <article
              key={plan.key}
              className={`card pack-card bos-plan-card${plan.featured ? " featured" : ""}`}
            >
              <p className="pack-badge">
                {plan.name}
                {plan.featured ? ` · ${t("pricing.bos.recommended")}` : ""}
              </p>
              <p className="pack-audience">{plan.audience}</p>
              <p className="price pack-price">
                {plan.priceEur} €{t("pricing.bos.perMonth")}
              </p>
              <ul className="pack-includes">
                {plan.includes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="lead bos-overage-note">
          {t("pricing.bos.overageLead", {
            aiRate: dakinisBosOverage.aiEurPer1k,
            waRate: dakinisBosOverage.whatsappEurPer500
          })}
        </p>

        <h3 className="maint-heading">{t("pricing.bos.implementationTitle")}</h3>
        <p className="lead maint-sub">{t("pricing.bos.implementationLead")}</p>
        <div className="maint-grid implementation-grid">
          {dakinisImplementationTiers.map((tier) => (
            <div key={tier.key} className="card price-card">
              <h3>{tier.label}</h3>
              <p className="price">{tier.range}</p>
            </div>
          ))}
        </div>

        {showProjects ? (
          <>
            <p className="kicker" style={{ marginTop: "2.5rem" }}>
              {t("home.pricing.kicker")}
            </p>
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
          </>
        ) : (
          <p className="lead" style={{ marginTop: "2rem" }}>
            {t("pricing.bos.projectsHint")}
          </p>
        )}

        <h3 className="maint-heading" id="mantenimiento">
          {t("pricing.bos.servicesTitle")}
        </h3>
        <p className="lead maint-sub">
          {t("pricing.bos.servicesLead", { hourly: dakinisProfessionalServices.hourlyRateEur })}
        </p>
        {Array.isArray(serviceExamples) && serviceExamples.length > 0 ? (
          <ul className="pricing-value-points">
            {serviceExamples.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
        <p className="lead maint-sub">
          {t("pricing.bos.bundlesLead", { bundles: serviceBundles.join(" / ") })}
        </p>

        <h3 className="maint-heading">{t("home.pricing.maintenanceHeading")}</h3>
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

        {showContact ? (
          <div id="contact" className="contact-unified">
            <h2>{t("home.pricing.contactTitle")}</h2>
            <p className="lead contact-lead">{t("home.pricing.contactLead")}</p>
            <div className="contact-actions">
              <a href={`mailto:${DAKINIS_CONTACT_EMAIL}`} className="btn">
                {t("home.pricing.emailCta")}
              </a>
              <a
                href={DAKINIS_CONTACT_WHATSAPP_URL}
                className="btn btn-outline"
                target="_blank"
                rel="noreferrer"
              >
                {t("home.pricing.whatsappCta")}
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
