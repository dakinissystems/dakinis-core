import { useEffect, useMemo, useState } from "react";
import { dakinisTenantJsonFetch } from "../services/api.js";

export default function RestaurantAllergenPanel({ apiSession, fetchOpts, profile, onSaved, busy, setBusy, setError }) {
  const [checklist, setChecklist] = useState(() => profile?.allergenChecklist ?? []);
  const [customAllergies, setCustomAllergies] = useState(() => profile?.customAllergies ?? []);

  useEffect(() => {
    if (profile?.allergenChecklist) setChecklist(profile.allergenChecklist);
    if (profile?.customAllergies) setCustomAllergies(profile.customAllergies);
  }, [profile?.allergenChecklist, profile?.customAllergies, profile?.updatedAt]);

  const presentCount = useMemo(
    () => checklist.filter((a) => a.present).length + customAllergies.filter((a) => a.present).length,
    [checklist, customAllergies]
  );

  const publicUrl = useMemo(() => {
    const token = profile?.publicToken;
    if (!token) return "";
    return `${window.location.origin}/alergenos/${token}`;
  }, [profile?.publicToken]);

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
      setError(e instanceof Error ? e.message : "No se guardaron alergias");
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
      <h4>Alérgenos e intolerancias (carta / cocina)</h4>
      <p className="lead">
        Lista de referencia (14 alérgenos UE + extras). Marca <strong>Sí</strong> si el alérgeno está presente en
        vuestro menú o cocina; el cartel QR solo muestra los marcados.
      </p>
      <p className="allergen-panel__summary">
        <span className="allergen-panel__badge">{presentCount}</span> marcados como presentes ·{" "}
        {profile?.totalCatalogCount ?? 14} obligatorios UE
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
                        <span className="allergen-row__state">{item.present ? "Sí hay" : "No hay"}</span>
                      </label>
                      <p className="allergen-row__hint">{item.hint}</p>
                      {item.present ? (
                        <input
                          className="allergen-row__notes"
                          type="text"
                          placeholder="Dónde aparece (ej. harina, tapas, salsa…)"
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
            <summary>Otros / personalizados</summary>
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
                  Presente
                </label>
                <input
                  placeholder="Nombre"
                  value={c.name}
                  onChange={(e) => {
                    const next = [...customAllergies];
                    next[idx] = { ...next[idx], name: e.target.value };
                    setCustomAllergies(next);
                  }}
                />
                <input
                  placeholder="Notas"
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
                  Quitar
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
              Añadir otro
            </button>
          </details>

          <div className="allergen-panel__actions">
            <button type="button" className="btn" disabled={busy} onClick={dakinisSave}>
              Guardar y actualizar QR
            </button>
          </div>
        </>
      ) : (
        <p className="lead">Inicia sesión como admin del restaurante para editar el checklist.</p>
      )}

      {publicUrl ? (
        <div className="allergen-panel__qr">
          <img src={qrImageUrl} width={160} height={160} alt="QR alergias" />
          <div>
            <a href={publicUrl} target="_blank" rel="noreferrer">
              {publicUrl}
            </a>
            <p className="kpi-label">Vista pública: solo alérgenos marcados «Sí hay»</p>
          </div>
        </div>
      ) : null}
    </article>
  );
}
