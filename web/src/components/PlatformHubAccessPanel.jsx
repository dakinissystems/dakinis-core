import { useEffect, useState } from "react";
import { useLocale } from "../context/LocaleContext.jsx";
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
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const [selected, setSelected] = useState(() => new Set(initialProducts));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setSelected(new Set(initialProducts?.length ? initialProducts : ["core"]));
  }, [businessId, initialProducts]);

  function toggleProduct(id) {
    if (id === "core") return;
    setSelected((prev) => {
      const next = new Set(prev);
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
    const hubProducts = HUB_PRODUCT_OPTIONS.map((o) => o.id).filter((id) => selected.has(id));
    try {
      await dakinisBearerJsonFetch(
        `/api/platform/businesses/${encodeURIComponent(businessId)}/hub-products`,
        session.token,
        { method: "PATCH", body: { hubProducts } }
      );
      setNotice(t("admin.hubAccess.saved"));
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.hubAccess.saveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card" style={{ marginTop: "0.75rem", gridColumn: "1 / -1" }}>
      <h4 style={{ marginTop: 0 }}>{t("admin.hubAccess.title")}</h4>
      <p className="lead" style={{ marginBottom: "0.75rem" }}>
        {t("admin.hubAccess.lead", { slug: businessSlug })}
      </p>
      <form onSubmit={handleSave}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
          {HUB_PRODUCT_OPTIONS.map((opt) => (
            <label key={opt.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={selected.has(opt.id)}
                disabled={opt.locked || saving}
                onChange={() => toggleProduct(opt.id)}
              />
              <span>{opt.label}</span>
              {opt.locked ? (
                <span className="kpi-label">{t("admin.hubAccess.alwaysOn")}</span>
              ) : null}
            </label>
          ))}
        </div>
        {error ? <p className="login-form__error">{error}</p> : null}
        {notice ? (
          <p className="lead" style={{ color: "var(--accent, #22c55e)" }}>
            {notice}
          </p>
        ) : null}
        <button type="submit" className="btn" disabled={saving} style={{ marginTop: "0.75rem" }}>
          {saving ? t("admin.hubAccess.saving") : t("admin.hubAccess.save")}
        </button>
      </form>
    </div>
  );
}
