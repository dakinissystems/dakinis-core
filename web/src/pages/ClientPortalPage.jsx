import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ClientPortalPage() {
  const { slug } = useParams();
  const [portal, setPortal] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/public/portal/${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json?.ok) throw new Error(json?.error?.message || "Portal no disponible");
        setPortal(json.data?.portal || null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  }, [slug]);

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
          <p className="lead">Cargando portal…</p>
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
            <code>cliente.{portal.slug}.dakinissystems.com</code> o{" "}
            <code>/portal/{portal.slug}</code>).
          </p>
        </div>
      </div>
    </section>
  );
}
