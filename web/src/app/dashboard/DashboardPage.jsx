import { useState } from "react";
import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import {
  dakinisAppointmentCanSchedule,
  dakinisAppointmentLink,
  dakinisAppointmentSlots
} from "../../services/appointments.js";
import { dakinisWhatsappRules } from "../../services/whatsapp.js";

function JsonBox({ data }) {
  return <pre className="config-box">{JSON.stringify(data, null, 2)}</pre>;
}

export default function DashboardPage({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

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

  async function run(label, fn) {
    setLoading(true);
    setError("");
    try {
      const data = await fn();
      setResult({ label, data });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("app.apiError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="modules">
      <div className="container">
        <p className="kicker">
          {t("app.dashboard.kicker", { slug: session.business?.slug || session.business?.id })}
        </p>
        <h2>{t("app.dashboard.heading")}</h2>
        <p className="lead">{t("app.dashboard.lead")}</p>
        <div className="pill-grid" style={{ marginBottom: "1rem" }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/crm")}>
            {t("appNav.crm")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/whatsapp")}>
            {t("appNav.messages")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/settings")}>
            {t("appNav.settings")}
          </button>
        </div>

        <div className="module-grid">
          <article className="card">
            <h3>{t("app.dashboard.appointments")}</h3>
            <div className="pill-grid">
              <button
                type="button"
                className="btn"
                disabled={loading}
                onClick={() =>
                  run("slots", () => dakinisAppointmentSlots("2026-05-06T09:00:00Z", "2026-05-06T18:00:00Z"))
                }
              >
                {t("app.dashboard.slots")}
              </button>
              <button
                type="button"
                className="btn"
                disabled={loading}
                onClick={() =>
                  run("can-schedule", () =>
                    dakinisAppointmentCanSchedule([], "2026-05-06T10:00:00Z", 45)
                  )
                }
              >
                {t("app.dashboard.canSchedule")}
              </button>
              <button
                type="button"
                className="btn"
                disabled={loading}
                onClick={() => run("booking-link", () => dakinisAppointmentLink(session.business?.slug))}
              >
                {t("app.dashboard.link")}
              </button>
            </div>
          </article>

          <article className="card">
            <h3>{t("app.dashboard.whatsapp")}</h3>
            <button
              type="button"
              className="btn"
              disabled={loading}
              onClick={() => run("whatsapp-rules", () => dakinisWhatsappRules())}
            >
              {t("app.dashboard.rules")}
            </button>
          </article>
        </div>

        {error ? <p className="lead" style={{ color: "#f97316" }}>{error}</p> : null}
        {result ? <JsonBox data={result} /> : null}
      </div>
    </section>
  );
}
