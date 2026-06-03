import { useCallback, useEffect, useState } from "react";
import { dakinisTenantJsonFetch } from "../services/api.js";

function dakinisRoleLabel(role) {
  if (role === "admin") return "Administrador";
  if (role === "member") return "Miembro";
  return role;
}

export default function TenantTeamSection({
  session,
  apiSession,
  tenantSlugForVertical,
  activeSystemKey
}) {
  const canManage = Boolean(apiSession?.token) && session?.user?.role === "admin";

  const [teamUsers, setTeamUsers] = useState([]);
  const [teamError, setTeamError] = useState("");
  const [teamLoading, setTeamLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("member");
  const [saving, setSaving] = useState(false);

  const loadTeam = useCallback(
    async (signal) => {
      if (!canManage) return;
      setTeamLoading(true);
      setTeamError("");
      try {
        const json = await dakinisTenantJsonFetch("/api/tenant/users", apiSession, {
          signal,
          businessId: tenantSlugForVertical,
          businessTypeHeader: activeSystemKey
        });
        setTeamUsers(json?.data?.users || []);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setTeamError(e instanceof Error ? e.message : "No se pudieron cargar los usuarios");
        setTeamUsers([]);
      } finally {
        setTeamLoading(false);
      }
    },
    [canManage, apiSession, tenantSlugForVertical, activeSystemKey]
  );

  useEffect(() => {
    if (!canManage) return;
    const ctrl = new AbortController();
    loadTeam(ctrl.signal);
    return () => ctrl.abort();
  }, [canManage, loadTeam]);

  async function handleCreateUser(e) {
    e.preventDefault();
    if (!canManage) return;
    setSaving(true);
    setTeamError("");
    try {
      await dakinisTenantJsonFetch("/api/tenant/users", apiSession, {
        method: "POST",
        businessId: tenantSlugForVertical,
        businessTypeHeader: activeSystemKey,
        body: {
          email: newEmail.trim().toLowerCase(),
          password: newPassword,
          role: newRole
        }
      });
      setNewEmail("");
      setNewPassword("");
      setNewRole("member");
      await loadTeam();
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : "No se pudo crear el usuario");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateRole(userId, role) {
    if (!canManage) return;
    setSaving(true);
    setTeamError("");
    try {
      await dakinisTenantJsonFetch(`/api/tenant/users/${encodeURIComponent(userId)}`, apiSession, {
        method: "PATCH",
        businessId: tenantSlugForVertical,
        businessTypeHeader: activeSystemKey,
        body: { role }
      });
      await loadTeam();
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : "No se pudo actualizar");
    } finally {
      setSaving(false);
    }
  }

  if (!canManage) {
    return null;
  }

  return (
    <section style={{ marginTop: "2rem" }}>
      <h3>Equipo y usuarios del negocio</h3>
      <p className="lead">
        Como administrador puedes ver a tu equipo y dar de alta cuentas adicionales (miembros u otros
        administradores). Solo sesión con contraseña (JWT), no API key.
      </p>

      {teamLoading ? <p className="lead">Cargando usuarios…</p> : null}
      {teamError ? (
        <p className="lead" style={{ color: "#fdba74" }}>
          {teamError}
        </p>
      ) : null}

      <form className="mockup-form card tenant-team-form" onSubmit={handleCreateUser}>
        <h4 style={{ gridColumn: "1 / -1", margin: 0 }}>
          Invitar o crear usuario
        </h4>
        <label className="mockup-field">
          <span>Email</span>
          <input
            type="email"
            value={newEmail}
            onChange={(ev) => setNewEmail(ev.target.value)}
            autoComplete="off"
            required
          />
        </label>
        <label className="mockup-field">
          <span>Contraseña inicial (mín. 8 caracteres)</span>
          <input
            type="password"
            value={newPassword}
            onChange={(ev) => setNewPassword(ev.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
          />
        </label>
        <label className="mockup-field">
          <span>Rol</span>
          <select value={newRole} onChange={(ev) => setNewRole(ev.target.value)}>
            <option value="member">Miembro</option>
            <option value="admin">Administrador</option>
          </select>
        </label>
        <div style={{ gridColumn: "1 / -1" }}>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Guardando…" : "Crear usuario"}
          </button>
        </div>
      </form>

      <h4 style={{ marginTop: "1.25rem" }}>Usuarios del negocio</h4>
      <article className="card mockup-table-card">
        <table className="mockup-table" data-stack="responsive">
          <thead>
            <tr>
              <th>Email</th>
              <th>Rol</th>
              <th>Cambiar rol</th>
            </tr>
          </thead>
          <tbody>
            {teamUsers.map((u) => (
              <tr key={u.id}>
                <td data-label="Email">{u.email}</td>
                <td data-label="Rol">{dakinisRoleLabel(u.role)}</td>
                <td data-label="Cambiar rol">
                  <select
                    aria-label={`Rol de ${u.email}`}
                    value={u.role}
                    disabled={saving}
                    onChange={(ev) => {
                      const next = ev.target.value;
                      if (next !== u.role) {
                        handleUpdateRole(u.id, next);
                      }
                    }}
                  >
                    <option value="admin">Administrador</option>
                    <option value="member">Miembro</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
