import { useCallback, useEffect, useMemo, useState } from "react";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import { dakinisBearerJsonFetch } from "../services/api.js";

export default function PlatformAdminPage({ navigate }) {
  const { session } = useDakinisSession();
  const verticalOptions = useMemo(() => Object.keys(dakinisGetSystemRegistry()), []);
  const platformTypes = useMemo(
    () => [...verticalOptions, "platform"],
    [verticalOptions]
  );

  const [businesses, setBusinesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [createForm, setCreateForm] = useState(() => ({
    name: "",
    slug: "",
    type: verticalOptions[0] || "clinica",
    plan: "starter"
  }));

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    type: "",
    plan: ""
  });

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
      setError(e instanceof Error ? e.message : "Error al cargar datos");
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
    setEditForm({
      name: b.name,
      slug: b.slug,
      type: b.type,
      plan: b.plan
    });
  }

  async function submitCreate(e) {
    e.preventDefault();
    if (!session?.token) return;
    setSaving(true);
    setError("");
    try {
      await dakinisBearerJsonFetch("/api/platform/businesses", session.token, {
        method: "POST",
        body: {
          name: createForm.name.trim(),
          slug: createForm.slug.trim().toLowerCase(),
          type: createForm.type,
          plan: createForm.plan.trim() || "starter"
        }
      });
      setCreateForm((prev) => ({
        ...prev,
        name: "",
        slug: ""
      }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el negocio");
    } finally {
      setSaving(false);
    }
  }

  async function submitEdit(e) {
    e.preventDefault();
    if (!session?.token || !editingId) return;
    setSaving(true);
    setError("");
    try {
      await dakinisBearerJsonFetch(`/api/platform/businesses/${encodeURIComponent(editingId)}`, session.token, {
        method: "PATCH",
        body: {
          name: editForm.name.trim(),
          slug: editForm.slug.trim().toLowerCase(),
          type: editForm.type,
          plan: editForm.plan.trim()
        }
      });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  if (!session?.token || session.user?.role !== "platform_admin") {
    return (
      <section className="modules">
        <div className="container">
          <p className="lead">Acceso restringido a administradores de plataforma.</p>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/login")}>
            Ir al login
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="modules">
      <div className="container">
        <p className="kicker">Plataforma</p>
        <h2>Administración multi-tenant</h2>
        <p className="lead">
          Entra con <code className="config-box">admin@dakinis-platform.local</code> y la contraseña del seed (por
          defecto <code className="config-box">demo123</code>). Si el servidor define{" "}
          <code>DAKINIS_PLATFORM_TOTP_SECRET</code>, añade el código TOTP en el login. Abre{" "}
          <code className="config-box">/admin</code> o el botón <strong>Panel plataforma</strong> en la barra superior.
        </p>
        <button type="button" className="btn btn-outline" style={{ marginBottom: "1rem" }} onClick={() => navigate("/")}>
          Volver al inicio
        </button>

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
              value={createForm.type}
              onChange={(ev) => setCreateForm((p) => ({ ...p, type: ev.target.value }))}
            >
              {verticalOptions.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label className="mockup-field">
            <span>Plan</span>
            <input
              value={createForm.plan}
              onChange={(ev) => setCreateForm((p) => ({ ...p, plan: ev.target.value }))}
              placeholder="starter"
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
                    value={editForm.type}
                    onChange={(ev) => setEditForm((p) => ({ ...p, type: ev.target.value }))}
                  >
                    {platformTypes.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mockup-field">
                  <span>Plan</span>
                  <input
                    value={editForm.plan}
                    onChange={(ev) => setEditForm((p) => ({ ...p, plan: ev.target.value }))}
                    required
                  />
                </label>
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
                  <td>{b.type}</td>
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
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    {u.business_name} <code>({u.business_slug})</code>
                  </td>
                  <td>{u.business_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </div>
    </section>
  );
}
