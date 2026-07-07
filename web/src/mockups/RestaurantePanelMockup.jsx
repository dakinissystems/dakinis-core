import { useMemo, useRef, useState } from "react";
import {
  DAKINIS_RESTAURANT_ALLERGEN_CATALOG,
  DAKINIS_RESTAURANT_EXTRA_ALLERGENS
} from "@dakinis/shared/catalog/restaurant-allergens.js";
import AllergenPublicTable from "../components/AllergenPublicTable.jsx";
import RestaurantRoleNav from "../components/RestaurantRoleNav.jsx";
import { dakinisReadRestaurantRole, dakinisWriteRestaurantRole } from "../utils/restaurantRoleStorage.js";
import { useLocale } from "../context/LocaleContext.jsx";
import MockupSidebarNav from "./MockupSidebarNav.jsx";
import MockupToolbar from "./MockupToolbar.jsx";
import { dakinisMockupTabList, dakinisMockupToolbar } from "./mockupPanelHelpers.js";
import PanelComandas from "./RestaurantePanelComandasMock.jsx";


const TAB_IDS = ["mapa", "reservas", "espera", "comandas", "clientes", "alergenos", "proveedores"];

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

function PanelMapa() {
  return (
    <>
      <div className="two-col mockup-panel-spaced">
        <article className="card">
          <h3 style={{ marginTop: 0 }}>Plan de sala (esquema)</h3>
          <div className="mockup-zone-grid">
            <div className="mockup-zone-cell">
              Terraza 1â€“5
              <div style={{ marginTop: "0.35rem", color: "var(--brand)" }}>Demo en Comandas â†’ Mesas</div>
            </div>
            <div className="mockup-zone-cell">
              SalÃ³n 1â€“5
              <div style={{ marginTop: "0.35rem", color: "var(--brand)" }}>Cuenta y cierre por mesa</div>
            </div>
            <div className="mockup-zone-cell">
              Lista espera
              <div style={{ marginTop: "0.35rem" }}>3 grupos</div>
            </div>
          </div>
        </article>
        <article className="card">
          <h3 style={{ marginTop: 0 }}>Resumen</h3>
          <div className="system-kpis system-kpis--pair">
            <div>
              <p className="kpi-label">Confirmadas WhatsApp</p>
              <p className="kpi-value" style={{ fontSize: "1.4rem" }}>
                38
              </p>
            </div>
            <div>
              <p className="kpi-label">No-show Ãºltimos 7d</p>
              <p className="kpi-value" style={{ fontSize: "1.4rem" }}>
                2%
              </p>
            </div>
          </div>
        </article>
      </div>

      <article className="card mockup-table-card">
        <h3 style={{ marginTop: 0 }}>PrÃ³ximas mesas</h3>
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
              <td>Sin gluten Â· confirmado WA</td>
            </tr>
            <tr>
              <td>21:00</td>
              <td>Interior 2</td>
              <td>LucÃ­a Ortega</td>
              <td>2</td>
              <td>Aniversario</td>
            </tr>
            <tr>
              <td>21:30</td>
              <td>Terraza 1</td>
              <td>Grupo empresa</td>
              <td>8</td>
              <td>MenÃº degustaciÃ³n</td>
            </tr>
          </tbody>
        </table>
      </article>
    </>
  );
}

function PanelReservas() {
  return (
    <article className="card mockup-table-card">
      <h3 style={{ marginTop: 0 }}>Todas las reservas â€” servicio noche</h3>
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
          Familia PÃ©rez Â· 4 pax Â· esperando desde 20:10 Â· aviso WA enviado
        </li>
        <li style={{ marginBottom: "0.5rem" }}>Pareja Â· 2 pax Â· preferencia terraza</li>
        <li>Grupo 5 pax Â· interior si libera I6</li>
      </ol>
    </article>
  );
}


