import { dakinisIsHospitalityBusiness } from "@dakinis/shared/catalog/hospitality.js";
import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import { dakinisIsBusinessDemoSession } from "../../utils/businessDemoMode.js";
import { dakinisRestaurantTaskPath } from "../../utils/restaurantTaskStorage.js";
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
        {isDemo ? (
          <CrmPipelineBoard draggable />
        ) : (
          <article className="card" style={{ marginTop: "1rem" }}>
            <p className="lead" style={{ marginTop: 0 }}>{t("businessDemo.sales.realEmpty")}</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button type="button" className="btn" onClick={() => navigate("/app/crm")}>
                {t("businessDemo.sales.openClients")}
              </button>
              {dakinisIsHospitalityBusiness(session.business?.type) ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate(dakinisRestaurantTaskPath(session.business.type, "caja"))}
                >
                  {t("businessDemo.sales.openCaja")}
                </button>
              ) : null}
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
