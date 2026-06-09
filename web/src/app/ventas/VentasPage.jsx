import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import { dakinisIsBusinessDemoSession } from "../../utils/businessDemoMode.js";
import CrmPipelineBoard from "../../components/business/CrmPipelineBoard.jsx";
import BusinessNavHero from "../../components/business/BusinessNavHero.jsx";

export default function VentasPage({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const isDemo = dakinisIsBusinessDemoSession(session);

  if (!session?.token) {
    return (
      <section className="modules">
        <div className="container">
          <h2>{t("businessDemo.sales.title")}</h2>
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
        <p className="kicker">{t("businessDemo.sales.kicker")}</p>
        <h2>{t("businessDemo.sales.title")}</h2>
        <p className="lead">{t("businessDemo.sales.lead")}</p>
        {isDemo ? <span className="mockup-badge">{t("commercial.executive.demoBadge")}</span> : null}
        <CrmPipelineBoard draggable={isDemo} />
        {!isDemo ? (
          <p className="lead" style={{ marginTop: "1rem" }}>
            {t("businessDemo.sales.realHint")}
          </p>
        ) : null}
      </div>
    </section>
  );
}
