const logoGrande = "/Logo%20Grande.jpeg";

export default function HomePage({ navigate, dakinisSystemRegistry }) {
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
          <div className="system-switcher">
            {Object.entries(dakinisSystemRegistry).map(([systemKey, systemInfo]) => (
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
