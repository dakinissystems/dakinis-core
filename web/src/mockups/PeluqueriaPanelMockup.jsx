import { useState } from "react";
import MockupSidebarNav from "./MockupSidebarNav.jsx";
import ExecutiveDashboardPanel from "../components/commercial/ExecutiveDashboardPanel.jsx";

const TABS = [
  { id: "hoy", label: "Hoy" },
  { id: "estilistas", label: "Agenda por estilista" },
  { id: "web", label: "Reservas web" },
  { id: "clientes", label: "Clientes y fichas" },
  { id: "productos", label: "Productos / pedidos" },
  { id: "campanas", label: "Campañas WhatsApp" }
];

function Toolbar({ title, badge, user, action }) {
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
        {action}
      </div>
    </div>
  );
}

function PanelHoy() {
  return (
    <>
      <div className="mockup-executive-strip">
        <ExecutiveDashboardPanel verticalKey="peluqueria" compact />
      </div>
      <div className="module-grid mockup-stylist-grid">
        {["Diana", "Sofía", "Lucía", "Marta"].map((name) => (
          <article key={name} className="card">
            <p className="kpi-label">{name}</p>
            <p className="kpi-value" style={{ fontSize: "1.35rem" }}>
              {name === "Diana" ? "6" : name === "Sofía" ? "5" : "4"} turnos
            </p>
          </article>
        ))}
      </div>

      <div className="two-col mockup-panel-spaced">
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
    </>
  );
}

function PanelEstilistas() {
  return (
      <div className="module-grid">
      {[
        { name: "Diana", slots: ["10:30 Raquel · corte", "14:00 Carmen · mechas", "17:00 Walk-in"] },
        { name: "Sofía", slots: ["12:00 Alicia · keratina", "15:30 Paula · peinado"] },
        { name: "Lucía", slots: ["11:00 tinte raíz", "16:15 Nuevo web · coloración"] },
        { name: "Marta", slots: ["09:30 Niño · corte", "13:00 Laura · brushing"] }
      ].map((col) => (
        <article key={col.name} className="card">
          <h3 style={{ marginTop: 0 }}>{col.name}</h3>
          <div className="pill-grid">
            {col.slots.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function PanelWeb() {
  return (
    <article className="card mockup-table-card">
      <h3 style={{ marginTop: 0 }}>Solicitudes desde la web pública</h3>
      <table className="mockup-table">
        <thead>
          <tr>
            <th>Recibida</th>
            <th>Cliente</th>
            <th>Servicio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Hoy 08:12</td>
            <td>maria@gmail.com</td>
            <td>Balayage</td>
            <td>
              <span className="mockup-badge">Pendiente</span>
            </td>
          </tr>
          <tr>
            <td>Ayer 19:40</td>
            <td>Ana L.</td>
            <td>Corte hombre</td>
            <td>Confirmada WA</td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}

function PanelClientes() {
  return (
    <article className="card mockup-table-card">
      <h3 style={{ marginTop: 0 }}>Fichas y visitas</h3>
      <table className="mockup-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Teléfono</th>
            <th>Última visita</th>
            <th>Notas</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Raquel Martin</td>
            <td>6XX … 891</td>
            <td>Hoy</td>
            <td>Prefiere Diana · sin sulfatos</td>
          </tr>
          <tr>
            <td>Alicia Perez</td>
            <td>6XX … 204</td>
            <td>Hace 6 semanas</td>
            <td>Keratina anual</td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}

function PanelProductos() {
  return (
    <div className="two-col">
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Pedido mayorista (mockup)</h3>
        <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--muted)" }}>
          <li>Tintes línea X — en tránsito</li>
          <li>Champús salón — stock OK</li>
        </ul>
      </article>
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Consumo estimado semana</h3>
        <p className="kpi-value" style={{ fontSize: "1.5rem", margin: "0.25rem 0" }}>
          124 unidades
        </p>
        <p className="lead" style={{ fontSize: "0.85rem", margin: 0 }}>
          Basado en servicios registrados en agenda.
        </p>
      </article>
    </div>
  );
}

function PanelCampanas() {
  return (
    <div className="two-col">
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Campaña activa</h3>
        <p className="lead" style={{ fontSize: "0.9rem" }}>
          “Vuelve al salón” — clientes sin cita +60 días.
        </p>
        <div className="pill-grid">
          <span>Enviados: 48</span>
          <span>Aperturas: 31%</span>
          <span>Reservas desde link: 6</span>
        </div>
      </article>
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Borradores</h3>
        <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--muted)" }}>
          <li>Black Friday coloración — programar</li>
          <li>Cumpleaños VIP — plantilla lista</li>
        </ul>
      </article>
    </div>
  );
}

const TOOLBAR = {
  hoy: { title: "Agenda — viernes", badge: "Ocupación 89%" },
  estilistas: { title: "Vista por estilista", badge: "4 columnas" },
  web: { title: "Reservas desde web", badge: "3 pendientes" },
  clientes: { title: "Clientes y fichas", badge: "CRM salón" },
  productos: { title: "Productos y pedidos", badge: "Mayorista" },
  campanas: { title: "Campañas WhatsApp", badge: "1 activa" }
};

export default function PeluqueriaPanelMockup() {
  const [tab, setTab] = useState("hoy");
  const tb = TOOLBAR[tab];
  const quickBtn =
    tab === "hoy" ? (
      <button type="button" className="btn" style={{ padding: "0.45rem 0.85rem", fontSize: "0.9rem" }}>
        + Reserva rápida
      </button>
    ) : null;

  return (
    <div className="mockup-app">
      <aside className="mockup-sidebar">
        <div className="mockup-sidebar-brand">Dakinis · Salón</div>
        <MockupSidebarNav tabs={TABS} activeId={tab} onSelect={setTab} />
      </aside>
      <div className="mockup-main">
        <Toolbar title={tb.title} badge={tb.badge} user="Recepción" action={quickBtn} />
        {tab === "hoy" ? <PanelHoy /> : null}
        {tab === "estilistas" ? <PanelEstilistas /> : null}
        {tab === "web" ? <PanelWeb /> : null}
        {tab === "clientes" ? <PanelClientes /> : null}
        {tab === "productos" ? <PanelProductos /> : null}
        {tab === "campanas" ? <PanelCampanas /> : null}
      </div>
    </div>
  );
}
