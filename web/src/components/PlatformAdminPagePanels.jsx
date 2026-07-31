import { dakinisFormatBusinessTypeLabel } from "@dakinis/shared/catalog/business-type-display.js";
import { dakinisBearerJsonFetch } from "../services/api.js";
import PlatformCatalogPanel from "./PlatformCatalogPanel.jsx";
import PlatformHubAccessPanel from "./PlatformHubAccessPanel.jsx";
import PasswordInput from "./PasswordInput.jsx";
import {
  DAKINIS_SAAS_PLAN_OPTIONS,
  DAKINIS_TYPE_OTHER
} from "../hooks/usePlatformAdminPage.js";

export function PlatformAdminCreateBusinessForm({
  t,
  createForm,
  setCreateForm,
  typeSelectOptionsCreate,
  createOnboardingPreview,
  saving,
  submitCreate
}) {
  return (
    <>
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
          <select value={createForm.plan} onChange={(ev) => setCreateForm((p) => ({ ...p, plan: ev.target.value }))}>
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
    </>
  );
}

export function PlatformAdminBusinessesPanel(props) {
  const {
    t,
    businesses,
    editingId,
    setEditingId,
    editForm,
    setEditForm,
    editHubProducts,
    editTypeSelect,
    setEditTypeSelect,
    editTypeCustom,
    setEditTypeCustom,
    typeSelectOptionsEdit,
    saving,
    submitEdit,
    load,
    accessStateLabel,
    startEdit,
    accessActionId,
    setAccessActionId,
    accessForm,
    setAccessForm,
    DAKINIS_ACCESS_REASONS,
    submitAccessAction
  } = props;

  return (
    <>
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
                    if (v !== DAKINIS_TYPE_OTHER) setEditTypeCustom("");
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
              <button type="button" className="btn btn-outline" onClick={() => setEditingId(null)} disabled={saving}>
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
              <th scope="col">{t("admin.access.column")}</th>
              <th scope="col" aria-label={t("admin.access.manage")} />
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
                  {b.access_reason ? <span className="admin-access-hint"> ({b.access_reason})</span> : null}
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
    </>
  );
}

export function PlatformAdminTelemetryPanel({ pilotTelemetry }) {
  return (
    <>
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
                  <td>{(row.topAdoption || []).map((a) => `${a.label} ${a.scorePct}%`).join(" · ") || "—"}</td>
                  <td>{(row.topValue || []).map((v) => `${v.label} ${v.scorePct}%`).join(" · ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>
    </>
  );
}

export function PlatformAdminUsersPanel({
  t,
  session,
  tenantUsersOnly,
  editingUserId,
  setEditingUserId,
  editUserEmail,
  setEditUserEmail,
  saving,
  setSaving,
  setUserActionMsg,
  setError,
  load,
  userActionMsg
}) {
  return (
    <>
      {userActionMsg ? (
        <p className="lead" style={{ color: "var(--dakinis-accent)", marginTop: "1rem" }}>
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
              <th scope="col">{t("admin.userType")}</th>
              <th scope="col" aria-label={t("admin.editEmail")} />
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
                      aria-label={t("admin.userEmail")}
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
                        <button type="button" className="btn btn-outline" onClick={() => setEditingUserId(null)}>
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
    </>
  );
}
