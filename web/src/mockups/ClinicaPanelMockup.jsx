/** Maquetación estática: panel tipo app para clínica estética */
export default function ClinicaPanelMockup() {
  return (
    <div className="mockup-app">
      <aside className="mockup-sidebar">
        <div className="mockup-sidebar-brand">Dakinis · Clínica</div>
        <nav>
          <div className="mockup-nav-btn active">Resumen</div>
          <div className="mockup-nav-btn">Agenda y cabinas</div>
          <div className="mockup-nav-btn">Pacientes y CRM</div>
          <div className="mockup-nav-btn">Proveedores / stock</div>
          <div className="mockup-nav-btn">WhatsApp y avisos</div>
          <div className="mockup-nav-btn">Ajustes</div>
        </nav>
      </aside>
      <div className="mockup-main">
        <div className="mockup-toolbar">
          <div>
            <strong>Hoy — viernes 9 may 2026</strong>
            <span className="mockup-badge" style={{ marginLeft: "0.75rem" }}>
              3 cabinas activas
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span className="mockup-user-pill">Dr. equipo demo</span>
            <span className="mockup-badge">Clínica centro</span>
          </div>
        </div>

        <div className="system-kpis" style={{ marginBottom: "1rem" }}>
          <article className="card">
            <p className="kpi-label">Citas confirmadas</p>
            <p className="kpi-value">18</p>
          </article>
          <article className="card">
            <p className="kpi-label">Sin confirmar</p>
            <p className="kpi-value">5</p>
          </article>
          <article className="card">
            <p className="kpi-label">VIP esta semana</p>
            <p className="kpi-value">7</p>
          </article>
          <article className="card">
            <p className="kpi-label">Recordatorios enviados</p>
            <p className="kpi-value">24</p>
          </article>
        </div>

        <div className="two-col" style={{ marginBottom: "1rem" }}>
          <article className="card">
            <h3 style={{ marginTop: 0 }}>Agenda mañana (vista rápida)</h3>
            <div className="pill-grid">
              <span>09:00 Cabina 1 · Limpieza</span>
              <span>10:30 Cabina 2 · Botox</span>
              <span>11:45 Cabina 1 · Peeling</span>
              <span>16:00 Cabina 3 · Revisión</span>
            </div>
          </article>
          <article className="card">
            <h3 style={{ marginTop: 0 }}>Alertas del día</h3>
            <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--muted)" }}>
              <li>Lote toxina por debajo del umbral — revisar inventario</li>
              <li>2 pacientes VIP sin cita en 90 días</li>
            </ul>
          </article>
        </div>

        <article className="card" style={{ overflow: "auto" }}>
          <h3 style={{ marginTop: 0 }}>Pacientes — próximas llegadas</h3>
          <table className="mockup-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Paciente</th>
                <th>Tratamiento</th>
                <th>Estado WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>09:00</td>
                <td>Elena Suarez</td>
                <td>Limpieza profunda</td>
                <td>
                  <span className="mockup-badge">Confirmado</span>
                </td>
              </tr>
              <tr>
                <td>10:30</td>
                <td>Marta Ruiz</td>
                <td>Botox zona frontal</td>
                <td>
                  <span className="mockup-badge">Recordatorio 24h enviado</span>
                </td>
              </tr>
              <tr>
                <td>14:15</td>
                <td>Ana V.</td>
                <td>Peeling químico</td>
                <td>Pendiente respuesta</td>
              </tr>
            </tbody>
          </table>
        </article>
      </div>
    </div>
  );
}
