import { useState } from "react";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisTenantCopilot, dakinisTenantExecuteAction } from "../services/tenant-intelligence.js";

export default function DakinisCopilotBar() {
  const { session } = useDakinisSession();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  if (!session?.token || session.user?.role === "platform_admin") return null;

  async function onAsk(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const json = await dakinisTenantCopilot(session, query.trim());
      setResult(json?.data?.copilot || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error Copilot");
    } finally {
      setLoading(false);
    }
  }

  async function onConfirmAction(actionId) {
    setLoading(true);
    try {
      await dakinisTenantExecuteAction(session, actionId);
      setResult((prev) =>
        prev
          ? {
              ...prev,
              actions: (prev.actions || []).filter((a) => a.id !== actionId)
            }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error acción");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="copilot-bar">
      <button
        type="button"
        className="btn btn-outline copilot-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Pregúntale a Dakinis
      </button>
      {open ? (
        <div className="copilot-panel card">
          <form onSubmit={onAsk} className="copilot-form">
            <input
              type="search"
              placeholder="Muéstrame clientes perdidos, analiza ventas…"
              value={query}
              onChange={(ev) => setQuery(ev.target.value)}
              aria-label="Pregunta a Dakinis Copilot"
            />
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "…" : "Preguntar"}
            </button>
          </form>
          {error ? <p className="lead" style={{ color: "#f97316" }}>{error}</p> : null}
          {result?.answer ? <p className="lead">{result.answer}</p> : null}
          {result?.actions?.length ? (
            <ul className="copilot-actions">
              {result.actions.map((a) => (
                <li key={a.id}>
                  {a.label}{" "}
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={loading}
                    onClick={() => onConfirmAction(a.id)}
                  >
                    {a.confirmLabel || "Ejecutar"}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
