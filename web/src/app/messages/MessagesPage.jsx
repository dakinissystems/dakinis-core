import { useState } from "react";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import {
  dakinisMessageConfirmation,
  dakinisMessageReactivation,
  dakinisMessageReminder
} from "../../services/messages.js";

export default function MessagesPage({ navigate }) {
  const { session } = useDakinisSession();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  if (!session?.token) {
    return (
      <section className="modules">
        <div className="container">
          <h2>Messages</h2>
          <p className="lead">Inicia sesion para usar endpoints privados del tenant.</p>
          <button className="btn" type="button" onClick={() => navigate("/login")}>
            Ir a login
          </button>
        </div>
      </section>
    );
  }

  async function run(kind) {
    setError("");
    try {
      const payload = { clientName: "Ana", businessName: session.business?.name || "Dakinis" };
      const json =
        kind === "confirmation"
          ? await dakinisMessageConfirmation(payload)
          : kind === "reminder"
            ? await dakinisMessageReminder(payload)
            : await dakinisMessageReactivation(payload);
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error messages");
    }
  }

  return (
    <section className="modules">
      <div className="container">
        <h2>Messages v1</h2>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="button" className="btn" onClick={() => run("confirmation")}>
            Confirmacion
          </button>
          <button type="button" className="btn btn-outline" onClick={() => run("reminder")}>
            Reminder
          </button>
          <button type="button" className="btn btn-outline" onClick={() => run("reactivation")}>
            Reactivation
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/dashboard")}>
            Dashboard
          </button>
        </div>
        {error ? <p className="lead" style={{ color: "#f97316" }}>{error}</p> : null}
        {result ? <pre className="config-box">{JSON.stringify(result, null, 2)}</pre> : null}
      </div>
    </section>
  );
}
