import { useEffect, useState } from "react";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import { dakinisTenantJsonFetch } from "../../services/api.js";

export default function SettingsPage({ navigate }) {
  const { session, logout } = useDakinisSession();
  const [allergiesUrl, setAllergiesUrl] = useState("");

  useEffect(() => {
    if (session?.business?.type !== "restaurante" || !session?.token) return;
    dakinisTenantJsonFetch("/api/tenant/restaurant/kitchen", session)
      .then((json) => {
        const token = json?.data?.profile?.publicToken;
        if (token) setAllergiesUrl(`${window.location.origin}/alergenos/${token}`);
      })
      .catch(() => {});
  }, [session]);

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
        {session?.business?.type === "restaurante" ? (
          <div className="card" style={{ marginTop: "1rem" }}>
            <h3>Restaurante — alergias y stock</h3>
            <p className="lead">
              Edita alergias y el QR en{" "}
              <button type="button" className="btn btn-outline" onClick={() => navigate("/sistema/restaurante")}>
                Sistema restaurante
              </button>
              .
            </p>
            {allergiesUrl ? (
              <p>
                <a href={allergiesUrl} target="_blank" rel="noreferrer">
                  {allergiesUrl}
                </a>
              </p>
            ) : null}
          </div>
        ) : null}
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
