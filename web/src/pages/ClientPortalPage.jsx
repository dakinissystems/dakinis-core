import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { useClientPortal } from "../hooks/useClientPortal.js";

function ClientPortalContent({ slug }) {
  const { portal, error } = useClientPortal(slug);

  if (error) {
    return (
      <section className="modules">
        <div className="container">
          <h2>Portal cliente</h2>
          <p className="lead">{error}</p>
        </div>
      </section>
    );
  }

  if (!portal) {
    return (
      <section className="modules">
        <div className="container">
          <p className="lead">Portal no disponible</p>
        </div>
      </section>
    );
  }

  return (
    <section className="modules">
      <div className="container">
        <p className="kicker">Portal cliente</p>
        <h2>{portal.name}</h2>
        <p className="lead">{portal.welcomeText}</p>
        <div className="card">
          <h3>Servicios disponibles</h3>
          <ul>
            {(portal.features || []).map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="lead" style={{ marginTop: "1rem" }}>
            Reservas, pedidos y facturas: próximamente en esta URL pública (
            <code>cliente.{portal.slug}.dakinissystems.com</code> o <code>/portal/{portal.slug}</code>).
          </p>
        </div>
      </div>
    </section>
  );
}

export default function ClientPortalPage() {
  const { slug } = useParams();

  if (!slug) {
    return (
      <section className="modules">
        <div className="container">
          <p className="lead">Portal no disponible</p>
        </div>
      </section>
    );
  }

  return (
    <Suspense
      fallback={
        <section className="modules">
          <div className="container">
            <p className="lead">Cargando portal…</p>
          </div>
        </section>
      }
    >
      <ClientPortalContent slug={slug} />
    </Suspense>
  );
}
