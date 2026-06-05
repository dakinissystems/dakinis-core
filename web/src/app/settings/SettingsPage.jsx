import { useEffect, useState } from "react";
import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import { useDakinisLogout } from "../../hooks/useDakinisLogout.js";
import { dakinisTenantJsonFetch } from "../../services/api.js";
import {
  dakinisTenantProfile,
  dakinisTenantPatchSettings,
  dakinisTenantBranches,
  dakinisTenantAdvanceOnboarding,
  dakinisTenantBillingSummary,
  dakinisTenantAiUsage,
  dakinisTenantPortalSettings,
  dakinisTenantPatchPortalSettings,
  dakinisTenantMarketplaceInstall,
  dakinisTenantTelemetryAdoption
} from "../../services/tenant-intelligence.js";

export default function SettingsPage({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const signOut = useDakinisLogout();
  const [allergiesUrl, setAllergiesUrl] = useState("");
  const [settings, setSettings] = useState(null);
  const [branches, setBranches] = useState([]);
  const [onboarding, setOnboarding] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [billing, setBilling] = useState(null);
  const [aiUsage, setAiUsage] = useState(null);
  const [portal, setPortal] = useState(null);
  const [adoption, setAdoption] = useState(null);

  useEffect(() => {
    if (!session?.token) return;
    dakinisTenantProfile(session)
      .then((json) => {
        setSettings(json?.data?.settings || null);
        setBranches(json?.data?.branches || []);
        setOnboarding(json?.data?.onboarding || null);
      })
      .catch(() => {});
    dakinisTenantBillingSummary(session).then((j) => setBilling(j?.data?.billing || null)).catch(() => {});
    dakinisTenantAiUsage(session).then((j) => setAiUsage(j?.data?.usage || null)).catch(() => {});
    dakinisTenantTelemetryAdoption(session)
      .then((j) => setAdoption(j?.data?.adoption || null))
      .catch(() => {});
    dakinisTenantPortalSettings(session)
      .then((j) =>
        setPortal({
          ...(j?.data?.portal || {}),
          suggestedFeatures: j?.data?.suggestedFeatures || []
        })
      )
      .catch(() => {});
    if (session?.business?.type !== "restaurante") return;
    dakinisTenantJsonFetch("/api/tenant/restaurant/kitchen", session)
      .then((json) => {
        const token = json?.data?.profile?.publicToken;
        if (token) setAllergiesUrl(`${window.location.origin}/alergenos/${token}`);
      })
      .catch(() => {});
  }, [session]);

  async function saveSettings(e) {
    e.preventDefault();
    if (!session?.token || !settings) return;
    setSaving(true);
    setMsg("");
    try {
      await dakinisTenantPatchSettings(session, settings);
      setMsg("Configuración guardada");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function completeOnboarding() {
    if (!session?.token) return;
    await dakinisTenantAdvanceOnboarding(session, { markComplete: true });
    const json = await dakinisTenantProfile(session);
    setOnboarding(json?.data?.onboarding || null);
  }

  async function refreshBranches() {
    if (!session?.token) return;
    const json = await dakinisTenantBranches(session);
    setBranches(json?.data?.branches || []);
  }

  return (
    <section className="modules">
      <div className="container">
        <h2>{t("app.settings.title")}</h2>
        <p className="lead">{t("app.settings.lead")}</p>
        <div className="card">
          <p>
            <strong>{t("app.settings.user")}</strong> {session?.user?.email || "-"}
          </p>
          <p>
            <strong>{t("app.settings.role")}</strong> {session?.user?.role || "-"}
          </p>
          <p>
            <strong>{t("app.settings.tenant")}</strong>{" "}
            {session?.business?.slug || session?.business?.id || "-"}
          </p>
          <p>
            <strong>{t("app.settings.type")}</strong> {session?.business?.type || "-"}
          </p>
        </div>

        {onboarding && !onboarding.completed ? (
          <div className="card" style={{ marginTop: "1rem" }}>
            <h3>{onboarding.title || "Onboarding"}</h3>
            <ol>
              {(onboarding.steps || []).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <button type="button" className="btn" onClick={completeOnboarding}>
              Marcar onboarding completado
            </button>
          </div>
        ) : null}

        {settings ? (
          <form className="card mockup-form" style={{ marginTop: "1rem" }} onSubmit={saveSettings}>
            <h3>Configuración del negocio</h3>
            <label className="mockup-field">
              <span>Logo (URL)</span>
              <input
                value={settings.logoUrl || ""}
                onChange={(ev) => setSettings((p) => ({ ...p, logoUrl: ev.target.value }))}
              />
            </label>
            <label className="mockup-field">
              <span>Color principal</span>
              <input
                type="color"
                value={settings.primaryColor || "#1a4fd6"}
                onChange={(ev) => setSettings((p) => ({ ...p, primaryColor: ev.target.value }))}
              />
            </label>
            <label className="mockup-field">
              <span>Horario</span>
              <input
                value={settings.businessHours || ""}
                onChange={(ev) => setSettings((p) => ({ ...p, businessHours: ev.target.value }))}
              />
            </label>
            <label className="mockup-field">
              <span>Zona horaria</span>
              <input
                value={settings.timezone || "Europe/Madrid"}
                onChange={(ev) => setSettings((p) => ({ ...p, timezone: ev.target.value }))}
              />
            </label>
            <label className="mockup-field">
              <span>Moneda</span>
              <input
                value={settings.currency || "EUR"}
                onChange={(ev) => setSettings((p) => ({ ...p, currency: ev.target.value }))}
              />
            </label>
            <label className="mockup-field">
              <span>Idioma</span>
              <input
                value={settings.locale || "es"}
                onChange={(ev) => setSettings((p) => ({ ...p, locale: ev.target.value }))}
              />
            </label>
            <label className="mockup-field">
              <span>IVA (%)</span>
              <input
                type="number"
                value={settings.vatRate ?? 21}
                onChange={(ev) => setSettings((p) => ({ ...p, vatRate: Number(ev.target.value) }))}
              />
            </label>
            <label className="mockup-field">
              <span>WhatsApp</span>
              <input
                value={settings.whatsappNumber || ""}
                onChange={(ev) => setSettings((p) => ({ ...p, whatsappNumber: ev.target.value }))}
              />
            </label>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Guardando…" : "Guardar configuración"}
            </button>
            {msg ? <p className="lead">{msg}</p> : null}
          </form>
        ) : null}

        {billing ? (
          <div className="card" style={{ marginTop: "1rem" }}>
            <h3>Facturación (estimación)</h3>
            <p className="lead">
              Plan {billing.subscription?.plan} · Base {billing.usage?.planBaseEur} €/mes
            </p>
            {aiUsage ? (
              <p>
                IA: {aiUsage.queries} consultas · {aiUsage.costEur} € estimado ({aiUsage.periodDays} días)
              </p>
            ) : null}
            <p>
              Próxima factura estimada: <strong>{billing.nextInvoiceEstimate?.amount} €</strong>
              {billing.stripeConnected ? "" : " (Stripe no conectado)"}
            </p>
          </div>
        ) : null}

        {adoption?.totals?.sessions > 0 ? (
          <div className="card" style={{ marginTop: "1rem" }}>
            <h3>Adopción (30 días)</h3>
            <p className="lead">
              {adoption.totals.sessions} sesiones · {adoption.totals.featuresUsed} pantallas ·{" "}
              {adoption.totals.totalMinutes} min totales
            </p>
            <ul>
              {(adoption.byFeature || []).slice(0, 6).map((row) => (
                <li key={row.feature}>
                  <strong>{row.feature}</strong>: {row.sessions} visitas, ~{row.avgSeconds}s media
                  {row.bounceRatePct > 0 ? ` · ${row.bounceRatePct}% abandono rápido` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {portal ? (
          <div className="card" style={{ marginTop: "1rem" }}>
            <h3>Portal cliente</h3>
            <label className="mockup-field">
              <span>Subdominio / slug público</span>
              <input
                value={portal.subdomain || session?.business?.slug || ""}
                onChange={(ev) => setPortal((p) => ({ ...p, subdomain: ev.target.value }))}
              />
            </label>
            <p>
              URL:{" "}
              <a href={`/portal/${portal.subdomain || session?.business?.slug}`} target="_blank" rel="noreferrer">
                /portal/{portal.subdomain || session?.business?.slug}
              </a>
            </p>
            <button
              type="button"
              className="btn btn-outline"
              onClick={async () => {
                await dakinisTenantPatchPortalSettings(session, {
                  enabled: true,
                  subdomain: portal.subdomain || session?.business?.slug,
                  features: portal.suggestedFeatures || portal.features
                });
                setMsg("Portal activado");
              }}
            >
              Activar portal
            </button>
          </div>
        ) : null}

        <div className="card" style={{ marginTop: "1rem" }}>
          <h3>Marketplace (1 clic)</h3>
          <div className="pill-grid">
            {["crm", "whatsapp", "inventario", "analytics", "ia"].map((mod) => (
              <button
                key={mod}
                type="button"
                className="btn btn-outline"
                onClick={async () => {
                  await dakinisTenantMarketplaceInstall(session, mod);
                  setMsg(`Módulo ${mod} instalado`);
                }}
              >
                Instalar {mod}
              </button>
            ))}
          </div>
        </div>

        {branches.length ? (
          <div className="card" style={{ marginTop: "1rem" }}>
            <h3>Sucursales</h3>
            <ul>
              {branches.map((b) => (
                <li key={b.id}>
                  {b.name} ({b.slug}){b.isDefault ? " — principal" : ""}
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn-outline" onClick={refreshBranches}>
              Actualizar
            </button>
          </div>
        ) : null}

        {session?.business?.type === "restaurante" ? (
          <div className="card" style={{ marginTop: "1rem" }}>
            <h3>{t("app.settings.restaurantBlock")}</h3>
            <p className="lead">
              {t("app.settings.restaurantLead")}{" "}
              <button type="button" className="btn btn-outline" onClick={() => navigate("/sistema/restaurante")}>
                {t("app.settings.restaurantLink")}
              </button>
              .
            </p>
            {allergiesUrl ? (
              <p>
                <strong>{t("app.settings.publicAllergies")}</strong>{" "}
                <a href={allergiesUrl} target="_blank" rel="noreferrer">
                  {allergiesUrl}
                </a>
              </p>
            ) : null}
          </div>
        ) : null}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/dashboard")}>
            {t("appNav.app")}
          </button>
          <button type="button" className="btn" onClick={() => signOut()}>
            {t("app.settings.logout")}
          </button>
        </div>
      </div>
    </section>
  );
}