function PanelAlergenosCartel() {
  const { t } = useLocale();
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
        <h3 style={{ marginTop: 0 }}>AlÃ©rgenos e intolerancias (carta / cocina)</h3>
        <p className="lead" style={{ fontSize: "0.9rem" }}>
          Lista de referencia â€” <strong>14 alÃ©rgenos obligatorios UE</strong> + extras. Marca{" "}
          <strong>SÃ­ hay</strong> si el alÃ©rgeno estÃ¡ en vuestro menÃº o cocina; el cartel QR solo muestra los
          marcados.
        </p>
        <p className="allergen-panel__summary">
          <span className="allergen-panel__badge">{presentCount}</span> marcados como presentes Â· 14 obligatorios
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
                      <span className="allergen-row__state">{item.present ? "SÃ­ hay" : "No hay"}</span>
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
            {t("mockupPanels.demoBadge")}
          </span>
        </div>

        <div className="allergen-panel__qr">
          <img src={qrUrl} width={140} height={140} alt="QR alergias" />
          <div>
            <p className="lead" style={{ fontSize: "0.9rem", margin: 0 }}>
              {t("mockupPanels.restaurante.allergenQrHint")}
            </p>
            <p className="kpi-label">Solo alÃ©rgenos marcados Â«SÃ­ hayÂ»</p>
          </div>
        </div>
      </article>

      <article className="card" style={{ marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Vista del comensal</h3>
        <p className="lead" style={{ fontSize: "0.9rem" }}>
          {t("mockupPanels.restaurante.allergenPublicLead")}
        </p>
        <p className="kicker" style={{ marginBottom: "0.5rem" }}>
          Carta de alÃ©rgenos
        </p>
        <AllergenPublicTable
          allergens={presentOnly}
          emptyMessage="Sin alÃ©rgenos declarados en carta."
        />
      </article>
    </>
  );
}

function PanelClientes() {
  return (
    <article className="card mockup-table-card">
      <h3 style={{ marginTop: 0 }}>Alergias por comensal (reserva)</h3>
      <p className="lead" style={{ fontSize: "0.85rem", marginTop: 0 }}>
        Notas de sala para esta noche â€” distinto del{" "}
        <strong>cartel legal de alÃ©rgenos</strong> (pestaÃ±a Cartel alÃ©rgenos).
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
            <td>T4 Â· 20:00</td>
            <td>Pablo Vega</td>
            <td>Sin gluten</td>
          </tr>
          <tr>
            <td>I5 Â· 20:45</td>
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
          <li>Mariscos Costa â€” maÃ±ana 07:00</li>
          <li>Vinos Sur â€” miÃ©rcoles</li>
        </ul>
      </article>
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Incidencias stock</h3>
        <p className="lead" style={{ fontSize: "0.9rem", margin: 0 }}>
          Aceite premium â€” pedido mÃ­nimo no alcanzado; combinar con pedido de bar.
        </p>
      </article>
    </div>
  );
}

export default function RestaurantePanelMockup() {
  const { t } = useLocale();
  const [tab, setTab] = useState("mapa");
  const [panelRole, setPanelRole] = useState(dakinisReadRestaurantRole);
  const tabs = dakinisMockupTabList(t, "restaurante", TAB_IDS);
  const visibleTabs = tabs.filter((item) => panelRole === "admin" || item.id !== "proveedores");
  const tb = dakinisMockupToolbar(t, "restaurante", tab);

  return (
    <div className="mockup-app">
      <aside className="mockup-sidebar">
        <div className="mockup-sidebar-brand">{t("mockupPanels.restaurante.brand")}</div>
        <MockupSidebarNav tabs={visibleTabs} activeId={tab} onSelect={setTab} />
      </aside>
      <div className="mockup-main">
        <MockupToolbar title={tb.title} badge={tb.badge} roleKey={tb.roleKey} extra={tb.extra} />
        <RestaurantRoleNav
          role={panelRole}
          onRoleChange={(next) => {
            setPanelRole(next);
            dakinisWriteRestaurantRole(next);
            if (next !== "admin" && tab === "proveedores") setTab("comandas");
          }}
        />
        {tab === "mapa" ? <PanelComandas panelRole={panelRole === "cocina" ? "camarero" : panelRole} mesasOnly /> : null}
        {tab === "reservas" ? <PanelReservas /> : null}
        {tab === "espera" ? <PanelEspera /> : null}
        {tab === "comandas" ? <PanelComandas panelRole={panelRole} /> : null}
        {tab === "clientes" ? <PanelClientes /> : null}
        {tab === "alergenos" ? <PanelAlergenosCartel /> : null}
        {tab === "proveedores" ? <PanelProveedores /> : null}
      </div>
    </div>
  );
}
