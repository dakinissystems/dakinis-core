import { useCallback, useMemo, useRef, useState } from "react";
import {
  DAKINIS_MUSHROOM_INFO_ROW_ID,
  DAKINIS_RESTAURANT_MUSHROOM_OPTIONS,
  dakinisEnsureMushroomInfoRow,
  dakinisFindMushroomInfoRow,
  dakinisResolveMushroomSelection,
  dakinisSyncMushroomsInCustomAllergies
} from "@dakinis/shared/catalog/restaurant-mushrooms.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisTenantJsonFetch } from "../services/api.js";

export default function RestaurantAllergenPanel({ apiSession, fetchOpts, profile, onSaved, busy, setBusy, setError }) {
  const { t } = useLocale();
  const [checklist, setChecklist] = useState(() => profile?.allergenChecklist ?? []);
  const [customAllergies, setCustomAllergies] = useState(() => profile?.customAllergies ?? []);
  const [selectedMushrooms, setSelectedMushrooms] = useState(() => {
    const hit = dakinisFindMushroomInfoRow(profile?.customAllergies ?? []);
    return hit
      ? dakinisResolveMushroomSelection(hit.row.mushroomTypes, hit.row.notes)
      : [];
  });
  const [mushroomSectionOpen, setMushroomSectionOpen] = useState(() =>
    Boolean(dakinisFindMushroomInfoRow(profile?.customAllergies ?? []))
  );

  const profileSyncKey = [
    profile?.updatedAt,
    profile?.publicToken,
    profile?.allergenChecklist?.length,
    profile?.customAllergies?.length
  ].join("|");
  const [syncedProfileKey, setSyncedProfileKey] = useState(profileSyncKey);

  if (profileSyncKey !== syncedProfileKey) {
    setSyncedProfileKey(profileSyncKey);
    if (profile?.allergenChecklist?.length) setChecklist(profile.allergenChecklist);
    if (profile?.customAllergies) {
      setCustomAllergies(profile.customAllergies);
      const hit = dakinisFindMushroomInfoRow(profile.customAllergies);
      setSelectedMushrooms(
        hit ? dakinisResolveMushroomSelection(hit.row.mushroomTypes, hit.row.notes) : []
      );
      setMushroomSectionOpen(Boolean(hit));
    }
  }

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

  function dakinisToggleMushroom(name) {
    setSelectedMushrooms((prev) => {
      const has = prev.includes(name);
      if (has) return prev.filter((m) => m !== name);
      return [...prev, name].sort(
        (a, b) =>
          DAKINIS_RESTAURANT_MUSHROOM_OPTIONS.findIndex((o) => o.name === a) -
          DAKINIS_RESTAURANT_MUSHROOM_OPTIONS.findIndex((o) => o.name === b)
      );
    });
  }

  function dakinisEnableMushroomSection() {
    setMushroomSectionOpen(true);
    setCustomAllergies((prev) => dakinisEnsureMushroomInfoRow(prev, selectedMushrooms));
  }

  async function dakinisSave() {
    if (!apiSession?.token) return;
    setBusy(true);
    setError("");
    const customToSave = mushroomSectionOpen
      ? dakinisSyncMushroomsInCustomAllergies(customAllergies, selectedMushrooms)
      : customAllergies;
    try {
      await dakinisTenantJsonFetch("/api/tenant/restaurant/profile", apiSession, {
        ...fetchOpts,
        method: "PATCH",
        body: { allergenChecklist: checklist, customAllergies: customToSave }
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
                          aria-label={`${t("allergens.notesPlaceholder")} — ${item.name}`}
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

          <section className="allergen-mushroom-section">
            <h5 className="allergen-checklist__category">{t("allergens.mushroomTitle")}</h5>
            <p className="allergen-mushroom-section__lead">{t("allergens.mushroomLead")}</p>
            {mushroomSectionOpen ? (
              <>
                <ul className="allergen-mushroom-grid" role="list">
                  {DAKINIS_RESTAURANT_MUSHROOM_OPTIONS.map((opt) => (
                    <li key={opt.id}>
                      <label className="allergen-mushroom-chip">
                        <input
                          type="checkbox"
                          checked={selectedMushrooms.includes(opt.name)}
                          onChange={() => dakinisToggleMushroom(opt.name)}
                        />
                        <span>{opt.name}</span>
                      </label>
                    </li>
                  ))}
                </ul>
                <p className="kpi-label allergen-mushroom-section__hint">
                  {selectedMushrooms.length
                    ? t("allergens.mushroomSelected", { count: selectedMushrooms.length })
                    : t("allergens.mushroomNoneSelected")}
                </p>
              </>
            ) : (
              <button type="button" className="btn btn-outline" onClick={dakinisEnableMushroomSection}>
                {t("allergens.mushroomEnable")}
              </button>
            )}
          </section>

          <details className="allergen-custom-details">
            <summary>{t("allergens.customSummary")}</summary>
            {customAllergies.map((c, idx) => {
              if (c.id === DAKINIS_MUSHROOM_INFO_ROW_ID || (c.name === "Hongos" && c.category === "Ingredientes")) {
                return null;
              }
              return (
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
                  aria-label={t("allergens.customName")}
                  placeholder={t("allergens.customName")}
                  value={c.name}
                  onChange={(e) => {
                    const next = [...customAllergies];
                    next[idx] = { ...next[idx], name: e.target.value };
                    setCustomAllergies(next);
                  }}
                />
                <input
                  aria-label={t("allergens.customNotes")}
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
            );
            })}
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
            <p className="kpi-label">{t("allergens.qrUrlStable")}</p>
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
