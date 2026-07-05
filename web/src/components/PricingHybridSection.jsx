import { useEffect, useMemo, useState } from "react";
import { useLocale } from "../context/LocaleContext.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { DAKINIS_CONTACT_EMAIL } from "../config/contact-urls.js";
import {
  DAKINIS_PLAN_SELECTED_EVENT,
  dakinisPersistSelectedPlan,
  dakinisPlanContactMessage,
  dakinisPlanMailtoUrl,
  dakinisPlanWhatsappUrl,
  dakinisReadSelectedPlan,
  dakinisWhatsappUrlWithOptionalPlan
} from "../utils/planWhatsapp.js";
import {
  dakinisBuildBosPlanCards,
  dakinisBosOverage,
  DAKINIS_PLAN_IMPLEMENTATION_KEYS,
  dakinisProfessionalServices,
  dakinisPackMvp,
  dakinisPackPro,
  dakinisPackAdvanced
} from "../data/pricingCatalog.js";
import PricingComparisonTable from "./PricingComparisonTable.jsx";
import {
  dakinisFetchStripePlans,
  dakinisStartStripeCheckout,
  dakinisStripePaymentLinkUrl
} from "../services/stripe-checkout.js";
import { dakinisTrackEvent, DAKINIS_ANALYTICS_EVENTS } from "../utils/analytics.js";

function PlanStripeSubscribeButton({ plan, t, locale, stripePlans, session }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const planConfig = stripePlans?.plans?.[plan.key];
  const canStripe = Boolean(stripePlans?.configured && planConfig?.checkoutAvailable);

  async function handleSubscribe() {
    if (!canStripe || loading) return;
    setLoading(true);
    setError("");
    dakinisPersistSelectedPlan({ key: plan.key, priceEur: plan.priceEur });
    dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.SIGNUP_STARTED, {
      plan: plan.key,
      priceEur: plan.priceEur,
      via: "stripe",
      hasSession: Boolean(session?.token),
    });
    try {
      if (planConfig.paymentLink) {
        window.location.href = dakinisStripePaymentLinkUrl(planConfig.paymentLink, {
          email: session?.user?.email,
        });
        return;
      }
      await dakinisStartStripeCheckout({
        plan: plan.key,
        email: session?.user?.email,
        businessId: session?.business?.id,
        userId: session?.user?.id,
        token: session?.token,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("pricing.stripeError"));
      setLoading(false);
    }
  }

  if (!canStripe) {
    return (
      <a
        href={dakinisPlanWhatsappUrl({
          locale,
          t,
          plan: { name: plan.name, priceEur: plan.priceEur }
        })}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-outline pricing-plan-card__cta"
        onClick={() => dakinisPersistSelectedPlan({ key: plan.key, priceEur: plan.priceEur })}
      >
        {t("pricing.planCta")}
      </a>
    );
  }

  return (
    <div className="pricing-plan-card__checkout">
      <button
        type="button"
        className="btn btn-primary pricing-plan-card__cta"
        onClick={handleSubscribe}
        disabled={loading}
      >
        {loading ? t("pricing.stripeLoading") : t("pricing.stripeCta")}
      </button>
      {error ? <p className="pricing-plan-card__checkout-error">{error}</p> : null}
      <a
        href={dakinisPlanWhatsappUrl({
          locale,
          t,
          plan: { name: plan.name, priceEur: plan.priceEur }
        })}
        target="_blank"
        rel="noopener noreferrer"
        className="pricing-plan-card__whatsapp-alt"
        onClick={() => dakinisPersistSelectedPlan({ key: plan.key, priceEur: plan.priceEur })}
      >
        {t("pricing.planCtaWhatsapp")}
      </a>
    </div>
  );
}

const DAKINIS_PACK_KEYS = ["mvp", "pro", "advanced"];
const DAKINIS_PACK_BASE = [dakinisPackMvp, dakinisPackPro, dakinisPackAdvanced];

