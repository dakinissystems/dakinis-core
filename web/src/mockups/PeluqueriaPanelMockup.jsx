/** Maquetación estática: panel tipo app para peluquería */
export default function PeluqueriaPanelMockup() {
  return (
    <div className="mockup-app">
      <aside className="mockup-sidebar">
        <div className="mockup-sidebar-brand">Dakinis · Salón</div>
        <nav>
          <div className="mockup-nav-btn active">Hoy</div>
          <div className="mockup-nav-btn">Agenda por estilista</div>
          <div className="mockup-nav-btn">Reservas web</div>
          <div className="mockup-nav-btn">Clientes y fichas</div>
          <div className="mockup-nav-btn">Productos / pedidos</div>
          <div className="mockup-nav-btn">Campañas WhatsApp</div>
        </nav>
      </aside>
      <div className="mockup-main">
        <div className="mockup-toolbar">
          <div>
            <strong>Agenda — viernes</strong>
            <span className="mockup-badge" style={{ marginLeft: "0.75rem" }}>
              Ocupación 89%
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span className="mockup-user-pill">Recepción</span>
            <button type="button" className="btn" style={{ padding: "0.45rem 0.85rem", fontSize: "0.9rem" }}>
              + Reserva rápida
            </button>
          </div>
        </div>

        <div className="module-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", marginBottom: "1rem" }}>
          {["Diana", "Sofía", "Lucía", "Marta"].map((name) => (
            <article key={name} className="card">
              <p className="kpi-label">{name}</p>
              <p className="kpi-value" style={{ fontSize: "1.35rem" }}>
                {name === "Diana" ? "6" : name === "Sofía" ? "5" : "4"} turnos
              </p>
            </article>
          ))}
        </div>

        <div className="two-col" style={{ marginBottom: "1rem" }}>
          <article className="card">
            <h3 style={{ marginTop: 0 }}>Próximos turnos</h3>
            <table className="mockup-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>10:30</td>
                  <td>Raquel Martin</td>
                  <td>Corte + peinado</td>
                  <td>Diana</td>
                </tr>
                <tr>
                  <td>12:00</td>
                  <td>Alicia Perez</td>
                  <td>Keratina</td>
                  <td>Sofía</td>
                </tr>
                <tr>
                  <td>16:15</td>
                  <td>Nuevo · web</td>
                  <td>Coloración</td>
                  <td>Lucía</td>
                </tr>
              </tbody>
            </table>
          </article>
          <article className="card">
            <h3 style={{ marginTop: 0 }}>Reservas online (pendientes)</h3>
            <p className="lead" style={{ fontSize: "0.9rem" }}>
              El cliente elige estilista y servicio; confirmación por WhatsApp automática.
            </p>
            <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--muted)" }}>
              <li>3 solicitudes por confirmar hoy</li>
              <li>2 reprogramaciones desde el link público</li>
            </ul>
          </article>
        </div>
      </div>
    </div>
  );
}
