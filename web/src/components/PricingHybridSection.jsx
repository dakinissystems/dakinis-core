import { useMemo } from "react";
import { useLocale } from "../context/LocaleContext.jsx";
import { DAKINIS_CONTACT_EMAIL } from "../config/contact-urls.js";
import {
  dakinisBuildBosPlanCards,
  dakinisBosOverage,
  dakinisImplementationTiers,
  dakinisProfessionalServices,
  dakinisPackMvp,
  dakinisPackPro,
  dakinisPackAdvanced
} from "../data/pricingCatalog.js";

const DAKINIS_PACK_KEYS = ["mvp", "pro", "advanced"];
const DAKINIS_PACK_BASE = [dakinisPackMvp, dakinisPackPro, dakinisPackAdvanced];

function PricingPlanQuotas({ plan, t }) {
  const chips = [];
  if (plan.includedWa > 0) {
    chips.push(t("pricing.quotaWa", { count: plan.includedWa.toLocaleString() }));
  }
  if (plan.includedAi > 0) {
    chips.push(t("pricing.quotaAi", { count: plan.includedAi.toLocaleString() }));
  }
  if (!chips.length) return null;
  return (
    <div className="pricing-plan-quotas">
      {chips.map((label) => (
        <span key={label} className="pricing-quota-chip">
          {label}
        </span>
      ))}
    </div>
  );
}

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
          tagline: t(`pricing.bos.plans.${plan.key}.tagline`),
          audience: t(`pricing.bos.plans.${plan.key}.audience`),
          outcome: t(`pricing.bos.plans.${plan.key}.outcome`),
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
      dakinisProfessionalServices.maintenance.map((tier) => ({
        key: tier.key,
        name: t(`pricing.maintenance.${tier.key}.name`),
        price: t("pricing.maintenance.priceFormat", { amount: tier.priceEur }),
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
        <div className="pricing-hero">
          <p className="kicker">{t("pricing.bos.kicker")}</p>
          <h2>{t("pricing.bos.title")}</h2>
          <p className="lead pricing-hero__lead">{t("pricing.bos.subtitle")}</p>
          <p className="pricing-hero__intro">{t("pricing.clientIntro")}</p>
        </div>

        <div className="pack-grid bos-plan-grid pricing-plan-grid">
          {bosPlans.map((plan) => (
            <article
              key={plan.key}
              className={`card pack-card bos-plan-card pricing-plan-card${plan.featured ? " featured" : ""}`}
            >
              {plan.featured ? (
                <span className="pricing-plan-card__ribbon">{t("pricing.recommendedBadge")}</span>
              ) : null}
              <header className="pricing-plan-card__head">
                <h3 className="pricing-plan-card__name">{plan.name}</h3>
                <p className="pricing-plan-card__tagline">{plan.tagline}</p>
              </header>
              <div className="pricing-plan-card__price-row">
                <span className="pricing-plan-card__amount">{plan.priceEur}</span>
                <span className="pricing-plan-card__currency">
                  €<span className="pricing-plan-card__period">{t("pricing.bos.perMonth")}</span>
                </span>
              </div>
              <p className="pack-audience">{plan.audience}</p>
              <p className="pricing-plan-card__outcome">{plan.outcome}</p>
              <PricingPlanQuotas plan={plan} t={t} />
              <p className="pricing-includes-title">{t("pricing.includesTitle")}</p>
              <ul className="pack-includes pricing-includes-list">
                {plan.includes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <a href="#contact" className="btn btn-outline pricing-plan-card__cta">
                {t("pricing.planCta")}
              </a>
            </article>
          ))}
        </div>

        <aside className="pricing-callout bos-overage-note">
          <strong>{t("pricing.overageTitle")}</strong>
          <p>
            {t("pricing.bos.overageLead", {
              aiRate: dakinisBosOverage.aiEurPer1k,
              waRate: dakinisBosOverage.whatsappEurPer500
            })}
          </p>
        </aside>

        <div className="pricing-section-block">
          <h3 className="maint-heading">{t("pricing.bos.implementationTitle")}</h3>
          <p className="lead maint-sub">{t("pricing.bos.implementationLead")}</p>
          <div className="maint-grid implementation-grid pricing-impl-grid">
            {dakinisImplementationTiers.map((tier) => (
              <article key={tier.key} className="card price-card pricing-impl-card">
                <h4>{t(`pricing.implementation.${tier.key}.label`)}</h4>
                <p className="price pricing-impl-card__price">{tier.range}</p>
                <p className="setup pricing-impl-card__desc">
                  {t(`pricing.implementation.${tier.key}.description`)}
                </p>
              </article>
            ))}
          </div>
        </div>

        {showProjects ? (
          <div className="pricing-section-block">
            <p className="kicker">{t("home.pricing.kicker")}</p>
            <h2>{pricingIntro.title}</h2>
            <p className="lead">{pricingIntro.subtitle}</p>
            <p className="lead portfolio-lead">{pricingIntro.portfolioNote}</p>
            <ul className="pricing-value-points pricing-value-cards">
              {valuePoints.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>

            <div className="pack-grid pricing-pack-grid">
              {localizedPacks.map((pack) => (
                <article
                  key={pack.key}
                  className={`card pack-card pricing-pack-card${pack.featured ? " featured" : ""}`}
                >
                  <p className="pack-badge">
                    {pack.badge} — {pack.name}
                  </p>
                  <p className="pack-audience">{pack.audience}</p>
                  <p className="price pack-price pricing-pack-card__price">{pack.priceRange}</p>
                  <p className="pack-delivery">
                    <strong>{t("pricing.deliveryLabel")}</strong> {pack.delivery}
                  </p>
                  <p className="pack-pitch">&ldquo;{pack.pitch}&rdquo;</p>
                  <ul className="pack-includes pricing-includes-list">
                    {pack.includes.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <p className="lead pricing-projects-hint">{t("pricing.bos.projectsHint")}</p>
        )}

        <div className="pricing-section-block">
          <h3 className="maint-heading" id="mantenimiento">
            {t("pricing.bos.servicesTitle")}
          </h3>
          <p className="lead maint-sub">
            {t("pricing.bos.servicesLead", { hourly: dakinisProfessionalServices.hourlyRateEur })}
          </p>
          {Array.isArray(serviceExamples) && serviceExamples.length > 0 ? (
            <ul className="pricing-value-points pricing-service-tags">
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
          <div className="maint-grid pricing-maint-grid">
            {maintenanceTiers.map((tier) => (
              <article key={tier.key} className="card price-card pricing-maint-card">
                <h4>{tier.name}</h4>
                <p className="price">{tier.price}</p>
                <p className="setup">{tier.description}</p>
              </article>
            ))}
          </div>
        </div>

        {showContact ? (
          <div id="contact" className="contact-unified pricing-contact-card">
            <h2>{t("home.pricing.contactTitle")}</h2>
            <p className="lead contact-lead">{t("home.pricing.contactLead")}</p>
            <p className="pricing-contact-card__hint">{t("pricing.contactHint")}</p>
            <div className="contact-actions">
              <a href={`mailto:${DAKINIS_CONTACT_EMAIL}`} className="btn">
                {t("home.pricing.emailCta")}
              </a>
              <p className="pricing-contact-card__whatsapp-hint">{t("pricing.whatsappFabHint")}</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
