import { dakinisContactWhatsappUrl } from "@dakinis/shared-brand/social-links";

export const DAKINIS_PLAN_SELECTED_EVENT = "dakinis-plan-selected";
const PLAN_STORAGE_KEY = "dakinis-whatsapp-plan";

export function dakinisPersistSelectedPlan(plan) {
  if (typeof sessionStorage === "undefined" || !plan?.key) return;
  try {
    sessionStorage.setItem(
      PLAN_STORAGE_KEY,
      JSON.stringify({ key: plan.key, priceEur: plan.priceEur })
    );
    window.dispatchEvent(new CustomEvent(DAKINIS_PLAN_SELECTED_EVENT));
  } catch {
    /* ignore */
  }
}

export function dakinisReadSelectedPlan() {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.key) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function dakinisPlanWhatsappMessage(t, { name, priceEur }) {
  return t("pricing.planWhatsappMessage", { plan: name, price: priceEur });
}

export function dakinisPlanWhatsappUrl({ locale, t, plan }) {
  const text = dakinisPlanWhatsappMessage(t, plan);
  return dakinisContactWhatsappUrl(locale, { text });
}

export function dakinisWhatsappUrlWithOptionalPlan({ locale, t }) {
  const selected = dakinisReadSelectedPlan();
  if (selected?.key) {
    const planName = t(`pricing.bos.plans.${selected.key}.name`);
    const text = dakinisPlanWhatsappMessage(t, { name: planName, priceEur: selected.priceEur });
    return dakinisContactWhatsappUrl(locale, { text });
  }
  return dakinisContactWhatsappUrl(locale);
}

export function dakinisPlanContactMessage(t, selected = dakinisReadSelectedPlan()) {
  if (!selected?.key) return null;
  const planName = t(`pricing.bos.plans.${selected.key}.name`);
  return dakinisPlanWhatsappMessage(t, { name: planName, priceEur: selected.priceEur });
}

export function dakinisPlanMailtoUrl(email, { t, selected = dakinisReadSelectedPlan() }) {
  const params = new URLSearchParams();
  if (selected?.key) {
    const planName = t(`pricing.bos.plans.${selected.key}.name`);
    params.set("subject", t("pricing.planMailtoSubject", { plan: planName }));
    params.set("body", dakinisPlanWhatsappMessage(t, { name: planName, priceEur: selected.priceEur }));
  }
  const q = params.toString();
  return `mailto:${email}${q ? `?${q}` : ""}`;
}
