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
  const [editTypeSelect, setEditTypeSelect] = useState("clinica");
  const [editTypeCustom, setEditTypeCustom] = useState("");

  const tenantUsersOnly = useMemo(
    () => users.filter((u) => u.role !== "platform_admin"),
    [users]
  );

  const load = useCallback(async (signal) => {
    if (!session?.token || session.user?.role !== "platform_admin") return;
    setError("");
    try {
      const [bJson, uJson] = await Promise.all([
        dakinisBearerJsonFetch("/api/platform/businesses", session.token, { signal }),
        dakinisBearerJsonFetch("/api/platform/users", session.token, { signal })
      ]);
      setBusinesses(bJson?.data?.businesses || []);
      setUsers(uJson?.data?.users || []);
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
      if (ownerEmail || ownerPassword) {
        body.ownerEmail = ownerEmail;
        body.ownerPassword = ownerPassword;
      }
      await dakinisBearerJsonFetch("/api/platform/businesses", session.token, {
        method: "POST",
        body
      });
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
            Opcional: crear ya el <strong>primer administrador</strong> del negocio (luego podrá añadir miembros desde el
            panel del sistema).
          </p>
          <label className="mockup-field">
            <span>Email administrador</span>
            <input
              type="email"
              value={createForm.ownerEmail}
              onChange={(ev) => setCreateForm((p) => ({ ...p, ownerEmail: ev.target.value }))}
              autoComplete="off"
              placeholder="vacío si ya gestionas usuarios después"
            />
          </label>
          <label className="mockup-field">
            <span>Contraseña inicial</span>
            <PasswordInput
              value={createForm.ownerPassword}
              onChange={(ev) => setCreateForm((p) => ({ ...p, ownerPassword: ev.target.value }))}
              autoComplete="new-password"
              placeholder="mín. 8 caracteres si indicas email"
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
                  <td>{b.plan}</td>
                  <td>
                    <button type="button" className="btn btn-outline" onClick={() => startEdit(b)} disabled={!!editingId}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <PlatformCatalogPanel />

        <h3 style={{ marginTop: "1.5rem" }}>Usuarios</h3>
        <article className="card" style={{ overflow: "auto" }}>
          <table className="mockup-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Rol</th>
                <th>Negocio</th>
                <th>Tipo negocio</th>
              </tr>
            </thead>
            <tbody>
              {tenantUsersOnly.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    {u.business_name} <code>({u.business_slug})</code>
                  </td>
                  <td>{dakinisFormatBusinessTypeLabel(u.business_type)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </div>
    </section>
  );
}
