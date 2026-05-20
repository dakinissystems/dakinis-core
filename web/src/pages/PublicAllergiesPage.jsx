import { useEffect, useMemo, useState } from "react";
import AllergenPublicTable from "../components/AllergenPublicTable.jsx";

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

  const presentList = useMemo(
    () => data?.presentAllergies ?? data?.allergies ?? [],
    [data]
  );

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

        <article className="card allergen-public__card">
          {presentList.length ? (
            <>
              <p className="allergen-public__table-title">
                <strong>{presentList.length}</strong> alérgeno{presentList.length === 1 ? "" : "s"} declarado
                {presentList.length === 1 ? "" : "s"} en carta
              </p>
              <AllergenPublicTable allergens={presentList} />
            </>
          ) : (
            <AllergenPublicTable
              allergens={[]}
              emptyMessage="Este establecimiento no ha declarado alérgenos presentes en carta. Pregunta al personal."
            />
          )}
        </article>

        <p className="kpi-label allergen-public__footer">
          Referencia: 14 alérgenos obligatorios (UE). Solo se listan los marcados como presentes por el
          restaurante.
        </p>
      </div>
    </section>
  );
}
