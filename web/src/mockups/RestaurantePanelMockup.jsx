import { useMemo, useState } from "react";
import {
  DAKINIS_RESTAURANT_ALLERGEN_CATALOG,
  DAKINIS_RESTAURANT_EXTRA_ALLERGENS
} from "@dakinis/shared/catalog/restaurant-allergens.js";
import MockupSidebarNav from "./MockupSidebarNav.jsx";

const TABS = [
  { id: "mapa", label: "Mapa de mesas" },
  { id: "reservas", label: "Reservas" },
  { id: "espera", label: "Lista de espera" },
  { id: "comandas", label: "Comandas" },
  { id: "clientes", label: "Alergias por reserva" },
  { id: "alergenos", label: "Cartel alérgenos" },
  { id: "proveedores", label: "Proveedores" }
];

/** Demo: mismos presentes que el seed del tenant restaurante-demo (gluten, huevos). */
const MOCK_ALLERGEN_CHECKLIST = [
  ...DAKINIS_RESTAURANT_ALLERGEN_CATALOG.map((item) => ({
    catalogId: item.id,
    name: item.name,
    category: item.category,
    hint: item.hint,
    present: item.id === "gluten" || item.id === "eggs",
    notes:
      item.id === "gluten"
        ? "Harina, pizzas, empanadas"
        : item.id === "eggs"
          ? "Masas y empanadas"
          : ""
  })),
  ...DAKINIS_RESTAURANT_EXTRA_ALLERGENS.map((item) => ({
    catalogId: item.id,
    name: item.name,
    category: item.category,
    hint: item.hint,
    present: false,
    notes: ""
  }))
];

const MOCK_PUBLIC_ALLERGEN_URL = "https://core.dakinissystems.com/alergenos/demo-restaurante";

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

function PanelAlergenosCartel() {
  const byCategory = useMemo(() => {
    const groups = new Map();
    for (const item of MOCK_ALLERGEN_CHECKLIST) {
      const cat = item.category || "Otros";
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(item);
    }
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  const presentCount = MOCK_ALLERGEN_CHECKLIST.filter((a) => a.present).length;
  const presentOnly = MOCK_ALLERGEN_CHECKLIST.filter((a) => a.present);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(MOCK_PUBLIC_ALLERGEN_URL)}`;

  return (
    <>
      <article className="card allergen-panel">
        <h3 style={{ marginTop: 0 }}>Alérgenos e intolerancias (carta / cocina)</h3>
        <p className="lead" style={{ fontSize: "0.9rem" }}>
          Lista de referencia — <strong>14 alérgenos obligatorios UE</strong> + extras. Marca{" "}
          <strong>Sí hay</strong> si el alérgeno está en vuestro menú o cocina; el cartel QR solo muestra los
          marcados.
        </p>
        <p className="allergen-panel__summary">
          <span className="allergen-panel__badge">{presentCount}</span> marcados como presentes · 14 obligatorios
          UE
        </p>

        <div className="allergen-checklist">
          {byCategory.map(([category, items]) => (
            <section key={category} className="allergen-checklist__group">
              <h5 className="allergen-checklist__category">{category}</h5>
              <ul className="allergen-checklist__items">
                {items.map((item) => (
                  <li
                    key={item.catalogId}
                    className={`allergen-row${item.present ? " is-present" : ""}`}
                  >
                    <label className="allergen-row__check">
                      <input type="checkbox" checked={Boolean(item.present)} readOnly disabled />
                      <span className="allergen-row__name">{item.name}</span>
                      <span className="allergen-row__state">{item.present ? "Sí hay" : "No hay"}</span>
                    </label>
                    <p className="allergen-row__hint">{item.hint}</p>
                    {item.present && item.notes ? (
                      <p className="kpi-label" style={{ margin: "0.35rem 0 0 1.8rem" }}>
                        {item.notes}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="allergen-panel__actions">
          <button type="button" className="btn" disabled>
            Guardar y actualizar QR
          </button>
          <span className="mockup-badge" style={{ marginLeft: "0.5rem" }}>
            Vista mockup
          </span>
        </div>

        <div className="allergen-panel__qr">
          <img src={qrUrl} width={140} height={140} alt="QR alergias (demo)" />
          <div>
            <a href={MOCK_PUBLIC_ALLERGEN_URL} target="_blank" rel="noreferrer">
              {MOCK_PUBLIC_ALLERGEN_URL}
            </a>
            <p className="kpi-label">Vista pública: solo alérgenos marcados «Sí hay»</p>
          </div>
        </div>
      </article>

      <article className="card" style={{ marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Vista cliente (QR / cartel)</h3>
        <p className="lead" style={{ fontSize: "0.9rem" }}>
          Lo que ve el comensal al escanear el QR — sin login:
        </p>
        <p className="kicker" style={{ marginBottom: "0.5rem" }}>
          Restaurante demo · Manu
        </p>
        {presentOnly.length ? (
          <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
            {presentOnly.map((a) => (
              <li key={a.catalogId} style={{ marginBottom: "0.35rem" }}>
                <strong>{a.name}</strong>
                {a.notes ? <span style={{ color: "var(--muted)" }}> — {a.notes}</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="lead">Sin alérgenos declarados en carta.</p>
        )}
      </article>
    </>
  );
}

function PanelClientes() {
  return (
    <article className="card" style={{ overflow: "auto" }}>
      <h3 style={{ marginTop: 0 }}>Alergias por comensal (reserva)</h3>
      <p className="lead" style={{ fontSize: "0.85rem", marginTop: 0 }}>
        Notas de sala para esta noche — distinto del{" "}
        <strong>cartel legal de alérgenos</strong> (pestaña Cartel alérgenos).
      </p>
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
  clientes: { title: "Alergias por reserva", badge: "2 mesas con nota", extra: "52 cubiertos previstos" },
  alergenos: { title: "Cartel alérgenos", badge: "2 presentes en carta", extra: "QR cartel sala" },
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
        {tab === "alergenos" ? <PanelAlergenosCartel /> : null}
        {tab === "proveedores" ? <PanelProveedores /> : null}
      </div>
    </div>
  );
}
