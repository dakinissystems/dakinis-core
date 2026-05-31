import { useMemo, useState } from "react";
import {
  DAKINIS_RESTAURANT_ALLERGEN_CATALOG,
  DAKINIS_RESTAURANT_EXTRA_ALLERGENS
} from "@dakinis/shared/catalog/restaurant-allergens.js";
import AllergenPublicTable from "../components/AllergenPublicTable.jsx";
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

const MOCK_PUBLIC_ALLERGEN_URL = "https://core.dakinissystems.com/alergenos/restaurante-demo";

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

const MOCK_FERMINA_LINES = [
  { name: "Bites cheddar y jalapeños", qty: 2, unitPrice: 8.5 },
  { name: "Chicken bites", qty: 1, unitPrice: 9.5 },
  { name: "Choripán", qty: 2, unitPrice: 7.5 }
];

const MOCK_FERMINA_ORDER = {
  orderNumber: 1042,
  customerName: "Mesa terraza 3",
  table: "Terraza 3",
  channel: "salon",
  status: "cocina",
  notes: "Sin picante en los bites",
  total: 41.5,
  lines: MOCK_FERMINA_LINES
};

const MOCK_FERMINA_INVOICE_CLIENT = {
  invoiceNumber: "FF-C-2026-0008",
  type: "cliente",
  customerName: "Lucía Ortega",
  taxId: "",
  total: 26.5,
  lines: [
    { name: "Bites cheddar y jalapeños", qty: 1, unitPrice: 8.5 },
    { name: "Choripán", qty: 2, unitPrice: 7.5 }
  ]
};

const MOCK_FERMINA_INVOICE_GESTOR = {
  invoiceNumber: "FF-G-2026-0003",
  type: "gestor",
  customerName: "Fermina Food SRL",
  taxId: "30-71234567-8",
  subtotal: 41.5,
  tax: 8.72,
  total: 50.22,
  lines: MOCK_FERMINA_LINES
};

