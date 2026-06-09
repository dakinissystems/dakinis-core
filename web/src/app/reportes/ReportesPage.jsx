import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import { dakinisIsBusinessDemoSession } from "../../utils/businessDemoMode.js";
import BusinessNavHero from "../../components/business/BusinessNavHero.jsx";
import ReportsBusinessDemo from "../../components/business/ReportsBusinessDemo.jsx";

export default function ReportesPage({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const isDemo = dakinisIsBusinessDemoSession(session);

  if (!session?.token) {
    return (
      <section className="modules">
        <div className="container">
          <h2>{t("businessDemo.reports.title")}</h2>
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
        <p className="kicker">{t("businessDemo.reports.kicker")}</p>
        <h2>{t("businessDemo.reports.title")}</h2>
        <p className="lead">{t("businessDemo.reports.lead")}</p>
        {isDemo ? (
          <ReportsBusinessDemo />
        ) : (
          <p className="lead">{t("businessDemo.reports.realHint")}</p>
        )}
      </div>
    </section>
  );
}
