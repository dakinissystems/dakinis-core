import { useCallback, useEffect, useMemo, useState } from "react";
import AllergenPublicTable from "../components/AllergenPublicTable.jsx";
import RestaurantAllergenPanel from "../components/RestaurantAllergenPanel.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisTenantJsonFetch } from "../services/api.js";

export default function PublicAllergiesPage({ token, navigate }) {
  const { session } = useDakinisSession();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [editProfile, setEditProfile] = useState(null);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const loadPublic = useCallback(async (signal) => {
    setError("");
    try {
      const res = await fetch(`/api/public/restaurant/${encodeURIComponent(token)}/allergies`, {
        signal
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || "No disponible");
      }
      setData(json.data);
    } catch (e) {
      if (e?.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Error al cargar");
      setData(null);
    }
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    loadPublic(controller.signal);
    return () => controller.abort();
  }, [loadPublic, reloadKey]);

  const presentList = useMemo(
    () => data?.presentAllergies ?? data?.allergies ?? [],
    [data]
  );

  const canEdit = useMemo(() => {
    if (!session?.token || !data?.businessSlug) return false;
    if (session.business?.type !== "restaurante") return false;
    const slug = session.business?.slug;
    const id = session.business?.id;
    return slug === data.businessSlug || id === data.businessSlug;
  }, [session, data]);

  const fetchOpts = useMemo(
    () => ({
      businessId: data?.businessSlug,
      businessTypeHeader: "restaurante"
    }),
    [data?.businessSlug]
  );

  const reloadEditProfile = useCallback(async () => {
    if (!canEdit || !session?.token || !data?.businessSlug) return;
    setEditError("");
    try {
      const json = await dakinisTenantJsonFetch("/api/tenant/restaurant/kitchen", session, fetchOpts);
      setEditProfile(json?.data?.profile ?? null);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "No se pudo cargar el editor");
    }
  }, [canEdit, session, data?.businessSlug, fetchOpts]);

  useEffect(() => {
    reloadEditProfile();
  }, [reloadEditProfile, reloadKey]);

  async function dakinisOnAllergenSaved() {
    setReloadKey((k) => k + 1);
  }

  if (error) {
    return (
      <section className="modules allergen-public">
        <div className="container allergen-public__inner">
          <h2>Información de alergias</h2>
          <p className="lead allergen-public__error">{error}</p>
          <p className="lead" style={{ fontSize: "0.9rem" }}>
            Si eres el restaurante, inicia sesión y guarda el cartel en{" "}
            <button type="button" className="btn btn-outline" onClick={() => navigate?.("/login")}>
              Iniciar sesión
            </button>{" "}
            → <button type="button" className="btn btn-outline" onClick={() => navigate?.("/sistema/restaurante")}>
              Cocina / stock
            </button>
          </p>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="modules allergen-public">
        <div className="container">
          <p className="lead">Cargando…</p>
        </div>
      </section>
    );
  }

  const canonicalUrl = data.publicPath
    ? `${window.location.origin}${data.publicPath}`
    : data.publicToken
      ? `${window.location.origin}/alergenos/${data.publicToken}`
      : "";

  return (
    <section className="modules allergen-public">
      <div className="container allergen-public__inner">
        <p className="kicker">Cartel digital</p>
        <h1>{data.venueName}</h1>
        <p className="lead">
          Alérgenos e ingredientes <strong>presentes</strong> en nuestra carta o cocina. Consulta con el
          personal antes de pedir.
        </p>
        <p className="kpi-label">
          Actualizado: {data.updatedAt ? new Date(data.updatedAt).toLocaleString("es-ES") : "—"}
        </p>

        <article className="card allergen-public__card">
          {presentList.length ? (
            <>
              <p className="allergen-public__table-title">
                <strong>{presentList.length}</strong> alérgeno{presentList.length === 1 ? "" : "s"} declarado
                {presentList.length === 1 ? "" : "s"} en carta
              </p>
              <AllergenPublicTable allergens={presentList} />
            </>
          ) : (
            <AllergenPublicTable
              allergens={[]}
              emptyMessage="Este establecimiento no ha declarado alérgenos presentes en carta. Pregunta al personal."
            />
          )}
        </article>

        {canEdit ? (
          <div className="allergen-public__editor">
            <h2 className="allergen-public__editor-title">Editar cartel (admin)</h2>
            <p className="lead" style={{ fontSize: "0.9rem" }}>
              Marca los alérgenos presentes y pulsa guardar; el QR y esta página se actualizan al instante.
            </p>
            {editError ? <p className="lead allergen-public__error">{editError}</p> : null}
            {editProfile ? (
              <RestaurantAllergenPanel
                apiSession={session}
                fetchOpts={fetchOpts}
                profile={editProfile}
                onSaved={dakinisOnAllergenSaved}
                busy={editBusy}
                setBusy={setEditBusy}
                setError={setEditError}
              />
            ) : (
              <p className="lead">Cargando editor…</p>
            )}
            {canonicalUrl ? (
              <p className="kpi-label" style={{ marginTop: "0.75rem" }}>
                URL del QR:{" "}
                <a href={canonicalUrl} target="_blank" rel="noreferrer">
                  {canonicalUrl}
                </a>
              </p>
            ) : null}
          </div>
        ) : (
          <p className="kpi-label" style={{ marginTop: "1rem" }}>
            ¿Eres el restaurante?{" "}
            <button type="button" className="btn btn-outline" onClick={() => navigate?.("/login")}>
              Inicia sesión
            </button>{" "}
            para editar el cartel.
          </p>
        )}

        <p className="kpi-label allergen-public__footer">
          Referencia: 14 alérgenos obligatorios (UE). Solo se listan los marcados como presentes por el
          restaurante.
        </p>
      </div>
    </section>
  );
}
