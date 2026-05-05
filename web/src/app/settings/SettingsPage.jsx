import { useDakinisSession } from "../../context/SessionContext.jsx";

export default function SettingsPage({ navigate }) {
  const { session, logout } = useDakinisSession();

  return (
    <section className="modules">
      <div className="container">
        <h2>Settings</h2>
        <p className="lead">Sesión activa y contexto de tenant real.</p>
        <div className="card">
          <p>
            <strong>Usuario:</strong> {session?.user?.email || "-"}
          </p>
          <p>
            <strong>Rol:</strong> {session?.user?.role || "-"}
          </p>
          <p>
            <strong>Tenant:</strong> {session?.business?.slug || session?.business?.id || "-"}
          </p>
          <p>
            <strong>Tipo:</strong> {session?.business?.type || "-"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/dashboard")}>
            Dashboard
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </section>
  );
}
