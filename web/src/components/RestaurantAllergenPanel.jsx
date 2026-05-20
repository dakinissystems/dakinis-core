import { useEffect, useMemo, useState } from "react";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisTenantJsonFetch } from "../services/api.js";

export default function RestaurantAllergenPanel({ apiSession, fetchOpts, profile, onSaved, busy, setBusy, setError }) {
  const { t } = useLocale();
  const [checklist, setChecklist] = useState(() => profile?.allergenChecklist ?? []);
  const [customAllergies, setCustomAllergies] = useState(() => profile?.customAllergies ?? []);

  useEffect(() => {
    if (profile?.allergenChecklist?.length) setChecklist(profile.allergenChecklist);
    if (profile?.customAllergies) setCustomAllergies(profile.customAllergies);
  }, [profile?.allergenChecklist, profile?.customAllergies, profile?.updatedAt, profile?.publicToken]);

  const presentCount = useMemo(
    () => checklist.filter((a) => a.present).length + customAllergies.filter((a) => a.present).length,
    [checklist, customAllergies]
  );

  const publicUrl = useMemo(() => {
    if (profile?.publicPathBySlug && profile?.businessSlug) {
      return `${window.location.origin}${profile.publicPathBySlug}`;
    }
    const token = profile?.publicToken;
    if (!token) return "";
    return `${window.location.origin}/alergenos/${token}`;
  }, [profile?.publicToken, profile?.publicPathBySlug, profile?.businessSlug]);

  const qrImageUrl = useMemo(() => {
    if (!publicUrl) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(publicUrl)}`;
  }, [publicUrl]);

  function dakinisToggleCatalog(catalogId, present) {
    setChecklist((prev) =>
      prev.map((a) => (a.catalogId === catalogId ? { ...a, present, notes: present ? a.notes : "" } : a))
    );
  }

  function dakinisUpdateCatalogNotes(catalogId, notes) {
    setChecklist((prev) => prev.map((a) => (a.catalogId === catalogId ? { ...a, notes } : a)));
  }

  async function dakinisSave() {
    if (!apiSession?.token) return;
    setBusy(true);
    setError("");
    try {
      await dakinisTenantJsonFetch("/api/tenant/restaurant/profile", apiSession, {
        ...fetchOpts,
        method: "PATCH",
        body: { allergenChecklist: checklist, customAllergies }
      });
      await onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("allergens.saveError"));
    } finally {
      setBusy(false);
    }
  }

  const byCategory = useMemo(() => {
    const groups = new Map();
    for (const item of checklist) {
      const cat = item.category || "Otros";
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(item);
    }
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [checklist]);

  return (
    <article className="card allergen-panel">
      <h4>{t("allergens.panelTitle")}</h4>
      <p className="lead">{t("allergens.panelLead")}</p>
      <p className="allergen-panel__summary">
        <span className="allergen-panel__badge">{presentCount}</span>{" "}
        {t("allergens.summary", { euCount: profile?.totalCatalogCount ?? 14 })}
      </p>

      {apiSession?.token ? (
        <>
          <div className="allergen-checklist">
            {byCategory.map(([category, items]) => (
              <section key={category} className="allergen-checklist__group">
                <h5 className="allergen-checklist__category">{category}</h5>
                <ul className="allergen-checklist__items">
                  {items.map((item) => (
                    <li key={item.catalogId} className={`allergen-row${item.present ? " is-present" : ""}`}>
                      <label className="allergen-row__check">
                        <input
                          type="checkbox"
                          checked={Boolean(item.present)}
                          onChange={(e) => dakinisToggleCatalog(item.catalogId, e.target.checked)}
                        />
                        <span className="allergen-row__name">{item.name}</span>
                        <span className="allergen-row__state">
                          {item.present ? t("allergens.presentYes") : t("allergens.presentNo")}
                        </span>
                      </label>
                      <p className="allergen-row__hint">{item.hint}</p>
                      {item.present ? (
                        <input
                          className="allergen-row__notes"
                          type="text"
                          placeholder={t("allergens.notesPlaceholder")}
                          value={item.notes || ""}
                          onChange={(e) => dakinisUpdateCatalogNotes(item.catalogId, e.target.value)}
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <details className="allergen-custom-details">
            <summary>{t("allergens.customSummary")}</summary>
            {customAllergies.map((c, idx) => (
              <div key={c.id || idx} className="allergen-custom-row">
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(c.present)}
                    onChange={(e) => {
                      const next = [...customAllergies];
                      next[idx] = { ...next[idx], present: e.target.checked };
                      setCustomAllergies(next);
                    }}
                  />
                  {t("allergens.customPresent")}
                </label>
                <input
                  placeholder={t("allergens.customName")}
                  value={c.name}
                  onChange={(e) => {
                    const next = [...customAllergies];
                    next[idx] = { ...next[idx], name: e.target.value };
                    setCustomAllergies(next);
                  }}
                />
                <input
                  placeholder={t("allergens.customNotes")}
                  value={c.notes || ""}
                  onChange={(e) => {
                    const next = [...customAllergies];
                    next[idx] = { ...next[idx], notes: e.target.value };
                    setCustomAllergies(next);
                  }}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setCustomAllergies((prev) => prev.filter((_, i) => i !== idx))}
                >
                  {t("allergens.remove")}
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline"
              onClick={() =>
                setCustomAllergies((prev) => [
                  ...prev,
                  { id: `custom_${Date.now()}`, name: "", present: true, notes: "" }
                ])
              }
            >
              {t("allergens.addCustom")}
            </button>
          </details>

          <div className="allergen-panel__actions">
            <button type="button" className="btn" disabled={busy} onClick={dakinisSave}>
              {t("allergens.save")}
            </button>
          </div>
        </>
      ) : (
        <p className="lead">{t("allergens.loginToEdit")}</p>
      )}

      {publicUrl ? (
        <div className="allergen-panel__qr">
          <img src={qrImageUrl} width={160} height={160} alt={t("allergens.qrAlt")} />
          <div>
            <a href={publicUrl} target="_blank" rel="noreferrer">
              {publicUrl}
            </a>
            <p className="kpi-label">
              {t("allergens.publicViewHint")}{" "}
              {profile?.publicPathBySlug ? (
                <a href={`${window.location.origin}${profile.publicPathBySlug}`} target="_blank" rel="noreferrer">
                  {profile.publicPathBySlug}
                </a>
              ) : null}
            </p>
          </div>
        </div>
      ) : (
        <p className="lead" style={{ color: "#fdba74" }}>
          {t("allergens.saveOnceForQr")}
        </p>
      )}
    </article>
  );
}
