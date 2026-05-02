import { useMemo } from "react";
import { useDakinisSession } from "../context/SessionContext.jsx";

const logoGrande = "/Logo%20Grande.jpeg";

function dakinisIsPlatformAdminSession(session) {
  return session?.user?.role === "platform_admin" || session?.business?.type === "platform";
}

export default function HomePage({ navigate, dakinisSystemRegistry }) {
  const { session } = useDakinisSession();

  const sistemaButtons = useMemo(() => {
    const all = Object.entries(dakinisSystemRegistry);
    if (!session?.token) return all;
    if (dakinisIsPlatformAdminSession(session)) return [];
    const tenantType = session.business?.type;
    if (tenantType) return all.filter(([key]) => key === tenantType);
    return all;
  }, [session, dakinisSystemRegistry]);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="kicker">FASE 2 - SaaS multi-tenant (SQLite MVP)</p>
            <h1>
              Menos cancelaciones.
              <br />
              Mas clientes.
              <br />
              Mas control.
            </h1>
            <p className="lead">
              Cada negocio tiene su <strong>tenant</strong> persistido (<code>x-business-id</code>) mas login
              JWT opcional.
            </p>
            <div className="hero-actions">
              <button type="button" className="btn btn-outline" onClick={() => navigate("/login")}>
                Login admin
              </button>
              <a href="#modulos" className="btn btn-outline">
                Ver sistemas
              </a>
            </div>
            <p className="lead">Stack: React + Node + SQLite (listo para PostgreSQL).</p>
          </div>
          <div className="hero-card">
            <img src={logoGrande} alt="Dakinis Scheduler + CRM + WhatsApp" className="hero-logo" />
            <ul>
              <li>
                Datos por <code>x-business-id</code> en API
              </li>
              <li>Mockups sincronizados con base de datos</li>
              <li>JWT + API key maestra solo desarrollo</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="modulos" className="modules">
        <div className="container">
          <h2>Tenants demo por tipo de negocio</h2>
          <p className="lead">
            Slugs seed: clinica-demo, peluqueria-demo, inmobiliaria-demo, restaurante-demo. API key
            desarrollo:&nbsp;
            <code>dakinis-dev-key</code>
          </p>
          {dakinisIsPlatformAdminSession(session) ? (
            <div className="system-switcher">
              <button type="button" className="system-btn active" onClick={() => navigate("/admin")}>
                Administración plataforma (negocios y usuarios)
              </button>
            </div>
          ) : (
            <div className="system-switcher">
              {sistemaButtons.map(([systemKey, systemInfo]) => (
                <button
                  key={systemKey}
                  type="button"
                  className="system-btn"
                  onClick={() => navigate(`/sistema/${encodeURIComponent(systemKey)}`)}
                >
                  {systemInfo.label}
                </button>
              ))}
            </div>
          )}
          {session?.token && session.business?.type && !dakinisIsPlatformAdminSession(session) ? (
            <p className="lead" style={{ marginTop: "0.75rem" }}>
              Sesión: solo ves tu tipo de negocio (<strong>{dakinisSystemRegistry[session.business.type]?.label}</strong>
              ).
            </p>
          ) : null}
        </div>
      </section>

      <section id="demo" className="cta">
        <div className="container cta-card">
          <div>
            <h2>Dakinis One</h2>
            <p>Listo para conectar Postgres y Stripe en siguiente fase.</p>
          </div>
          <button type="button" className="btn" onClick={() => navigate("/login")}>
            Entrar como admin
          </button>
          <a href="https://wa.me/" className="btn btn-outline">
            WhatsApp demo
          </a>
        </div>
      </section>
    </>
  );
}
