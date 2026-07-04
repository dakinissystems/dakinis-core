import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "../context/LocaleContext.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import {
  dakinisFormatBusinessTypeLabel,
  dakinisNormalizeBusinessTypeKey
} from "@dakinis/shared/catalog/business-type-display.js";
import {
  dakinisGetIndustryTemplate,
  dakinisGetIndustryTemplateCatalog
} from "@dakinis/shared/catalog/business-templates.js";
import { dakinisBearerJsonFetch } from "../services/api.js";
import PlatformCatalogPanel from "../components/PlatformCatalogPanel.jsx";
import PlatformHubAccessPanel from "../components/PlatformHubAccessPanel.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

const DAKINIS_TYPE_OTHER = "__other__";

const DAKINIS_SAAS_PLAN_OPTIONS = [
  { value: "starter", label: "Starter (agenda, reservas, dashboard)" },
  { value: "growth", label: "Growth (+ CRM, leads)" },
  { value: "pro", label: "Pro (+ WhatsApp API en rutas /api/whatsapp/*)" }
];

export default function PlatformAdminPage({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();

  const typeSelectOptions = useMemo(() => {
    const catalog = dakinisGetIndustryTemplateCatalog();
    return catalog.map((item) => ({
      value: item.key,
      label: item.label,
      market: item.market,
      featureLabels: item.featureLabels
    }));
  }, []);

  const verticalKeys = useMemo(() => typeSelectOptions.map((o) => o.value), [typeSelectOptions]);

  const [createForm, setCreateForm] = useState(() => ({
    name: "",
    slug: "",
    typeSelect: "clinica",
    typeCustom: "",
    plan: "starter",
    ownerEmail: "",
    ownerPassword: ""
  }));

  const createOnboardingPreview = useMemo(() => {
    const key =
      createForm.typeSelect === DAKINIS_TYPE_OTHER
        ? dakinisNormalizeBusinessTypeKey(createForm.typeCustom)
        : createForm.typeSelect;
    return key ? dakinisGetIndustryTemplate(key) : null;
  }, [createForm.typeSelect, createForm.typeCustom]);
  const vistaMockupOptions = useMemo(() => {
    const reg = dakinisGetSystemRegistry();
    return Object.keys(reg).map((k) => ({
      value: k,
      label: dakinisFormatBusinessTypeLabel(k)
    }));
  }, []);

  const typeSelectOptionsCreate = useMemo(
    () => [...typeSelectOptions, { value: DAKINIS_TYPE_OTHER, label: t("admin.other") }],
    [typeSelectOptions, t]
  );

  const typeSelectOptionsEdit = useMemo(
    () => [
      ...typeSelectOptions,
      { value: "platform", label: dakinisFormatBusinessTypeLabel("platform") },
      { value: DAKINIS_TYPE_OTHER, label: t("admin.other") }
    ],
    [typeSelectOptions, t]
  );

  const [businesses, setBusinesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    plan: ""
  });
  const [editHubProducts, setEditHubProducts] = useState(["core"]);
  const [editTypeSelect, setEditTypeSelect] = useState("clinica");
  const [editTypeCustom, setEditTypeCustom] = useState("");
  const [pilotTelemetry, setPilotTelemetry] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserEmail, setEditUserEmail] = useState("");
  const [userActionMsg, setUserActionMsg] = useState("");

  const [accessActionId, setAccessActionId] = useState(null);
  const [accessForm, setAccessForm] = useState({ action: "suspend", reason: "admin_other", note: "" });

  const DAKINIS_ACCESS_REASONS = useMemo(
    () => [
      { value: "admin_legal", label: t("admin.access.reasonLegal") },
      { value: "admin_abuse", label: t("admin.access.reasonAbuse") },
      { value: "admin_fraud", label: t("admin.access.reasonFraud") },
      { value: "admin_contract", label: t("admin.access.reasonContract") },
      { value: "admin_other", label: t("admin.access.reasonOther") }
    ],
    [t]
  );

  function accessStateLabel(state) {
    const key = state || "active";
    const labels = {
      active: t("admin.access.state.active"),
      degraded: t("admin.access.state.degraded"),
      suspended: t("admin.access.state.suspended"),
      closed: t("admin.access.state.closed")
    };
    return labels[key] || key;
  }

  async function submitAccessAction(businessId) {
    if (!session?.token || !businessId) return;
    const confirmMsg =
      accessForm.action === "close"
        ? t("admin.access.confirmClose")
        : accessForm.action === "suspend"
          ? t("admin.access.confirmSuspend")
          : t("admin.access.confirmReactivate");
    if (!window.confirm(confirmMsg)) return;
    setSaving(true);
    setError("");
    try {
      await dakinisBearerJsonFetch(`/api/platform/businesses/${encodeURIComponent(businessId)}/access`, session.token, {
        method: "PATCH",
        body: accessForm
      });
      setAccessActionId(null);
      setAccessForm({ action: "suspend", reason: "admin_other", note: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.access.error"));
    } finally {
      setSaving(false);
    }
  }

  const tenantUsersOnly = useMemo(
    () => users.filter((u) => u.role !== "platform_admin"),
    [users]
  );

  const load = useCallback(async (signal) => {
    if (!session?.token || session.user?.role !== "platform_admin") return;
    setError("");
    try {
      const [bJson, uJson, telJson] = await Promise.all([
        dakinisBearerJsonFetch("/api/platform/businesses", session.token, { signal }),
        dakinisBearerJsonFetch("/api/platform/users", session.token, { signal }),
        dakinisBearerJsonFetch("/api/platform/telemetry/summary?days=30", session.token, { signal }).catch(
          () => ({ data: { telemetry: { tenants: [] } } })
        )
      ]);
      setBusinesses(bJson?.data?.businesses || []);
      setUsers(uJson?.data?.users || []);
      setPilotTelemetry(telJson?.data?.telemetry?.tenants || []);
    } catch (e) {
      if (e?.name === "AbortError") return;
      setError(e instanceof Error ? e.message : t("admin.loadError"));
    } finally {
      setLoading(false);
    }
  }, [session?.token, session?.user?.role]);

  useEffect(() => {
    if (!session?.token || session.user?.role !== "platform_admin") {
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [session?.token, session?.user?.role, load]);

  function startEdit(b) {
    setEditingId(b.id);
    const p = String(b.plan || "")
      .trim()
      .toLowerCase();
    const planSelect =
      p === "growth" || p === "pro" ? p : p === "advanced" || p === "enterprise" ? "pro" : "starter";
    setEditForm({
      name: b.name,
      slug: b.slug,
      plan: planSelect
    });
    setEditHubProducts(Array.isArray(b.hubProducts) && b.hubProducts.length ? b.hubProducts : ["core"]);
    const preset = new Set([...verticalKeys, "platform"]);
    if (preset.has(b.type)) {
      setEditTypeSelect(b.type);
      setEditTypeCustom("");
    } else {
      setEditTypeSelect(DAKINIS_TYPE_OTHER);
      setEditTypeCustom(b.type);
    }
  }

  async function submitCreate(e) {
    e.preventDefault();
    if (!session?.token) return;
    const type =
      createForm.typeSelect === DAKINIS_TYPE_OTHER
        ? dakinisNormalizeBusinessTypeKey(createForm.typeCustom)
        : createForm.typeSelect;
    if (createForm.typeSelect === DAKINIS_TYPE_OTHER && !type) {
      setError(t("admin.typeCustomRequired"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      const ownerEmail = createForm.ownerEmail.trim().toLowerCase();
      const ownerPassword = createForm.ownerPassword;
      const body = {
        name: createForm.name.trim(),
        slug: createForm.slug.trim().toLowerCase(),
        type,
        plan: createForm.plan.trim() || "starter"
      };
      if (ownerEmail) {
        body.ownerEmail = ownerEmail;
        if (ownerPassword) body.ownerPassword = ownerPassword;
      }
      const created = await dakinisBearerJsonFetch("/api/platform/businesses", session.token, {
        method: "POST",
        body
      });
      const delivery = created?.data?.credentialsDelivery;
      if (delivery) {
        if (delivery.emailSent) {
          setUserActionMsg(t("admin.credentialsEmailed", { email: delivery.email }));
        } else if (delivery.tempPassword) {
          setUserActionMsg(
            t("admin.credentialsManual", {
              email: delivery.email,
              password: delivery.tempPassword,
              url: delivery.resetUrl || ""
            })
          );
        }
      }
      setCreateForm((prev) => ({
        ...prev,
        name: "",
        slug: "",
        typeCustom: "",
        ownerEmail: "",
        ownerPassword: ""
      }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.createError"));
    } finally {
      setSaving(false);
    }
  }

  async function submitEdit(e) {
    e.preventDefault();
    if (!session?.token || !editingId) return;
    const type =
      editTypeSelect === DAKINIS_TYPE_OTHER
        ? dakinisNormalizeBusinessTypeKey(editTypeCustom)
        : editTypeSelect;
    if (editTypeSelect === DAKINIS_TYPE_OTHER && !type) {
      setError(t("admin.typeCustomEditRequired"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      await dakinisBearerJsonFetch(`/api/platform/businesses/${encodeURIComponent(editingId)}`, session.token, {
        method: "PATCH",
        body: {
          name: editForm.name.trim(),
          slug: editForm.slug.trim().toLowerCase(),
          type,
          plan: editForm.plan.trim()
        }
      });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.saveError"));
    } finally {
      setSaving(false);
    }
  }

  if (!session?.token || session.user?.role !== "platform_admin") {
    return (
      <section className="modules">
        <div className="container">
          <p className="lead">{t("admin.restricted")}</p>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/login")}>
            {t("admin.goLogin")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="modules">
      <div className="container">
        <p className="kicker">{t("admin.kicker")}</p>
        <h2>{t("admin.title")}</h2>
        <p className="lead">{t("admin.lead")}</p>
        <button type="button" className="btn btn-outline" style={{ marginBottom: "1rem" }} onClick={() => navigate("/")}>
          {t("admin.backHome")}
        </button>

        <h3 style={{ marginTop: "0.25rem" }}>{t("admin.mockupsTitle")}</h3>
        <p className="lead">{t("admin.mockupsLead")}</p>
        <div className="system-switcher" style={{ marginBottom: "1.25rem" }}>
          {vistaMockupOptions.map((o) => (
            <button
              key={`vista-${o.value}`}
              type="button"
              className="system-btn"
              onClick={() => navigate(`/vista/${encodeURIComponent(o.value)}`)}
            >
              {t("admin.vistaButton", { label: o.label })}
            </button>
          ))}
        </div>

        {loading ? <p className="lead">Cargando…</p> : null}
        {error ? (
          <p className="lead" style={{ color: "#f97316" }}>
            {error}
          </p>
        ) : null}

        <h3>Crear negocio</h3>
        <form className="mockup-form card" onSubmit={submitCreate} style={{ gridTemplateColumns: "1fr 1fr" }}>
          <label className="mockup-field">
            <span>Nombre</span>
            <input
              value={createForm.name}
              onChange={(ev) => setCreateForm((p) => ({ ...p, name: ev.target.value }))}
              required
            />
          </label>
          <label className="mockup-field">
            <span>Slug (único, ej. mi-clinica)</span>
            <input
              value={createForm.slug}
              onChange={(ev) => setCreateForm((p) => ({ ...p, slug: ev.target.value }))}
              required
            />
          </label>
          <label className="mockup-field">
            <span>Tipo</span>
            <select
              value={createForm.typeSelect}
              onChange={(ev) =>
                setCreateForm((p) => ({
                  ...p,
                  typeSelect: ev.target.value,
                  typeCustom: ev.target.value === DAKINIS_TYPE_OTHER ? p.typeCustom : ""
                }))
              }
            >
              {typeSelectOptionsCreate.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="mockup-field">
            <span>Plan</span>
            <select
              value={createForm.plan}
              onChange={(ev) => setCreateForm((p) => ({ ...p, plan: ev.target.value }))}
            >
              {DAKINIS_SAAS_PLAN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          {createForm.typeSelect === DAKINIS_TYPE_OTHER ? (
            <label className="mockup-field" style={{ gridColumn: "1 / -1" }}>
              <span>Nuevo tipo (identificador)</span>
              <input
                value={createForm.typeCustom}
                onChange={(ev) => setCreateForm((p) => ({ ...p, typeCustom: ev.target.value }))}
                placeholder="ej. gimnasio-centro"
                autoComplete="off"
              />
            </label>
          ) : null}
          {createOnboardingPreview ? (
            <div className="card" style={{ gridColumn: "1 / -1", marginTop: "0.5rem" }}>
              <h4 style={{ marginTop: 0 }}>Onboarding: {createOnboardingPreview.onboardingTitle}</h4>
              <p className="lead" style={{ marginBottom: "0.5rem" }}>
                {createOnboardingPreview.market} — se activará automáticamente:
              </p>
              <ul>
                {createOnboardingPreview.featureLabels.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="lead" style={{ gridColumn: "1 / -1", margin: 0 }}>
            {t("admin.ownerHint")}
          </p>
          <label className="mockup-field">
            <span>{t("admin.ownerEmail")}</span>
            <input
              type="email"
              value={createForm.ownerEmail}
              onChange={(ev) => setCreateForm((p) => ({ ...p, ownerEmail: ev.target.value }))}
              autoComplete="off"
              placeholder={t("admin.ownerEmailPlaceholder")}
            />
          </label>
          <label className="mockup-field">
            <span>{t("admin.ownerPasswordOptional")}</span>
            <PasswordInput
              value={createForm.ownerPassword}
              onChange={(ev) => setCreateForm((p) => ({ ...p, ownerPassword: ev.target.value }))}
              autoComplete="new-password"
              placeholder={t("admin.ownerPasswordPlaceholder")}
            />
          </label>
          <button type="submit" className="btn" disabled={saving} style={{ gridColumn: "1 / -1" }}>
            {saving ? "Guardando…" : "Crear negocio"}
          </button>
        </form>

        <h3 style={{ marginTop: "1.5rem" }}>Negocios</h3>
        <article className="card" style={{ overflow: "auto" }}>
          {editingId ? (
            <form className="mockup-form card" onSubmit={submitEdit} style={{ marginBottom: "1rem" }}>
              <h4>Editar negocio</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <label className="mockup-field">
                  <span>Nombre</span>
                  <input
                    value={editForm.name}
                    onChange={(ev) => setEditForm((p) => ({ ...p, name: ev.target.value }))}
                    required
                  />
                </label>
                <label className="mockup-field">
                  <span>Slug</span>
                  <input
                    value={editForm.slug}
                    onChange={(ev) => setEditForm((p) => ({ ...p, slug: ev.target.value }))}
                    required
                  />
                </label>
                <label className="mockup-field">
                  <span>Tipo</span>
                  <select
                    value={editTypeSelect}
                    onChange={(ev) => {
                      const v = ev.target.value;
                      setEditTypeSelect(v);
                      if (v !== DAKINIS_TYPE_OTHER) {
                        setEditTypeCustom("");
                      }
                    }}
                  >
                    {typeSelectOptionsEdit.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                {editTypeSelect === DAKINIS_TYPE_OTHER ? (
                  <label className="mockup-field">
                    <span>Tipo personalizado</span>
                    <input
                      value={editTypeCustom}
                      onChange={(ev) => setEditTypeCustom(ev.target.value)}
                      placeholder="identificador en minusculas"
                      autoComplete="off"
                    />
                  </label>
                ) : (
                  <label className="mockup-field">
                    <span>Plan</span>
                    <select
                      value={editForm.plan}
                      onChange={(ev) => setEditForm((p) => ({ ...p, plan: ev.target.value }))}
                      required
                    >
                      {DAKINIS_SAAS_PLAN_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {editTypeSelect === DAKINIS_TYPE_OTHER ? (
                  <label className="mockup-field" style={{ gridColumn: "1 / -1" }}>
                    <span>Plan</span>
                    <select
                      value={editForm.plan}
                      onChange={(ev) => setEditForm((p) => ({ ...p, plan: ev.target.value }))}
                      required
                    >
                      {DAKINIS_SAAS_PLAN_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
              {editingId && businesses.find((b) => b.id === editingId) ? (
                <PlatformHubAccessPanel
                  businessId={editingId}
                  businessSlug={editForm.slug}
                  initialProducts={editHubProducts}
                  onSaved={load}
                />
              ) : null}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button type="submit" className="btn" disabled={saving}>
                  Guardar cambios
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditingId(null)}
                  disabled={saving}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : null}
          <table className="mockup-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Tipo</th>
                <th>Plan</th>
                <th>{t("admin.access.column")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {businesses.map((b) => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td>
                    <code>{b.slug}</code>
                  </td>
                  <td>{dakinisFormatBusinessTypeLabel(b.type)}</td>
                  <td>
                    {b.plan}
                    {b.entitled_plan && b.entitled_plan !== b.plan ? (
                      <span className="admin-access-hint"> → {b.entitled_plan}</span>
                    ) : null}
                  </td>
                  <td>
                    <span className={`admin-access-badge admin-access-badge--${b.access_state || "active"}`}>
                      {accessStateLabel(b.access_state)}
                    </span>
                    {b.access_reason ? (
                      <span className="admin-access-hint"> ({b.access_reason})</span>
                    ) : null}
                  </td>
                  <td>
                    <div className="admin-access-actions">
                      <button type="button" className="btn btn-outline" onClick={() => startEdit(b)} disabled={!!editingId}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => {
                          setAccessActionId(b.id);
                          setAccessForm({
                            action: b.access_state === "suspended" ? "reactivate" : "suspend",
                            reason: "admin_other",
                            note: ""
                          });
                        }}
                        disabled={b.type === "platform" || !!editingId}
                      >
                        {t("admin.access.manage")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {accessActionId ? (
            <form
              className="card admin-access-form"
              onSubmit={(e) => {
                e.preventDefault();
                submitAccessAction(accessActionId);
              }}
            >
              <h4>{t("admin.access.formTitle")}</h4>
              <label className="mockup-field">
                <span>{t("admin.access.action")}</span>
                <select
                  value={accessForm.action}
                  onChange={(ev) => setAccessForm((p) => ({ ...p, action: ev.target.value }))}
                >
                  <option value="suspend">{t("admin.access.actionSuspend")}</option>
                  <option value="reactivate">{t("admin.access.actionReactivate")}</option>
                  <option value="close">{t("admin.access.actionClose")}</option>
                </select>
              </label>
              <label className="mockup-field">
                <span>{t("admin.access.reason")}</span>
                <select
                  value={accessForm.reason}
                  onChange={(ev) => setAccessForm((p) => ({ ...p, reason: ev.target.value }))}
                >
                  {DAKINIS_ACCESS_REASONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mockup-field">
                <span>{t("admin.access.note")}</span>
                <textarea
                  value={accessForm.note}
                  onChange={(ev) => setAccessForm((p) => ({ ...p, note: ev.target.value }))}
                  rows={3}
                  placeholder={t("admin.access.notePlaceholder")}
                />
              </label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button type="submit" className="btn" disabled={saving}>
                  {t("admin.access.apply")}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setAccessActionId(null)} disabled={saving}>
                  {t("admin.cancel")}
                </button>
              </div>
            </form>
          ) : null}
        </article>

        <PlatformCatalogPanel />

        <h3 style={{ marginTop: "1.5rem" }}>Pilotos — telemetría (30 días)</h3>
        <article className="card" style={{ overflow: "auto" }}>
          {pilotTelemetry.length === 0 ? (
            <p className="lead">Sin datos de adopción aún. Los tenants generan telemetría al usar /app/*.</p>
          ) : (
            <table className="mockup-table">
              <thead>
                <tr>
                  <th>Negocio</th>
                  <th>Tipo</th>
                  <th>Sesiones</th>
                  <th>Minutos</th>
                  <th>Eventos valor</th>
                  <th>Top adopción</th>
                  <th>Top valor</th>
                </tr>
              </thead>
              <tbody>
                {pilotTelemetry.map((row) => (
                  <tr key={row.businessId}>
                    <td>
                      {row.name} <code>{row.slug}</code>
                    </td>
                    <td>{dakinisFormatBusinessTypeLabel(row.type)}</td>
                    <td>{row.sessions}</td>
                    <td>{row.totalMinutes}</td>
                    <td>{row.valueEvents}</td>
                    <td>
                      {(row.topAdoption || [])
                        .map((a) => `${a.label} ${a.scorePct}%`)
                        .join(" · ") || "—"}
                    </td>
                    <td>
                      {(row.topValue || [])
                        .map((v) => `${v.label} ${v.scorePct}%`)
                        .join(" · ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>

        {userActionMsg ? (
          <p className="lead" style={{ color: "#5eead4", marginTop: "1rem" }}>
            {userActionMsg}
          </p>
        ) : null}

        <h3 style={{ marginTop: "1.5rem" }}>{t("admin.usersTitle")}</h3>
        <article className="card" style={{ overflow: "auto" }}>
          <table className="mockup-table">
            <thead>
              <tr>
                <th>{t("admin.userEmail")}</th>
                <th>{t("admin.userRole")}</th>
                <th>{t("admin.userBusiness")}</th>
                <th>{t("admin.userType")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tenantUsersOnly.map((u) => (
                <tr key={u.id}>
                  <td>
                    {editingUserId === u.id ? (
                      <input
                        type="email"
                        value={editUserEmail}
                        onChange={(ev) => setEditUserEmail(ev.target.value)}
                        style={{ minWidth: "12rem" }}
                      />
                    ) : (
                      u.email
                    )}
                  </td>
                  <td>{u.role}</td>
                  <td>
                    {u.business_name} <code>({u.business_slug})</code>
                  </td>
                  <td>{dakinisFormatBusinessTypeLabel(u.business_type)}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                      {editingUserId === u.id ? (
                        <>
                          <button
                            type="button"
                            className="btn"
                            disabled={saving}
                            onClick={async () => {
                              setSaving(true);
                              setUserActionMsg("");
                              try {
                                await dakinisBearerJsonFetch(
                                  `/api/platform/users/${encodeURIComponent(u.id)}`,
                                  session.token,
                                  { method: "PATCH", body: { email: editUserEmail.trim().toLowerCase() } }
                                );
                                setEditingUserId(null);
                                setUserActionMsg(t("admin.userEmailSaved"));
                                await load();
                              } catch (err) {
                                setError(err instanceof Error ? err.message : t("admin.saveError"));
                              } finally {
                                setSaving(false);
                              }
                            }}
                          >
                            {t("admin.saveEmail")}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setEditingUserId(null)}
                          >
                            {t("admin.cancel")}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => {
                              setEditingUserId(u.id);
                              setEditUserEmail(u.email);
                            }}
                          >
                            {t("admin.editEmail")}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            disabled={saving}
                            onClick={async () => {
                              setSaving(true);
                              setUserActionMsg("");
                              try {
                                const res = await dakinisBearerJsonFetch(
                                  `/api/platform/users/${encodeURIComponent(u.id)}/resend-password-reset`,
                                  session.token,
                                  { method: "POST" }
                                );
                                const d = res?.data;
                                if (d?.emailSent) {
                                  setUserActionMsg(t("admin.resetEmailed", { email: d.email }));
                                } else {
                                  setUserActionMsg(
                                    t("admin.resetManual", {
                                      email: d?.email || u.email,
                                      url: d?.resetUrl || ""
                                    })
                                  );
                                }
                              } catch (err) {
                                setError(err instanceof Error ? err.message : t("admin.resetError"));
                              } finally {
                                setSaving(false);
                              }
                            }}
                          >
                            {t("admin.resendReset")}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </div>
    </section>
  );
}
