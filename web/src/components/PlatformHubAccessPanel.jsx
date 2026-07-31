import { useMemo, useState } from "react";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisBearerJsonFetch } from "../services/api.js";

const HUB_PRODUCT_OPTIONS = [
  { id: "core", label: "Dakinis One", locked: true },
  { id: "lifeflow", label: "LifeFlow" },
  { id: "streamautomator", label: "StreamAutomator" },
  { id: "akoenet", label: "AkoeNet" },
  { id: "tabletop", label: "Tabletop" },
];

/**
 * @param {{ businessId: string; businessSlug: string; initialProducts?: string[]; onSaved?: () => void }} props
 */
export default function PlatformHubAccessPanel({
  businessId,
  businessSlug,
  initialProducts = ["core"],
  onSaved,
}) {
  const { session } = useDakinisSession();
  const normalizedInitial = useMemo(() => {
    const products = initialProducts?.length ? initialProducts : ["core"];
    return new Set(businessId ? products : products);
  }, [businessId, initialProducts]);
  const [localSelected, setLocalSelected] = useState(null);
  const [syncBusinessId, setSyncBusinessId] = useState(businessId);
  if (businessId !== syncBusinessId) {
    setSyncBusinessId(businessId);
    setLocalSelected(null);
  }
  const selected = localSelected ?? normalizedInitial;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function toggleProduct(id) {
    if (id === "core") return;
    setLocalSelected((prev) => {
      const base = prev ?? normalizedInitial;
      const next = new Set(base);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      next.add("core");
      return next;
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!session?.token || !businessId) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await dakinisBearerJsonFetch(
        `/api/platform/businesses/${encodeURIComponent(businessId)}/hub-products`,
        session.token,
        {
          method: "PATCH",
          body: { products: [...selected] },
        }
      );
      setNotice("Acceso Hub actualizado.");
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el acceso Hub.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSave} style={{ marginTop: "1rem" }}>
      <h4>Acceso Hub · {businessSlug}</h4>
      <p className="lead" style={{ fontSize: "0.9rem" }}>
        Productos del ecosistema visibles para este tenant en el Hub y SSO.
      </p>
      <ul className="admin-hub-products">
        {HUB_PRODUCT_OPTIONS.map((opt) => (
          <li key={opt.id}>
            <label>
              <input
                type="checkbox"
                checked={selected.has(opt.id)}
                disabled={opt.locked || saving}
                onChange={() => toggleProduct(opt.id)}
              />
              {opt.label}
              {opt.locked ? " (siempre activo)" : ""}
            </label>
          </li>
        ))}
      </ul>
      {error ? <p className="lead" style={{ color: "var(--dakinis-danger)" }}>{error}</p> : null}
      {notice ? <p className="lead" style={{ color: "var(--dakinis-success)" }}>{notice}</p> : null}
      <button type="submit" className="btn" disabled={saving}>
        {saving ? "Guardando…" : "Guardar acceso Hub"}
      </button>
    </form>
  );
}
