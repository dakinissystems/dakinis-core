/** Maquetación estática: panel tipo app para inmobiliaria */
export default function InmobiliariaPanelMockup() {
  return (
    <div className="mockup-app">
      <aside className="mockup-sidebar">
        <div className="mockup-sidebar-brand">Dakinis · Comercial</div>
        <nav>
          <div className="mockup-nav-btn active">Pipeline</div>
          <div className="mockup-nav-btn">Visitas</div>
          <div className="mockup-nav-btn">Leads y fuentes</div>
          <div className="mockup-nav-btn">Propiedades</div>
          <div className="mockup-nav-btn">Aliados / marketing</div>
          <div className="mockup-nav-btn">Informes</div>
        </nav>
      </aside>
      <div className="mockup-main">
        <div className="mockup-toolbar">
          <div>
            <strong>Embudo comercial</strong>
            <span className="mockup-badge" style={{ marginLeft: "0.75rem" }}>
              Zona norte · equipo A
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span className="mockup-user-pill">María · agente</span>
            <button type="button" className="btn btn-outline" style={{ padding: "0.45rem 0.85rem", fontSize: "0.9rem" }}>
              + Lead
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: "0.65rem",
            marginBottom: "1rem",
            overflowX: "auto"
          }}
        >
          {[
            { name: "Nuevo", n: 9, c: "rgba(45,212,191,0.12)" },
            { name: "Contacto", n: 12, c: "rgba(96,165,250,0.12)" },
            { name: "Visita", n: 6, c: "rgba(251,191,36,0.12)" },
            { name: "Propuesta", n: 4, c: "rgba(248,113,113,0.1)" },
            { name: "Cierre", n: 2, c: "rgba(74,222,128,0.12)" }
          ].map(({ name, n, c }) => (
            <article key={name} className="card" style={{ background: c, minHeight: "120px" }}>
              <p className="kpi-label">{name}</p>
              <p className="kpi-value" style={{ fontSize: "1.5rem" }}>
                {n}
              </p>
              <p className="lead" style={{ fontSize: "0.8rem", margin: "0.5rem 0 0" }}>
                arrastrar tarjetas (mockup)
              </p>
            </article>
          ))}
        </div>

        <div className="two-col">
          <article className="card" style={{ overflow: "auto" }}>
            <h3 style={{ marginTop: 0 }}>Visitas programadas</h3>
            <table className="mockup-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Lead</th>
                  <th>Propiedad</th>
                  <th>Agente</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Hoy 17:30</td>
                  <td>Carlos Díaz</td>
                  <td>Chalet zona norte</td>
                  <td>Mario</td>
                </tr>
                <tr>
                  <td>Mañana 11:00</td>
                  <td>Ana Torres</td>
                  <td>Oficina premium</td>
                  <td>Lucía</td>
                </tr>
              </tbody>
            </table>
          </article>
          <article className="card">
            <h3 style={{ marginTop: 0 }}>Recordatorios</h3>
            <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--muted)" }}>
              <li>Seguimiento post-visita pendiente: 4 leads</li>
              <li>Destacado portal caduca en 5 días — renovar</li>
              <li>Encuesta de interés automática tras visita</li>
            </ul>
          </article>
        </div>
      </div>
    </div>
  );
}
