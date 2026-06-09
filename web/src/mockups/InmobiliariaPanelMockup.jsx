import { useState } from "react";
import MockupSidebarNav from "./MockupSidebarNav.jsx";
import MockupToolbar from "./MockupToolbar.jsx";
import ExecutiveDashboardPanel from "../components/commercial/ExecutiveDashboardPanel.jsx";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisMockupTabList, dakinisMockupToolbar } from "./mockupPanelHelpers.js";

const TAB_IDS = ["pipeline", "visitas", "leads", "propiedades", "aliados", "informes"];

const COLUMNAS = [
  { name: "Nuevo", n: 9, c: "rgba(45,212,191,0.12)" },
  { name: "Contacto", n: 12, c: "rgba(96,165,250,0.12)" },
  { name: "Visita", n: 6, c: "rgba(251,191,36,0.12)" },
  { name: "Propuesta", n: 4, c: "rgba(248,113,113,0.1)" },
  { name: "Cierre", n: 2, c: "rgba(74,222,128,0.12)" }
];

function PanelPipeline() {
  return (
    <>
      <div className="mockup-executive-strip">
        <ExecutiveDashboardPanel verticalKey="inmobiliaria" compact />
      </div>
      <div className="mockup-pipeline-board">
        {COLUMNAS.map(({ name, n, c }) => (
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
        <article className="card mockup-table-card">
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
    </>
  );
}

function PanelVisitas() {
  return (
    <article className="card mockup-table-card">
      <h3 style={{ marginTop: 0 }}>Calendario de visitas (semana)</h3>
      <table className="mockup-table">
        <thead>
          <tr>
            <th>Día</th>
            <th>Hora</th>
            <th>Lead</th>
            <th>Inmueble</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Vie 9 may</td>
            <td>17:30</td>
            <td>Carlos Díaz</td>
            <td>Chalet zona norte</td>
          </tr>
          <tr>
            <td>Sáb 10 may</td>
            <td>11:00</td>
            <td>Ana Torres</td>
            <td>Oficina premium</td>
          </tr>
          <tr>
            <td>Lun 12 may</td>
            <td>18:00</td>
            <td>Jorge M.</td>
            <td>Piso reformado</td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}

function PanelLeads() {
  return (
    <div className="two-col">
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Fuentes (últimos 30 días)</h3>
        <div className="pill-grid">
          <span>Portal Idealista · 34%</span>
          <span>Web propia · 22%</span>
          <span>Referido · 18%</span>
          <span>WhatsApp · 14%</span>
        </div>
      </article>
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Leads nuevos sin asignar</h3>
        <p className="kpi-value" style={{ fontSize: "2rem", margin: "0.25rem 0" }}>
          5
        </p>
        <p className="lead" style={{ fontSize: "0.85rem", margin: 0 }}>
          Reparto automático por zona activado (mockup).
        </p>
      </article>
    </div>
  );
}

function PanelPropiedades() {
  return (
    <article className="card mockup-table-card">
      <h3 style={{ marginTop: 0 }}>Cartera destacada</h3>
      <table className="mockup-table">
        <thead>
          <tr>
            <th>Ref.</th>
            <th>Tipo</th>
            <th>Zona</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ZN-CH-01</td>
            <td>Chalet</td>
            <td>Norte</td>
            <td>En visitas</td>
          </tr>
          <tr>
            <td>CT-OF-12</td>
            <td>Oficina</td>
            <td>Centro</td>
            <td>Propuesta enviada</td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}

function PanelAliados() {
  return (
    <div className="two-col">
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Colaboradores</h3>
        <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--muted)" }}>
          <li>Fotógrafo externo — sesión sábado</li>
          <li>Home staging — presupuesto aceptado</li>
        </ul>
      </article>
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Campaña Meta Ads</h3>
        <p className="lead" style={{ fontSize: "0.9rem", margin: 0 }}>
          Rendimiento semanal por encima del objetivo; leads duplicados fusionados en CRM.
        </p>
      </article>
    </div>
  );
}

function PanelInformes() {
  return (
    <article className="card">
      <h3 style={{ marginTop: 0 }}>Informes exportables (demo)</h3>
      <div className="pill-grid">
        <span>Conversión por fuente</span>
        <span>Tiempo medio en etapa</span>
        <span>Visitas vs cierres</span>
        <span>Pipeline valor estimado</span>
      </div>
      <p className="lead" style={{ fontSize: "0.85rem", marginTop: "1rem", marginBottom: 0 }}>
        Exporta a Excel o PDF cuando actives tu cuenta.
      </p>
    </article>
  );
}

export default function InmobiliariaPanelMockup() {
  const { t } = useLocale();
  const [tab, setTab] = useState("pipeline");
  const tabs = dakinisMockupTabList(t, "inmobiliaria", TAB_IDS);
  const tb = dakinisMockupToolbar(t, "inmobiliaria", tab);
  const leadBtn =
    tab === "pipeline" ? (
      <button type="button" className="btn btn-outline" style={{ padding: "0.45rem 0.85rem", fontSize: "0.9rem" }}>
        + Oportunidad
      </button>
    ) : null;

  return (
    <div className="mockup-app">
      <aside className="mockup-sidebar">
        <div className="mockup-sidebar-brand">{t("mockupPanels.inmobiliaria.brand")}</div>
        <MockupSidebarNav tabs={tabs} activeId={tab} onSelect={setTab} />
      </aside>
      <div className="mockup-main">
        <MockupToolbar title={tb.title} badge={tb.badge} roleKey={tb.roleKey} extra={tb.extra} action={leadBtn} />
        {tab === "pipeline" ? <PanelPipeline /> : null}
        {tab === "visitas" ? <PanelVisitas /> : null}
        {tab === "leads" ? <PanelLeads /> : null}
        {tab === "propiedades" ? <PanelPropiedades /> : null}
        {tab === "aliados" ? <PanelAliados /> : null}
        {tab === "informes" ? <PanelInformes /> : null}
      </div>
    </div>
  );
}
