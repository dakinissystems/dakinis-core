import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisFetchStripeCheckoutSession } from "../services/stripe-checkout.js";

export default function CheckoutSuccessPage() {
  const { t } = useLocale();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id") || "";
  const [state, setState] = useState({ loading: Boolean(sessionId), error: "", plan: null });

  useEffect(() => {
    if (!sessionId) {
      setState({ loading: false, error: "", plan: null });
      return undefined;
    }
    let cancelled = false;
    dakinisFetchStripeCheckoutSession(sessionId)
      .then((data) => {
        if (cancelled) return;
        setState({
          loading: false,
          error: "",
          plan: data?.plan || null,
          paymentStatus: data?.paymentStatus
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ loading: false, error: err.message || t("checkout.success.error"), plan: null });
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, t]);

  const planName = state.plan ? t(`pricing.bos.plans.${state.plan}.name`) : null;

  return (
    <section className="modules auth-page checkout-result-page">
      <div className="container checkout-result-page__inner">
        {state.loading ? (
          <>
            <p className="kicker">{t("checkout.success.kicker")}</p>
            <h1>{t("checkout.success.verifying")}</h1>
          </>
        ) : state.error ? (
          <>
            <p className="kicker">{t("checkout.success.kicker")}</p>
            <h1>{t("checkout.success.errorTitle")}</h1>
            <p className="lead">{state.error}</p>
            <div className="checkout-result-page__actions">
              <Link className="btn btn-primary" to="/precios">
                {t("checkout.success.backToPricing")}
              </Link>
            </div>
          </>
        ) : sessionId && planName ? (
          <>
            <p className="kicker">{t("checkout.success.kicker")}</p>
            <h1>{t("checkout.success.title")}</h1>
            <p className="lead">
              {t("checkout.success.planActivated", { plan: planName })}
            </p>
            <p className="checkout-result-page__note">{t("checkout.success.nextSteps")}</p>
            <div className="checkout-result-page__actions">
              <Link className="btn btn-primary" to="/login">
                {t("checkout.success.goLogin")}
              </Link>
              <Link className="btn btn-outline" to="/precios">
                {t("checkout.success.viewPlans")}
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="kicker">{t("checkout.success.kicker")}</p>
            <h1>{t("checkout.success.genericTitle")}</h1>
            <p className="lead">{t("checkout.success.genericLead")}</p>
            <div className="checkout-result-page__actions">
              <Link className="btn btn-primary" to="/login">
                {t("checkout.success.goLogin")}
              </Link>
              <Link className="btn btn-outline" to="/precios">
                {t("checkout.success.backToPricing")}
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
