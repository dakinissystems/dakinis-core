import { useState } from "react";
import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import { dakinisCrmSegment, dakinisCrmTimeline } from "../../services/crm.js";

const DAKINIS_CRM_JOURNEY_KEYS = ["client", "booking", "order", "invoice", "whatsapp", "followUp"];

export default function CrmPage({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const [clientName, setClientName] = useState("Cliente demo");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  if (!session?.token) {
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

  async function run(mode) {
    setError("");
    try {
      const client = { name: clientName, lastVisitAt: "2026-05-01", visits: 3 };
      const json = mode === "segment" ? await dakinisCrmSegment(client) : await dakinisCrmTimeline(client);
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("app.crm.error"));
    }
  }

  const journeySteps = DAKINIS_CRM_JOURNEY_KEYS.map((key) => t(`app.crm.journey.${key}`));

  return (
    <section className="modules">
      <div className="container">
        <p className="kicker">{t("app.crm.title")}</p>
        <h2>{t("app.crm.heading")}</h2>
        <p className="lead">{t("app.crm.lead")}</p>

        <div className="crm-journey card" aria-label={t("app.crm.journeyAria")}>
          {journeySteps.map((label, index) => (
            <span key={DAKINIS_CRM_JOURNEY_KEYS[index]} className="crm-journey__step">
              {label}
              {index < journeySteps.length - 1 ? (
                <span className="crm-journey__arrow" aria-hidden>
                  →
                </span>
              ) : null}
            </span>
          ))}
        </div>
        <p className="kpi-label">{t("app.crm.journeyHint")}</p>

        <div className="crm-quick-links">
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/dashboard")}>
            {t("app.crm.linkReservations")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/whatsapp")}>
            {t("app.crm.linkCommunications")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/hub")}>
            {t("appNav.hub")}
          </button>
        </div>

        <div className="mockup-form card" style={{ gridTemplateColumns: "1fr", marginTop: "1.25rem" }}>
          <label className="mockup-field">
            <span>{t("app.crm.client")}</span>
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <button type="button" className="btn" onClick={() => run("segment")}>
              {t("app.crm.segment")}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => run("timeline")}>
              {t("app.crm.timeline")}
            </button>
          </div>
        </div>
        {error ? (
          <p className="lead" style={{ color: "#f97316" }}>
            {error}
          </p>
        ) : null}
        {result ? <pre className="config-box">{JSON.stringify(result, null, 2)}</pre> : null}
      </div>
    </section>
  );
}
