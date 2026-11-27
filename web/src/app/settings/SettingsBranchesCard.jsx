import { useState } from "react";

export default function SettingsBranchesCard({ branches = [], onCreate, onSetDefault, onRemove }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    if (!onCreate || !name.trim()) return;
    setBusy(true);
    setError("");
    try {
      await onCreate({ name: name.trim() });
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la sucursal");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <h3>Sucursales</h3>
      <p className="lead" style={{ marginTop: 0 }}>
        Establecimientos del negocio. La principal se usa por defecto en operaciones.
      </p>

      {branches.length === 0 ? (
        <p className="muted">Todavía no hay sucursales. Crea la primera para el walkthrough.</p>
      ) : (
        <ul style={{ paddingLeft: "1.1rem" }}>
          {branches.map((b) => (
            <li key={b.id} style={{ marginBottom: "0.45rem" }}>
              <strong>{b.name}</strong> ({b.slug})
              {b.isDefault ? " — principal" : ""}
              <span style={{ marginLeft: "0.5rem", display: "inline-flex", gap: "0.35rem" }}>
                {!b.isDefault && typeof onSetDefault === "function" ? (
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      setError("");
                      try {
                        await onSetDefault(b.id);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "No se pudo actualizar");
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Hacer principal
                  </button>
                ) : null}
                {branches.length > 1 && typeof onRemove === "function" ? (
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      setError("");
                      try {
                        await onRemove(b.id);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "No se pudo eliminar");
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Eliminar
                  </button>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      )}

      {typeof onCreate === "function" ? (
        <form onSubmit={handleCreate} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
          <input
            type="text"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            placeholder="Nombre de la sucursal"
            required
            maxLength={120}
            style={{ minWidth: "12rem", flex: "1 1 12rem" }}
          />
          <button type="submit" className="btn" disabled={busy || !name.trim()}>
            {busy ? "Guardando…" : "Añadir sucursal"}
          </button>
        </form>
      ) : null}

      {error ? (
        <p className="lead" style={{ color: "var(--dakinis-warning)", marginBottom: 0 }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
