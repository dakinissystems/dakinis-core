import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import { DAKINIS_VISTA_MOCKUPS } from "../mockups/index.js";

const dakinisSystemRegistry = dakinisGetSystemRegistry();

export default function VistaMockupPage({ verticalKey, navigate }) {
  const Mockup = DAKINIS_VISTA_MOCKUPS[verticalKey] ?? DAKINIS_VISTA_MOCKUPS.clinica;
  const label = dakinisSystemRegistry[verticalKey]?.label ?? "Clínica";

  return (
    <section className="mockup-page-wrap">
      <div className="container mockup-page-bar">
        <div>
          <p className="kicker">Vista previa · solo maquetación</p>
          <h2 style={{ margin: "0.25rem 0 0" }}>Panel tipo app — {label}</h2>
          <p className="lead" style={{ margin: "0.35rem 0 0" }}>
            Ejemplo visual de cómo podría verse el programa en este tipo de negocio; no persiste datos ni llama a la API.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/")}>
            Inicio
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => navigate(`/sistema/${encodeURIComponent(verticalKey)}`)}
          >
            Ir al sistema demo
          </button>
        </div>
      </div>
      <div className="mockup-page-frame">
        <Mockup />
      </div>
    </section>
  );
}