function PricingPlanQuotas({ plan, t }) {
  if (!plan.includedWa && !plan.includedAi) return null;
  return (
    <div className="pricing-plan-quotas">
      {plan.includedWa > 0 ? (
        <div className="pricing-quota-block">
          <p className="pricing-quota-block__lead">{t("pricing.quotaWaLead")}</p>
          <span className="pricing-quota-chip">
            {t("pricing.quotaWaFootnote", { count: plan.includedWa.toLocaleString() })}
          </span>
        </div>
      ) : null}
      {plan.includedAi > 0 ? (
        <div className="pricing-quota-block">
          <p className="pricing-quota-block__lead">{t("pricing.quotaAiLead")}</p>
          <span className="pricing-quota-chip pricing-quota-chip--ai">
            {t("pricing.quotaAiFootnote", { count: plan.includedAi.toLocaleString() })}
          </span>
        </div>
      ) : null}
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
  const { locale, t } = useLocale();
  const { session } = useDakinisSession();
  const showProjects = variant === "full";
  const [planRevision, setPlanRevision] = useState(0);
  const [stripePlans, setStripePlans] = useState(null);

  useEffect(() => {
    dakinisFetchStripePlans()
      .then((data) => setStripePlans(data))
      .catch(() => setStripePlans(null));
  }, []);

  useEffect(() => {
    const onPlanSelected = () => setPlanRevision((n) => n + 1);
    window.addEventListener(DAKINIS_PLAN_SELECTED_EVENT, onPlanSelected);
    return () => window.removeEventListener(DAKINIS_PLAN_SELECTED_EVENT, onPlanSelected);
  }, []);

  const selectedPlan = useMemo(() => dakinisReadSelectedPlan(), [planRevision]);
  const contactWhatsappHref = useMemo(
    () => dakinisWhatsappUrlWithOptionalPlan({ locale, t }),
    [locale, t, planRevision]
  );
  const contactMessage = useMemo(() => dakinisPlanContactMessage(t, selectedPlan), [t, selectedPlan]);
  const contactMailtoHref = useMemo(
    () => dakinisPlanMailtoUrl(DAKINIS_CONTACT_EMAIL, { t, selected: selectedPlan }),
    [t, selectedPlan]
  );

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

        <article className="card pricing-problems-solved">
          <h3>{t("pricing.problemsSolved.title")}</h3>
          <ul className="pricing-problems-solved__list">
            {(t("pricing.problemsSolved.items") || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <div className="pack-grid bos-plan-grid pricing-plan-grid">
          {bosPlans.map((plan) => (
            <article
              key={plan.key}
              className={`card pack-card bos-plan-card pricing-plan-card${
                plan.featured ? " featured" : ""
              }${selectedPlan?.key === plan.key ? " is-selected" : ""}`}
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
              {plan.key === "pro" ? (
                <p className="pricing-plan-card__value-anchor">{t("pricing.bos.plans.pro.valueAnchor")}</p>
              ) : null}
              <PricingPlanQuotas plan={plan} t={t} />
              <p className="pricing-includes-title">{t("pricing.includesTitle")}</p>
              <ul className="pack-includes pricing-includes-list">
                {plan.includes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <PlanStripeSubscribeButton
                plan={plan}
                t={t}
                locale={locale}
                stripePlans={stripePlans}
                session={session}
              />
            </article>
          ))}
        </div>

        <p className="pricing-impl-bridge lead">{t("pricing.implBridge")}</p>

        <PricingComparisonTable />

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
          <div className="maint-grid implementation-grid pricing-impl-grid pricing-impl-grid--plans">
            {DAKINIS_PLAN_IMPLEMENTATION_KEYS.map((planKey) => (
              <article key={planKey} className="card price-card pricing-impl-card">
                <h4>{t(`pricing.implementationByPlan.${planKey}.label`)}</h4>
                <p className="price pricing-impl-card__price">
                  {t(`pricing.implementationByPlan.${planKey}.range`)}
                </p>
                <p className="setup pricing-impl-card__desc">
                  {t(`pricing.implementationByPlan.${planKey}.description`)}
                </p>
              </article>
            ))}
          </div>
        </div>

        {showProjects ? (
          <div className="pricing-section-block pricing-custom-dev-zone">
            <p className="kicker">{t("pricing.customDev.kicker")}</p>
            <h2>{t("pricing.customDev.title")}</h2>
            <p className="lead">{t("pricing.customDev.lead")}</p>
            <p className="lead pricing-custom-dev-zone__note">{t("pricing.customDev.note")}</p>
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
            {selectedPlan?.key ? (
              <div className="pricing-contact-card__plan-message">
                <p className="pricing-contact-card__plan-label">
                  {t("pricing.selectedPlanLabel", {
                    plan: t(`pricing.bos.plans.${selectedPlan.key}.name`),
                    price: selectedPlan.priceEur
                  })}
                </p>
                <p className="pricing-contact-card__message-label">{t("pricing.contactMessageLabel")}</p>
                <blockquote className="pricing-contact-card__message-preview">{contactMessage}</blockquote>
              </div>
            ) : (
              <p className="pricing-contact-card__select-hint">{t("pricing.selectPlanHint")}</p>
            )}
            <div className="contact-actions">
              <a href={contactMailtoHref} className="btn">
                {t("home.pricing.emailCta")}
              </a>
              <a
                href={contactWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                {t("pricing.contactWhatsappCta")}
              </a>
            </div>
            <p className="pricing-contact-card__whatsapp-hint">{t("pricing.whatsappFabHint")}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
