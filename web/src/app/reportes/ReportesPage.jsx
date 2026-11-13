import { useEffect, useState } from "react";
import { dakinisIsHospitalityBusiness } from "@dakinis/shared/catalog/hospitality.js";
import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import { dakinisIsBusinessDemoSession } from "../../utils/businessDemoMode.js";
import AnalyticsBusinessDemo from "../../components/business/AnalyticsBusinessDemo.jsx";
import { dakinisTenantBenchmark } from "../../services/tenant-intelligence.js";
import { dakinisRestaurantTaskPath } from "../../utils/restaurantTaskStorage.js";

export default function ReportesPage({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const isDemo = dakinisIsBusinessDemoSession(session);
  const [benchmark, setBenchmark] = useState(null);
  const [benchmarkError, setBenchmarkError] = useState(false);

  const sessionToken = session?.token;

  useEffect(() => {
    if (!sessionToken || isDemo) return undefined;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- token identity only
  }, [sessionToken, isDemo]);

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
        <p className="kicker">{t("businessDemo.analytics.kicker")}</p>
        <h2>{t("businessDemo.analytics.title")}</h2>
        {isDemo ? <span className="mockup-badge">{t("commercial.executive.demoBadge")}</span> : null}
        <p className="lead">{t("businessDemo.analytics.lead")}</p>
        {isDemo ? <AnalyticsBusinessDemo /> : null}
        {!isDemo && benchmark?.comparisons?.length ? (
          <article className="card" style={{ marginTop: "1rem" }}>
            <h3 style={{ marginTop: 0 }}>{t("businessDemo.analytics.benchmarkTitle")}</h3>
            <ul>
              {benchmark.comparisons.slice(0, 5).map((row) => (
                <li key={row.key}>
                  {row.label}: {row.tenantValue}{row.unit || ""} ({row.narrative})
                </li>
              ))}
            </ul>
          </article>
        ) : null}
        {!isDemo && !benchmark?.comparisons?.length ? (
          <article className="card" style={{ marginTop: "1rem" }}>
            <p className="lead" style={{ marginTop: 0 }}>
              {benchmarkError ? t("businessDemo.analytics.planHint") : t("businessDemo.analytics.realEmpty")}
            </p>
            {dakinisIsHospitalityBusiness(session.business?.type) ? (
              <button
                type="button"
                className="btn"
                onClick={() => navigate(dakinisRestaurantTaskPath(session.business.type, "caja"))}
              >
                {t("businessDemo.sales.openCaja")}
              </button>
            ) : null}
          </article>
        ) : null}
      </div>
    </section>
  );
}
