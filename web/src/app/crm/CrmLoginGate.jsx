export default function CrmLoginGate({ t, navigate }) {
  return (
    <section className="modules">
      <div className="container">
        <h2>{t("app.crm.title")}</h2>
        <p className="lead">{t("app.crm.loginLead")}</p>
        <button className="btn" type="button" onClick={() => navigate("/login")}>
          {t("app.goLogin")}
        </button>
      </div>
    </section>
  );
}
