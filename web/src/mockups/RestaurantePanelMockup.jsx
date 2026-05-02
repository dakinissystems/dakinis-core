import { useState } from "react";
import MockupSidebarNav from "./MockupSidebarNav.jsx";

const TABS = [
  { id: "mapa", label: "Mapa de mesas" },
  { id: "reservas", label: "Reservas" },
  { id: "espera", label: "Lista de espera" },
  { id: "comandas", label: "Comandas" },
  { id: "clientes", label: "Clientes / alergias" },
  { id: "proveedores", label: "Proveedores" }
];

function Toolbar({ title, badge, user, extra }) {
  return (
    <div className="mockup-toolbar">
      <div>
        <strong>{title}</strong>
        {badge ? (
          <span className="mockup-badge" style={{ marginLeft: "0.75rem" }}>
            {badge}
          </span>
        ) : null}
      </div>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
        <span className="mockup-user-pill">{user}</span>
        {extra ? <span className="mockup-badge">{extra}</span> : null}
      </div>
    </div>
  );
}

function PanelMapa() {
  return (
    <>
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
            <div
              style={{
                border: "1px dashed var(--line)",
                borderRadius: 8,
                padding: "0.75rem",
                textAlign: "center"
              }}
            >
              Terraza T1–T6
              <div style={{ marginTop: "0.35rem", color: "var(--brand)" }}>4/6 ocup.</div>
            </div>
            <div
              style={{
                border: "1px dashed var(--line)",
                borderRadius: 8,
                padding: "0.75rem",
                textAlign: "center"
              }}
            >
              Interior I1–I8
              <div style={{ marginTop: "0.35rem", color: "var(--brand)" }}>6/8 ocup.</div>
            </div>
            <div
              style={{
                border: "1px dashed var(--line)",
                borderRadius: 8,
                padding: "0.75rem",
                textAlign: "center"
              }}
            >
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
    </>
  );
}

function PanelReservas() {
  return (
    <article className="card" style={{ overflow: "auto" }}>
      <h3 style={{ marginTop: 0 }}>Todas las reservas — servicio noche</h3>
      <table className="mockup-table">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Zona</th>
            <th>Cliente</th>
            <th>Canal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>19:30</td>
            <td>Barra alta</td>
            <td>Sin reserva</td>
            <td>Walk-in</td>
          </tr>
          <tr>
            <td>20:00</td>
            <td>T4</td>
            <td>Pablo Vega</td>
            <td>WA</td>
          </tr>
          <tr>
            <td>21:30</td>
            <td>T1</td>
            <td>Grupo empresa</td>
            <td>Web</td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}

function PanelEspera() {
  return (
    <article className="card">
      <h3 style={{ marginTop: 0 }}>Lista de espera en tiempo real</h3>
      <ol style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--muted)" }}>
        <li style={{ marginBottom: "0.5rem" }}>
          Familia Pérez · 4 pax · esperando desde 20:10 · aviso WA enviado
        </li>
        <li style={{ marginBottom: "0.5rem" }}>Pareja · 2 pax · preferencia terraza</li>
        <li>Grupo 5 pax · interior si libera I6</li>
      </ol>
    </article>
  );
}

function PanelComandas() {
  return (
    <div className="two-col">
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Cocina — pedidos activos</h3>
        <div className="pill-grid">
          <span>T4 · Entrantes x4</span>
          <span>I2 · Principal x2</span>
          <span>Barra · 3 tapas</span>
        </div>
      </article>
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Bar — prepago</h3>
        <p className="lead" style={{ fontSize: "0.9rem" }}>
          Coherencia con reservas: los comensales con menú degustación aparecen agrupados por mesa.
        </p>
      </article>
    </div>
  );
}

function PanelClientes() {
  return (
    <article className="card" style={{ overflow: "auto" }}>
      <h3 style={{ marginTop: 0 }}>Alergias e intolerancias (reserva)</h3>
      <table className="mockup-table">
        <thead>
          <tr>
            <th>Mesa / hora</th>
            <th>Cliente</th>
            <th>Nota</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>T4 · 20:00</td>
            <td>Pablo Vega</td>
            <td>Sin gluten</td>
          </tr>
          <tr>
            <td>I5 · 20:45</td>
            <td>Grupo aniversario</td>
            <td>1 vegano</td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}

function PanelProveedores() {
  return (
    <div className="two-col">
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Entregas previstas</h3>
        <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--muted)" }}>
          <li>Mariscos Costa — mañana 07:00</li>
          <li>Vinos Sur — miércoles</li>
        </ul>
      </article>
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Incidencias stock</h3>
        <p className="lead" style={{ fontSize: "0.9rem", margin: 0 }}>
          Aceite premium — pedido mínimo no alcanzado; combinar con pedido de bar.
        </p>
      </article>
    </div>
  );
}

const TOOLBAR = {
  mapa: { title: "Servicio noche", badge: "Terraza + interior", extra: "52 cubiertos previstos" },
  reservas: { title: "Reservas", badge: "Lista completa", extra: "52 cubiertos previstos" },
  espera: { title: "Lista de espera", badge: "3 grupos", extra: "Tiempo medio 22 min" },
  comandas: { title: "Comandas", badge: "Cocina + bar", extra: "Turno noche" },
  clientes: { title: "Clientes y restricciones", badge: "Fichas reserva", extra: "52 cubiertos previstos" },
  proveedores: { title: "Proveedores", badge: "2 entregas", extra: "Semana actual" }
};

export default function RestaurantePanelMockup() {
  const [tab, setTab] = useState("mapa");
  const tb = TOOLBAR[tab];

  return (
    <div className="mockup-app">
      <aside className="mockup-sidebar">
        <div className="mockup-sidebar-brand">Dakinis · Sala</div>
        <MockupSidebarNav tabs={TABS} activeId={tab} onSelect={setTab} />
      </aside>
      <div className="mockup-main">
        <Toolbar title={tb.title} badge={tb.badge} user="Maître" extra={tb.extra} />
        {tab === "mapa" ? <PanelMapa /> : null}
        {tab === "reservas" ? <PanelReservas /> : null}
        {tab === "espera" ? <PanelEspera /> : null}
        {tab === "comandas" ? <PanelComandas /> : null}
        {tab === "clientes" ? <PanelClientes /> : null}
        {tab === "proveedores" ? <PanelProveedores /> : null}
      </div>
    </div>
  );
}
