import { useCallback, useEffect, useState } from "react";
import { useLocale } from "../context/LocaleContext.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisBearerJsonFetch } from "../services/api.js";

export default function PlatformCatalogPanel() {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const [source, setSource] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!session?.token) return;
    setError("");
    setLoading(true);
    try {
      const json = await dakinisBearerJsonFetch("/api/platform/catalog", session.token);
      const data = json?.data;
      setSource(data?.source || "");
      setUpdatedAt(data?.updatedAt || "");
      setJsonText(
        JSON.stringify(
          {
            products: data?.products || [],
            hubModules: data?.hubModules || []
          },
          null,
          2
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : t("admin.catalog.loadError"));
    } finally {
      setLoading(false);
    }
  }, [session?.token, t]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed.products)) {
        throw new Error(t("admin.catalog.invalidShape"));
      }
      const json = await dakinisBearerJsonFetch("/api/platform/catalog", session.token, {
        method: "PUT",
        body: parsed
      });
      const data = json?.data;
      setSource(data?.source || "database");
      setUpdatedAt(data?.updatedAt || "");
      setNotice(t("admin.catalog.saved"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("admin.catalog.saveError"));
    } finally {
      setSaving(false);
    }
  }

  function handleResetFromRepo() {
    setNotice("");
    setError("");
    load();
  }

  if (loading) {
    return <p className="lead">{t("admin.catalog.loading")}</p>;
  }

  return (
    <article className="card" style={{ marginTop: "1.5rem" }}>
      <h3>{t("admin.catalog.title")}</h3>
      <p className="lead">{t("admin.catalog.lead")}</p>
      <p className="kpi-label">
        {t("admin.catalog.meta", { source: source || "—", updatedAt: updatedAt || "—" })}
      </p>
      <form onSubmit={handleSave}>
        <label className="mockup-field" style={{ display: "block" }}>
          <span>{t("admin.catalog.jsonLabel")}</span>
          <textarea
            className="config-box"
            rows={18}
            value={jsonText}
            onChange={(ev) => setJsonText(ev.target.value)}
            spellCheck={false}
            style={{ width: "100%", fontFamily: "ui-monospace, monospace", fontSize: "0.85rem" }}
          />
        </label>
        {error ? <p className="login-form__error">{error}</p> : null}
        {notice ? <p className="lead" style={{ color: "var(--dakinis-accent, var(--accent))" }}>{notice}</p> : null}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? t("admin.catalog.saving") : t("admin.catalog.save")}
          </button>
          <button type="button" className="btn btn-outline" onClick={handleResetFromRepo} disabled={saving}>
            {t("admin.catalog.reload")}
          </button>
        </div>
      </form>
    </article>
  );
}
