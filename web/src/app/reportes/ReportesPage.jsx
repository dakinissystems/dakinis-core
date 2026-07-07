import { useEffect, useState } from "react";
import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import { dakinisIsBusinessDemoSession } from "../../utils/businessDemoMode.js";
import BusinessNavHero from "../../components/business/BusinessNavHero.jsx";
import AnalyticsBusinessDemo from "../../components/business/AnalyticsBusinessDemo.jsx";
import { dakinisTenantBenchmark } from "../../services/tenant-intelligence.js";

export default function ReportesPage({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const isDemo = dakinisIsBusinessDemoSession(session);
  const [benchmark, setBenchmark] = useState(null);
  const [benchmarkError, setBenchmarkError] = useState(false);

  useEffect(() => {
    if (!session?.token || isDemo) return;
    let cancelled = false;
    dakinisTenantBenchmark(session)
      .then((json) => {
        if (!cancelled) setBenchmark(json?.data?.benchmark || json?.benchmark || null);
      })
      .catch(() => {
        if (!cancelled) setBenchmarkError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [session, isDemo]);

  if (!session?.token) {
    return (
      <section className="modules">
        <div className="container">
          <h2>{t("businessDemo.analytics.title")}</h2>
          <p className="lead">{t("app.loginRequired")}</p>
          <button className="btn" type="button" onClick={() => navigate("/login")}>
            {t("app.goLogin")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="modules business-app-page">
      <div className="container">
        {isDemo ? <BusinessNavHero navigate={navigate} compact /> : null}
        <p className="kicker">{t("businessDemo.analytics.kicker")}</p>
        <h2>{t("businessDemo.analytics.title")}</h2>
        <p className="lead">{t("businessDemo.analytics.lead")}</p>
        {!isDemo && benchmark?.comparisons?.length ? (
          <p className="kpi-label" style={{ marginBottom: "0.75rem" }}>
            {t("businessDemo.analytics.liveBadge")}
          </p>
        ) : null}
        <AnalyticsBusinessDemo benchmark={benchmark} />
        {!isDemo && benchmarkError ? (
          <p className="lead" style={{ marginTop: "1rem" }}>
            {t("businessDemo.analytics.planHint")}
          </p>
        ) : null}
      </div>
    </section>
  );
}
