/** Maquetación estática: panel tipo app para restaurante */
export default function RestaurantePanelMockup() {
  return (
    <div className="mockup-app">
      <aside className="mockup-sidebar">
        <div className="mockup-sidebar-brand">Dakinis · Sala</div>
        <nav>
          <div className="mockup-nav-btn active">Mapa de mesas</div>
          <div className="mockup-nav-btn">Reservas</div>
          <div className="mockup-nav-btn">Lista de espera</div>
          <div className="mockup-nav-btn">Comandas</div>
          <div className="mockup-nav-btn">Clientes / alergias</div>
          <div className="mockup-nav-btn">Proveedores</div>
        </nav>
      </aside>
      <div className="mockup-main">
        <div className="mockup-toolbar">
          <div>
            <strong>Servicio noche</strong>
            <span className="mockup-badge" style={{ marginLeft: "0.75rem" }}>
              Terraza + interior
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span className="mockup-user-pill">Maître</span>
            <span className="mockup-badge">52 cubiertos previstos</span>
          </div>
        </div>

        <div className="two-col" style={{ marginBottom: "1rem" }}>
          <article className="card">
            <h3 style={{ marginTop: 0 }}>Plan de sala (esquema)</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.5rem",
                fontSize: "0.85rem",
                color: "var(--muted)"
              }}
            >
              <div style={{ border: "1px dashed var(--line)", borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
                Terraza T1–T6
                <div style={{ marginTop: "0.35rem", color: "var(--brand)" }}>4/6 ocup.</div>
              </div>
              <div style={{ border: "1px dashed var(--line)", borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
                Interior I1–I8
                <div style={{ marginTop: "0.35rem", color: "var(--brand)" }}>6/8 ocup.</div>
              </div>
              <div style={{ border: "1px dashed var(--line)", borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
                Lista espera
                <div style={{ marginTop: "0.35rem" }}>3 grupos</div>
              </div>
            </div>
          </article>
          <article className="card">
            <h3 style={{ marginTop: 0 }}>Resumen</h3>
            <div className="system-kpis" style={{ gridTemplateColumns: "repeat(2, 1fr)", margin: 0 }}>
              <div>
                <p className="kpi-label">Confirmadas WhatsApp</p>
                <p className="kpi-value" style={{ fontSize: "1.4rem" }}>
                  38
                </p>
              </div>
              <div>
                <p className="kpi-label">No-show últimos 7d</p>
                <p className="kpi-value" style={{ fontSize: "1.4rem" }}>
                  2%
                </p>
              </div>
            </div>
          </article>
        </div>

        <article className="card" style={{ overflow: "auto" }}>
          <h3 style={{ marginTop: 0 }}>Próximas mesas</h3>
          <table className="mockup-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Mesa / zona</th>
                <th>Cliente</th>
                <th>Pax</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>20:00</td>
                <td>Terraza 4</td>
                <td>Pablo Vega</td>
                <td>4</td>
                <td>Sin gluten · confirmado WA</td>
              </tr>
              <tr>
                <td>21:00</td>
                <td>Interior 2</td>
                <td>Lucía Ortega</td>
                <td>2</td>
                <td>Aniversario</td>
              </tr>
              <tr>
                <td>21:30</td>
                <td>Terraza 1</td>
                <td>Grupo empresa</td>
                <td>8</td>
                <td>Menú degustación</td>
              </tr>
            </tbody>
          </table>
        </article>
      </div>
    </div>
  );
}
