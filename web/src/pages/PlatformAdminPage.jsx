import { useEffect, useState } from "react";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisBearerJsonFetch } from "../services/api.js";

export default function PlatformAdminPage({ navigate }) {
  const { session } = useDakinisSession();
  const [businesses, setBusinesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.token || session.user?.role !== "platform_admin") {
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    async function load() {
      setError("");
      try {
        const [bJson, uJson] = await Promise.all([
          dakinisBearerJsonFetch("/api/platform/businesses", session.token, { signal: ctrl.signal }),
          dakinisBearerJsonFetch("/api/platform/users", session.token, { signal: ctrl.signal })
        ]);
        setBusinesses(bJson?.data?.businesses || []);
        setUsers(uJson?.data?.users || []);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => ctrl.abort();
  }, [session?.token, session?.user?.role]);

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
          Negocios demo y usuarios administradores asociados (solo lectura en este MVP).
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

        <h3>Negocios</h3>
        <article className="card" style={{ overflow: "auto" }}>
          <table className="mockup-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Tipo</th>
                <th>Plan</th>
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
