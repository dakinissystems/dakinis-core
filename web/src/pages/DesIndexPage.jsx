import { Link } from "react-router-dom";
import { Card, Badge } from "@dakinis/shared-ux";

/** Solo DEV — índice de demos DES. */
export default function DesIndexPage() {
  return (
    <div className="modules" style={{ padding: "1.5rem 0 3rem", maxWidth: 720, margin: "0 auto" }}>
      <p className="kicker">DES · DEV</p>
      <h1>Demos Design System</h1>
      <p className="lead">Referencia visual local (no expuesto en producción).</p>
      <div style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
        <Card>
          <Badge tone="accent">B3</Badge>
          <h2 style={{ margin: "0.5rem 0" }}>
            <Link to="/__des/motion">Motion &amp; Elevation</Link>
          </h2>
          <p className="lead" style={{ margin: 0 }}>
            Tokens de duración, elevación y clases utilitarias.
          </p>
        </Card>
        <Card>
          <Badge tone="accent">B4</Badge>
          <h2 style={{ margin: "0.5rem 0" }}>
            <Link to="/__des/patterns">Dashboard / Chat / Forms</Link>
          </h2>
          <p className="lead" style={{ margin: 0 }}>
            Patrones de página reutilizables entre productos.
          </p>
        </Card>
        <Card>
          <Badge tone="accent">B5</Badge>
          <h2 style={{ margin: "0.5rem 0" }}>
            <Link to="/__des/theme">Apariencia &amp; High-contrast</Link>
          </h2>
          <p className="lead" style={{ margin: 0 }}>
            System default · HC QA checklist · ColorModeControl.
          </p>
        </Card>
      </div>
    </div>
  );
}
