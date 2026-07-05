import { useState } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "../context/LocaleContext.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisOpenBillingPortal } from "../services/billing.js";

function dakinisPlanLabel(t, planKey) {
  if (!planKey) return "";
  const key = `pricing.bos.plans.${planKey}.name`;
  const label = t(key);
  return label === key ? planKey : label;
}

export default function BillingAccessBanner() {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const accessState = String(session?.business?.accessState || session?.business?.access_state || "active").toLowerCase();
  if (!session?.token || accessState !== "degraded") {
    return null;
  }

  const entitledPlan = session.business?.entitledPlan || session.business?.entitled_plan || session.business?.plan;

  async function handlePortal() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await dakinisOpenBillingPortal(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("app.billing.portalError"));
      setLoading(false);
    }
  }

  return (
    <div className="billing-access-banner" role="status">
      <div className="billing-access-banner__inner container">
        <div className="billing-access-banner__copy">
          <strong>{t("app.billing.degradedTitle")}</strong>
          <p>{t("app.billing.degradedLead")}</p>
          {entitledPlan ? (
            <p className="billing-access-banner__plan">
              {t("app.billing.entitledPlan", { plan: dakinisPlanLabel(t, entitledPlan) })}
            </p>
          ) : null}
          {error ? <p className="billing-access-banner__error">{error}</p> : null}
        </div>
        <div className="billing-access-banner__actions">
          <button type="button" className="btn btn-primary" onClick={handlePortal} disabled={loading}>
            {loading ? t("app.billing.portalLoading") : t("app.billing.openPortal")}
          </button>
          <Link className="btn btn-outline" to="/precios">
            {t("app.billing.viewPlans")}
          </Link>
        </div>
      </div>
    </div>
  );
}
