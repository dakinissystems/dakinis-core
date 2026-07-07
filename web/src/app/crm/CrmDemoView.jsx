import BusinessNavHero from "../../components/business/BusinessNavHero.jsx";
import CrmPipelineBoard from "../../components/business/CrmPipelineBoard.jsx";

export default function CrmDemoView({ t, navigate, isBusinessFacing }) {
  return (
    <section className="modules business-app-page">
      <div className="container">
        {isBusinessFacing ? <BusinessNavHero navigate={navigate} compact /> : null}
        <p className="kicker">{t("businessDemo.clients.kicker")}</p>
        <h2>{t("businessDemo.clients.title")}</h2>
        <p className="lead">{t("businessDemo.clients.lead")}</p>
        <span className="mockup-badge">{t("commercial.executive.demoBadge")}</span>

        <div className="crm-demo-pipeline" style={{ marginTop: "1.25rem" }}>
          <h3 style={{ marginTop: 0 }}>{t("businessDemo.pipeline.sectionTitle")}</h3>
          <CrmPipelineBoard />
        </div>

        <p className="lead crm-demo-hint">{t("businessDemo.clients.demoHint")}</p>

        <div className="commercial-business-dashboard__actions">
          <button type="button" className="btn" onClick={() => navigate("/app/ventas")}>
            {t("businessDemo.dashboard.ctaPipeline")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/whatsapp")}>
            {t("businessDemo.dashboard.ctaWhatsapp")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/dashboard")}>
            {t("businessDemo.hub.ctaButton")}
          </button>
        </div>
      </div>
    </section>
  );
}
