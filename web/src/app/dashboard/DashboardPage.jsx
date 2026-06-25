import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import CommercialBusinessDashboard from "../../components/business/CommercialBusinessDashboard.jsx";
import { dakinisIsBusinessDemoSession } from "../../utils/businessDemoMode.js";
import LiveTenantDashboard from "./LiveTenantDashboard.jsx";

export default function DashboardPage({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();

  if (!session?.token) {
    return (
      <section className="modules">
        <div className="container">
          <h2>{t("app.dashboard.title")}</h2>
          <p className="lead">{t("app.loginRequired")}</p>
          <button className="btn" type="button" onClick={() => navigate("/login")}>
            {t("app.goLogin")}
          </button>
        </div>
      </section>
    );
  }

  if (dakinisIsBusinessDemoSession(session)) {
    return (
      <section className="modules business-app-page">
        <div className="container">
          <CommercialBusinessDashboard navigate={navigate} />
        </div>
      </section>
    );
  }

  return <LiveTenantDashboard session={session} navigate={navigate} />;
}
