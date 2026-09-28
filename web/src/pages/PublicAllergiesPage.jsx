import { useCallback, useEffect, useMemo, useState } from "react";
import { dakinisIsHospitalityBusiness } from "@dakinis/shared/catalog/hospitality.js";
import AllergenPublicDishes from "../components/AllergenPublicDishes.jsx";
import RestaurantAllergenPanel from "../components/RestaurantAllergenPanel.jsx";
import { useLocale } from "../context/LocaleContext.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisTenantJsonFetch } from "../services/api.js";

export default function PublicAllergiesPage({ token, navigate }) {
  const { session } = useDakinisSession();
  const { locale, t } = useLocale();
  const dateLocale = locale === "en" ? "en-US" : "es-ES";
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
        throw new Error(json?.error?.message || t("allergens.notFound"));
      }
      setData(json.data);
    } catch (e) {
      if (e?.name === "AbortError") return;
      setError(e instanceof Error ? e.message : t("allergens.loadError"));
      setData(null);
    }
  }, [token, t]);

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
    if (!dakinisIsHospitalityBusiness(session.business?.type)) return false;
    const slug = session.business?.slug;
    const id = session.business?.id;
    return slug === data.businessSlug || id === data.businessSlug;
  }, [session, data]);

  const fetchOpts = useMemo(
    () => ({
      businessId: data?.businessSlug,
      businessTypeHeader: session?.business?.type || "restaurante"
    }),
    [data?.businessSlug, session?.business?.type]
  );

  const reloadEditProfile = useCallback(async () => {
    if (!canEdit || !session?.token || !data?.businessSlug) return;
    setEditError("");
    try {
      const json = await dakinisTenantJsonFetch("/api/tenant/restaurant/kitchen", session, fetchOpts);
      setEditProfile(json?.data?.profile ?? null);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : t("allergens.editorLoadError"));
    }
  }, [canEdit, session?.token, session?.business?.slug, data?.businessSlug, fetchOpts, t]);

  useEffect(() => {
    reloadEditProfile();
  }, [reloadEditProfile, reloadKey]);

  async function dakinisOnAllergenSaved() {
    setReloadKey((k) => k + 1);
  }

  if (error) {
    const demoSlugUrl = `${window.location.origin}/alergenos/restaurante-demo`;
    return (
      <section className="modules allergen-public">
        <div className="container allergen-public__inner">
          <h2>{t("allergens.publicTitle")}</h2>
          <p className="lead allergen-public__error">{error}</p>
          <p className="kpi-label">{t("allergens.scannedLink", { token })}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
            <button type="button" className="btn" onClick={() => setReloadKey((k) => k + 1)}>
              {t("allergens.retry")}
            </button>
            <a className="btn btn-outline" href={demoSlugUrl}>
              {t("allergens.tryDemo")}
            </a>
            <button type="button" className="btn btn-outline" onClick={() => navigate?.("/login")}>
              {t("allergens.signIn")}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate?.("/sistema/restaurante?task=config&sub=allergens")}
            >
              {t("allergens.kitchenStock")}
            </button>
          </div>
          <p className="lead" style={{ fontSize: "0.85rem", marginTop: "1rem" }}>
            {t("allergens.errorHint")}
          </p>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="modules allergen-public">
        <div className="container">
          <p className="lead">{t("allergens.loading")}</p>
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
        <p className="kicker">{t("allergens.publicKicker")}</p>
        <h1>{data.venueName}</h1>
        <p className="lead">{t("allergens.publicLead")}</p>
        <p className="kpi-label">
          {t("allergens.updated")}{" "}
          {data.updatedAt ? new Date(data.updatedAt).toLocaleString(dateLocale) : "—"}
        </p>

        <article className="card allergen-public__card">
          <AllergenPublicDishes
            presentList={presentList}
            dishes={data.dishes}
            infoRows={data.infoRows}
            catalogRows={data.catalogRows}
            t={t}
          />
        </article>

        {canEdit ? (
          <div className="allergen-public__editor">
            <h2 className="allergen-public__editor-title">{t("allergens.editTitle")}</h2>
            <p className="lead" style={{ fontSize: "0.9rem" }}>
              {t("allergens.editLead")}
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
              <p className="lead">{t("allergens.loadingEditor")}</p>
            )}
            {canonicalUrl ? (
              <p className="kpi-label" style={{ marginTop: "0.75rem" }}>
                {t("allergens.qrUrl")}{" "}
                <a href={canonicalUrl} target="_blank" rel="noreferrer">
                  {canonicalUrl}
                </a>
              </p>
            ) : null}
          </div>
        ) : (
          <p className="kpi-label" style={{ marginTop: "1rem" }}>
            {t("allergens.ownerPrompt")}{" "}
            <button type="button" className="btn btn-outline" onClick={() => navigate?.("/login")}>
              {t("allergens.ownerLogin")}
            </button>{" "}
            {t("allergens.ownerEditHint")}
          </p>
        )}

        <p className="kpi-label allergen-public__footer">{t("allergens.footerRef")}</p>
      </div>
    </section>
  );
}
