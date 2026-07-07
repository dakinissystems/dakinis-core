export default function SettingsDemoView({ t, session, navigate, onSignOut }) {
  return (
    <section className="modules business-app-page">
      <div className="container">
        <h2>{t("app.settings.title")}</h2>
        <p className="lead">{t("app.settings.demoLead")}</p>
        <div className="card">
          <p>
            <strong>{t("app.settings.businessName")}</strong> {session?.business?.name || "—"}
          </p>
          <p className="kpi-label">{t("app.settings.demoHint")}</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
          <button type="button" className="btn" onClick={() => navigate("/app/dashboard")}>
            {t("businessDemo.hub.ctaButton")}
          </button>
          <button type="button" className="btn btn-outline" onClick={onSignOut}>
            {t("app.settings.logout")}
          </button>
        </div>
      </div>
    </section>
  );
}
