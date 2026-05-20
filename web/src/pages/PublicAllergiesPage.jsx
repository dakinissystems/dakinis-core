import { useEffect, useMemo, useState } from "react";

export default function PublicAllergiesPage({ token }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setError("");
      try {
        const res = await fetch(`/api/public/restaurant/${encodeURIComponent(token)}/allergies`, {
          signal: controller.signal
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error?.message || "No disponible");
        }
        setData(json.data);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Error al cargar");
      }
    }
    load();
    return () => controller.abort();
  }, [token]);

  const byCategory = useMemo(() => {
    const list = data?.presentAllergies ?? data?.allergies ?? [];
    const groups = new Map();
    for (const a of list) {
      const cat = a.category || "Otros";
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(a);
    }
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [data]);

  if (error) {
    return (
      <section className="modules allergen-public">
        <div className="container">
          <h2>Información de alergias</h2>
          <p className="lead allergen-public__error">{error}</p>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="modules allergen-public">
        <div className="container">
          <p className="lead">Cargando…</p>
        </div>
      </section>
    );
  }

  const presentList = data.presentAllergies ?? data.allergies ?? [];

  return (
    <section className="modules allergen-public">
      <div className="container allergen-public__inner">
        <p className="kicker">Cartel digital</p>
        <h1>{data.venueName}</h1>
        <p className="lead">
          Alérgenos e ingredientes <strong>presentes</strong> en nuestra carta o cocina. Consulta con el
          personal antes de pedir.
        </p>
        <p className="kpi-label">
          Actualizado: {data.updatedAt ? new Date(data.updatedAt).toLocaleString("es-ES") : "—"}
        </p>

        {presentList.length ? (
          <div className="allergen-public__list">
            {byCategory.map(([category, items]) => (
              <section key={category} className="card allergen-public__group">
                <h2 className="allergen-public__category">{category}</h2>
                <ul>
                  {items.map((a) => (
                    <li key={a.catalogId || a.id || a.name} className="allergen-public__item">
                      <strong>{a.name}</strong>
                      {a.notes ? <span className="allergen-public__notes"> — {a.notes}</span> : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <p className="lead card" style={{ padding: "1.25rem" }}>
            Este establecimiento no ha declarado alérgenos presentes en carta. Pregunta al personal.
          </p>
        )}

        <p className="kpi-label allergen-public__footer">
          Referencia: 14 alérgenos obligatorios (UE). Solo se listan los marcados como presentes por el
          restaurante.
        </p>
      </div>
    </section>
  );
}