function MockFerminaPrintSheet({ kind, doc, caption }) {
  const isComanda = kind === "comanda";
  const lineTotal = (l) => (l.qty * l.unitPrice).toFixed(2);

  return (
    <div className="mockup-print-grid__cell">
      <p className="mockup-print-grid__label">{caption}</p>
      <article className="fermina-print-sheet" aria-label={caption}>
        <img src="/assets/fermina-logo.png" alt="" className="fermina-print-sheet__logo" width={140} />
        <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.05rem" }}>
          {isComanda ? `Comanda #${doc.orderNumber}` : doc.invoiceNumber}
        </h2>
        <p className="kpi-label" style={{ color: "#444", margin: "0 0 0.5rem" }}>
          Fermina Food · 31/5/2026, 20:45
        </p>
        {!isComanda ? (
          <p style={{ margin: "0 0 0.35rem", fontSize: "0.9rem" }}>
            <strong>
              {doc.type === "gestor" ? "Gestor / contabilidad" : "Cliente (ticket)"}
            </strong>
            {doc.taxId ? ` · ${doc.taxId}` : ""}
          </p>
        ) : null}
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem" }}>
          <strong>{doc.customerName}</strong>
          {doc.table ? ` · ${doc.table}` : ""}
          {isComanda && doc.channel === "takeaway" ? " · Para llevar" : null}
        </p>
        <table className="mockup-table">
          <thead>
            <tr>
              <th>Plato</th>
              <th>Cant.</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            {doc.lines.map((l, i) => (
              <tr key={i}>
                <td>{l.name}</td>
                <td>{l.qty}</td>
                <td>{lineTotal(l)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="fermina-print-sheet__total">
          <strong>{doc.total.toFixed(2)} €</strong>
        </p>
        {!isComanda && doc.type === "gestor" && doc.subtotal != null ? (
          <p style={{ fontSize: "0.75rem", color: "#555", margin: "0.35rem 0 0", textAlign: "right" }}>
            Base {doc.subtotal.toFixed(2)} € · IVA 21% {doc.tax?.toFixed(2)} €
          </p>
        ) : null}
        {isComanda && doc.notes ? (
          <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>{doc.notes}</p>
        ) : null}
      </article>
    </div>
  );
}

function PanelComandas() {
  return (
    <>
      <article className="card fermina-ops--branded" style={{ marginBottom: "1rem" }}>
        <div className="fermina-ops__header" style={{ marginBottom: "0.75rem" }}>
          <img src="/assets/fermina-logo.png" alt="Fermina Food" className="fermina-ops__logo" width={160} />
          <div>
            <p className="kicker" style={{ margin: 0 }}>
              Comida argentina · demo operativa
            </p>
            <p className="lead" style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
              Misma UX que el panel real en <code>/sistema/restaurante</code> (tenant Fermina Food).
            </p>
          </div>
          <span className="mockup-badge">Solo mockup</span>
        </div>

        <div className="fermina-ops__grid">
          <div>
            <h4 style={{ marginTop: 0 }}>Nueva comanda</h4>
            <div className="fermina-ops__fields">
              <label className="mockup-field">
                <span>Cliente</span>
                <input type="text" readOnly value="Walk-in barra" />
              </label>
              <label className="mockup-field">
                <span>Mesa / zona</span>
                <input type="text" readOnly value="Barra 2" />
              </label>
              <label className="mockup-field">
                <span>Canal</span>
                <select disabled>
                  <option>Salón</option>
                </select>
              </label>
            </div>
            <ul className="fermina-menu-list" style={{ marginBottom: "0.75rem" }}>
              {[
                { name: "Bites cheddar y jalapeños", price: "8,50 €", hint: "9 uds/porción" },
                { name: "Chicken bites", price: "9,50 €", hint: "11 uds/porción" },
                { name: "Choripán", price: "7,50 €", hint: "" }
              ].map((item) => (
                <li key={item.name} className="fermina-menu-item">
                  <span>
                    <strong>{item.name}</strong>
                    {item.hint ? (
                      <span className="kpi-label" style={{ display: "block" }}>
                        {item.hint}
                      </span>
                    ) : null}
                  </span>
                  <div className="fermina-menu-item__qty">
                    <button type="button" className="btn btn-outline" disabled aria-hidden>
                      −
                    </button>
                    <span>{item.name.includes("Choripán") ? 2 : 1}</span>
                    <button type="button" className="btn btn-outline" disabled aria-hidden>
                      +
                    </button>
                    <span className="kpi-label">{item.price}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <button type="button" className="btn" disabled>
                Enviar a cocina
              </button>
              <button type="button" className="btn btn-outline" disabled>
                Facturar carrito (26,50 €)
              </button>
            </div>
          </div>

          <div>
            <h4 style={{ marginTop: 0 }}>Comandas activas</h4>
            <ul className="fermina-order-list">
              <li className="fermina-order-card">
                <div className="fermina-order-card__head">
                  <strong>#1042 · Terraza 3</strong>
                  <span className="mockup-badge">Cocina</span>
                </div>
                <p className="kpi-label" style={{ margin: "0.25rem 0" }}>
                  {MOCK_FERMINA_LINES.map((l) => `${l.qty}× ${l.name}`).join(" · ")}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>{MOCK_FERMINA_ORDER.total.toFixed(2)} €</strong>
                </p>
                <div className="fermina-order-card__actions">
                  <button type="button" className="btn btn-outline" disabled>
                    Imprimir
                  </button>
                  <button type="button" className="btn btn-outline" disabled>
                    Factura
                  </button>
                  <button type="button" className="btn btn-outline" disabled>
                    Lista
                  </button>
                </div>
              </li>
              <li className="fermina-order-card">
                <div className="fermina-order-card__head">
                  <strong>#1041 · Para llevar</strong>
                  <span className="mockup-badge">Nueva</span>
                </div>
                <p className="kpi-label" style={{ margin: "0.25rem 0" }}>
                  1× Chicken bites
                </p>
                <p style={{ margin: 0 }}>
                  <strong>9,50 €</strong>
                </p>
              </li>
            </ul>
          </div>
        </div>
      </article>

      <article className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Facturas emitidas</h3>
        <table className="mockup-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Tipo</th>
              <th>Cliente</th>
              <th>Total</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{MOCK_FERMINA_INVOICE_CLIENT.invoiceNumber}</td>
              <td>Cliente (ticket)</td>
              <td>{MOCK_FERMINA_INVOICE_CLIENT.customerName}</td>
              <td>{MOCK_FERMINA_INVOICE_CLIENT.total.toFixed(2)} €</td>
              <td>
                <button type="button" className="btn btn-outline" disabled>
                  Imprimir
                </button>
              </td>
            </tr>
            <tr>
              <td>{MOCK_FERMINA_INVOICE_GESTOR.invoiceNumber}</td>
              <td>Gestor / contabilidad</td>
              <td>{MOCK_FERMINA_INVOICE_GESTOR.customerName}</td>
              <td>{MOCK_FERMINA_INVOICE_GESTOR.total.toFixed(2)} €</td>
              <td>
                <button type="button" className="btn btn-outline" disabled>
                  Imprimir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="kpi-label" style={{ marginTop: "0.75rem" }}>
          Cliente: ticket simplificado para el comensal. Gestor: incluye CUIT y desglose IVA para contabilidad.
        </p>
      </article>

      <article className="card">
        <h3 style={{ marginTop: 0 }}>Vistas de impresión (como sale al imprimir)</h3>
        <p className="lead" style={{ fontSize: "0.9rem" }}>
          Al pulsar <strong>Imprimir</strong> en comanda o factura, el navegador abre esta hoja (logo Fermina,
          líneas y total).
        </p>
        <div className="mockup-print-grid" style={{ marginTop: "1rem" }}>
          <MockFerminaPrintSheet
            kind="comanda"
            doc={MOCK_FERMINA_ORDER}
            caption="Comanda cocina"
          />
          <MockFerminaPrintSheet
            kind="factura"
            doc={MOCK_FERMINA_INVOICE_CLIENT}
            caption="Factura cliente"
          />
          <MockFerminaPrintSheet
            kind="factura"
            doc={MOCK_FERMINA_INVOICE_GESTOR}
            caption="Factura gestor"
          />
        </div>
      </article>
    </>
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
        <AllergenPublicTable
          allergens={presentOnly}
          emptyMessage="Sin alérgenos declarados en carta."
        />
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
  comandas: { title: "Comandas y facturación", badge: "Fermina Food", extra: "Cliente + gestor" },
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
