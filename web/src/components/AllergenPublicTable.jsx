import { useMemo } from "react";

const EMPTY_ALLERGENS = [];

/**
 * Tabla pública de alérgenos marcados como presentes (vista QR / cartel).
 * @param {Array<{ catalogId?: string, id?: string, name: string, category?: string, notes?: string, hint?: string }>} allergens
 */
export default function AllergenPublicTable({ allergens = EMPTY_ALLERGENS, emptyMessage }) {
  const rows = useMemo(
    () =>
      allergens.toSorted(
        (a, b) =>
          (a.category || "").localeCompare(b.category || "", "es") ||
          (a.name || "").localeCompare(b.name || "", "es")
      ),
    [allergens]
  );

  if (!rows.length) {
    return emptyMessage ? <p className="lead allergen-public__empty">{emptyMessage}</p> : null;
  }

  return (
    <div className="allergen-public__table-wrap">
      <table className="allergen-public__table">
        <caption className="sr-only">Alérgenos presentes en carta o cocina</caption>
        <thead>
          <tr>
            <th scope="col">Alérgeno</th>
            <th scope="col">Categoría</th>
            <th scope="col">Dónde aparece</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.catalogId || a.id || a.name}>
              <td data-label="Alérgeno">
                <strong>{a.name}</strong>
              </td>
              <td data-label="Categoría">{a.category || "—"}</td>
              <td data-label="Dónde aparece">{a.notes?.trim() || a.hint?.trim() || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
