import { useState } from "react";
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
  const { session } = useDakinisSession();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  if (!session?.token) {
    return (
      <section className="modules">
        <div className="container">
          <h2>Dashboard privado</h2>
          <p className="lead">Debes iniciar sesion para usar el flujo real con JWT.</p>
          <button className="btn" type="button" onClick={() => navigate("/login")}>
            Ir a login
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
      setError(err instanceof Error ? err.message : "Error llamando API");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="modules">
      <div className="container">
        <p className="kicker">JWT tenant: {session.business?.slug || session.business?.id}</p>
        <h2>Dashboard API v1</h2>
        <p className="lead">Pruebas rápidas de appointments y whatsapp usando Authorization Bearer.</p>
        <div className="pill-grid" style={{ marginBottom: "1rem" }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/crm")}>
            CRM
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/messages")}>
            Messages
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/settings")}>
            Settings
          </button>
        </div>

        <div className="module-grid">
          <article className="card">
            <h3>Appointments</h3>
            <div className="pill-grid">
              <button
                type="button"
                className="btn"
                disabled={loading}
                onClick={() =>
                  run("slots", () => dakinisAppointmentSlots("2026-05-06T09:00:00Z", "2026-05-06T18:00:00Z"))
                }
              >
                Slots
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
                Can Schedule
              </button>
              <button
                type="button"
                className="btn"
                disabled={loading}
                onClick={() => run("booking-link", () => dakinisAppointmentLink(session.business?.slug))}
              >
                Booking Link
              </button>
            </div>
          </article>

          <article className="card">
            <h3>WhatsApp</h3>
            <button
              type="button"
              className="btn"
              disabled={loading}
              onClick={() => run("whatsapp-rules", () => dakinisWhatsappRules())}
            >
              Listar reglas
            </button>
          </article>
        </div>

        {error ? <p className="lead" style={{ color: "#f97316" }}>{error}</p> : null}
        {result ? <JsonBox data={result} /> : null}
      </div>
    </section>
  );
}
