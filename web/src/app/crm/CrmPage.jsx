import { useState } from "react";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import { dakinisCrmSegment, dakinisCrmTimeline } from "../../services/crm.js";

export default function CrmPage({ navigate }) {
  const { session } = useDakinisSession();
  const [clientName, setClientName] = useState("Cliente demo");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  if (!session?.token) {
    return (
      <section className="modules">
        <div className="container">
          <h2>CRM</h2>
          <p className="lead">Inicia sesion para usar el tenant real por JWT.</p>
          <button className="btn" type="button" onClick={() => navigate("/login")}>
            Ir a login
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
      setError(err instanceof Error ? err.message : "Error CRM");
    }
  }

  return (
    <section className="modules">
      <div className="container">
        <h2>CRM v1</h2>
        <div className="mockup-form card" style={{ gridTemplateColumns: "1fr" }}>
          <label className="mockup-field">
            <span>Cliente</span>
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" className="btn" onClick={() => run("segment")}>
              Segmentar
            </button>
            <button type="button" className="btn btn-outline" onClick={() => run("timeline")}>
              Timeline
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/app/dashboard")}>
              Dashboard
            </button>
          </div>
        </div>
        {error ? <p className="lead" style={{ color: "#f97316" }}>{error}</p> : null}
        {result ? <pre className="config-box">{JSON.stringify(result, null, 2)}</pre> : null}
      </div>
    </section>
  );
}
