import { useState } from "react";
import MockupSidebarNav from "./MockupSidebarNav.jsx";
import MockupToolbar from "./MockupToolbar.jsx";
import ExecutiveDashboardPanel from "../components/commercial/ExecutiveDashboardPanel.jsx";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisMockupTabList, dakinisMockupToolbar } from "./mockupPanelHelpers.js";

const TAB_IDS = ["resumen", "agenda", "pacientes", "proveedores", "whatsapp", "ajustes"];

function PanelResumen() {
  return (
    <>
      <div className="mockup-executive-strip">
        <ExecutiveDashboardPanel verticalKey="clinica" compact />
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

      <div className="two-col mockup-panel-spaced">
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

      <article className="card mockup-table-card">
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
    </>
  );
}

function PanelAgenda() {
  return (
    <div className="two-col">
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Cabina 1</h3>
        <div className="pill-grid">
          <span>09:00–10:00 · Revisión</span>
          <span>11:45–12:45 · Peeling</span>
          <span>16:30–17:30 · HIFU</span>
        </div>
      </article>
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Cabina 2</h3>
        <div className="pill-grid">
          <span>10:30–11:30 · Botox</span>
          <span>14:00–15:00 · Relleno labial</span>
        </div>
      </article>
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Cabina 3</h3>
        <div className="pill-grid">
          <span>12:00–13:30 · Masaje</span>
          <span>17:00–18:00 · Seguimiento</span>
        </div>
      </article>
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Bloqueos y mantenimiento</h3>
        <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--muted)" }}>
          <li>13:00–13:45 · Limpieza cabinas (bloqueo)</li>
          <li>Cabina 2 · calibración láser mañana 08:00</li>
        </ul>
      </article>
    </div>
  );
}

function PanelPacientes() {
  return (
    <article className="card mockup-table-card">
      <h3 style={{ marginTop: 0 }}>CRM — fichas recientes</h3>
      <table className="mockup-table">
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Última visita</th>
            <th>Próxima</th>
            <th>Etiquetas</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Elena Suarez</td>
            <td>12 abr 2026</td>
            <td>9 may 09:00</td>
            <td>VIP, piel sensible</td>
          </tr>
          <tr>
            <td>Marta Ruiz</td>
            <td>2 may 2026</td>
            <td>—</td>
            <td>Recordatorio retoque</td>
          </tr>
          <tr>
            <td>Laura G.</td>
            <td>28 abr 2026</td>
            <td>15 may</td>
            <td>Nuevo · Instagram</td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}

function PanelProveedores() {
  return (
    <div className="two-col">
      <article className="card mockup-table-card">
        <h3 style={{ marginTop: 0 }}>Stock crítico</h3>
        <table className="mockup-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Ud.</th>
              <th>Proveedor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Toxina tipo A</td>
              <td>4 viales</td>
              <td>MedSupply EU</td>
            </tr>
            <tr>
              <td>Ácido glicólico 70%</td>
              <td>1 bote</td>
              <td>DermaPro</td>
            </tr>
          </tbody>
        </table>
      </article>
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Pedidos en curso</h3>
        <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--muted)" }}>
          <li>Pedido #4421 — entrega martes (consumibles)</li>
          <li>Reposición lámparas cabinas — en revisión</li>
        </ul>
      </article>
    </div>
  );
}

function PanelWhatsapp() {
  return (
    <div className="two-col">
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Plantillas activas</h3>
        <div className="pill-grid">
          <span>Recordatorio 24 h antes</span>
          <span>Post-tratamiento + cuidados</span>
          <span>Reactivación VIP 90 días</span>
        </div>
      </article>
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Cola de envíos (hoy)</h3>
        <table className="mockup-table">
          <thead>
            <tr>
              <th>Hora envío</th>
              <th>Plantilla</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>08:30</td>
              <td>Recordatorio mañana</td>
              <td>
                <span className="mockup-badge">Enviado</span>
              </td>
            </tr>
            <tr>
              <td>18:00</td>
              <td>Encuesta satisfacción</td>
              <td>Programado</td>
            </tr>
          </tbody>
        </table>
      </article>
    </div>
  );
}

function PanelAjustes() {
  const { t } = useLocale();
  return (
    <article className="card">
      <h3 style={{ marginTop: 0 }}>Preferencias del centro</h3>
      <ul style={{ margin: "0 0 1rem", paddingLeft: "1.1rem", color: "var(--muted)" }}>
        <li>Horario: Lun–Sáb 9:00–20:00</li>
        <li>Duración de cita: 45 min</li>
        <li>Confirmación automática de citas web: activada</li>
        <li>Recordatorios WhatsApp: activados</li>
      </ul>
      <p className="lead" style={{ fontSize: "0.9rem", margin: 0 }}>
        {t("mockupPanels.clinica.settingsNote")}
      </p>
    </article>
  );
}

export default function ClinicaPanelMockup() {
  const { t } = useLocale();
  const [tab, setTab] = useState("resumen");
  const tabs = dakinisMockupTabList(t, "clinica", TAB_IDS);
  const tb = dakinisMockupToolbar(t, "clinica", tab);

  return (
    <div className="mockup-app">
      <aside className="mockup-sidebar">
        <div className="mockup-sidebar-brand">{t("mockupPanels.clinica.brand")}</div>
        <MockupSidebarNav tabs={tabs} activeId={tab} onSelect={setTab} />
      </aside>
      <div className="mockup-main">
        <MockupToolbar title={tb.title} badge={tb.badge} roleKey={tb.roleKey} extra={tb.extra} />
        {tab === "resumen" ? <PanelResumen /> : null}
        {tab === "agenda" ? <PanelAgenda /> : null}
        {tab === "pacientes" ? <PanelPacientes /> : null}
        {tab === "proveedores" ? <PanelProveedores /> : null}
        {tab === "whatsapp" ? <PanelWhatsapp /> : null}
        {tab === "ajustes" ? <PanelAjustes /> : null}
      </div>
    </div>
  );
}
