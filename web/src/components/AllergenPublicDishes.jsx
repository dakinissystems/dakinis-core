import { useCallback, useEffect, useMemo, useState } from "react";
import { dakinisSplitPublicAllergenDisplay } from "@dakinis/shared/catalog/restaurant-allergens.js";
import AllergenPublicTable from "./AllergenPublicTable.jsx";

/**
 * Cartel QR: platos en rejilla; al pulsar, modal con alérgenos del plato.
 * @param {Array} presentList — presentAllergies de la API (o derivado en cliente)
 * @param {Array} [dishes] — opcional, si la API ya envía dishes
 * @param {Array} [infoRows]
 * @param {Array} [catalogRows]
 */
export default function AllergenPublicDishes({
  presentList = [],
  dishes: dishesProp,
  infoRows: infoRowsProp,
  catalogRows: catalogRowsProp,
  t
}) {
  const [selected, setSelected] = useState(null);
  const [catalogOpen, setCatalogOpen] = useState(false);

  const split = useMemo(() => {
    if (dishesProp) {
      return {
        dishes: dishesProp,
        infoRows: infoRowsProp ?? [],
        catalogRows: catalogRowsProp ?? []
      };
    }
    return dakinisSplitPublicAllergenDisplay(presentList);
  }, [presentList, dishesProp, infoRowsProp, catalogRowsProp]);

  const { dishes, infoRows, catalogRows } = split;

  const grouped = useMemo(() => {
    const map = new Map();
    for (const d of dishes) {
      const cat = d.category || t("allergens.dishCategoryOther");
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(d);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "es"));
  }, [dishes, t]);

  const closeModal = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [selected, closeModal]);

  if (!dishes.length && !infoRows.length) {
    return (
      <p className="lead allergen-public__empty">{t("allergens.emptyDeclared")}</p>
    );
  }

  return (
    <>
      {dishes.length ? (
        <>
          <p className="allergen-public__table-title">
            <strong>{dishes.length}</strong> {dishes.length === 1 ? t("allergens.dishCountOne") : t("allergens.dishCountMany")}{" "}
            <span className="allergen-public__hint-inline">{t("allergens.dishTapHint")}</span>
          </p>

          <div className="allergen-dish-groups">
            {grouped.map(([category, items]) => (
              <section key={category} className="allergen-dish-group">
                <h2 className="allergen-dish-group__title">{category}</h2>
                <ul className="allergen-dish-grid" role="list">
                  {items.map((dish) => (
                    <li key={dish.id}>
                      <button
                        type="button"
                        className="allergen-dish-card"
                        onClick={() => setSelected(dish)}
                        aria-haspopup="dialog"
                      >
                        <span className="allergen-dish-card__name">{dish.name}</span>
                        <span className="allergen-dish-card__meta">
                          {dish.allergenTags.length
                            ? t("allergens.dishAllergenCount", { count: dish.allergenTags.length })
                            : t("allergens.dishNoAllergensShort")}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      ) : null}

      {infoRows.map((row) => (
        <aside key={row.id || row.name} className="allergen-public__info-banner" role="note">
          <strong>{row.name}</strong>
          {row.notes ? <p>{row.notes}</p> : null}
        </aside>
      ))}

      {catalogRows.length ? (
        <details
          className="allergen-public__catalog-details"
          open={catalogOpen}
          onToggle={(e) => setCatalogOpen(e.target.open)}
        >
          <summary>{t("allergens.catalogSummaryToggle")}</summary>
          <AllergenPublicTable allergens={catalogRows} />
        </details>
      ) : null}

      {selected ? (
        <div
          className="allergen-modal"
          role="presentation"
          onClick={closeModal}
        >
          <div
            className="allergen-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="allergen-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="allergen-modal__close"
              aria-label={t("allergens.modalClose")}
              onClick={closeModal}
            >
              ×
            </button>
            <p className="kicker allergen-modal__category">{selected.category}</p>
            <h2 id="allergen-modal-title" className="allergen-modal__title">
              {selected.name}
            </h2>

            {selected.allergenTags.length ? (
              <>
                <p className="allergen-modal__label">{t("allergens.modalAllergens")}</p>
                <ul className="allergen-modal__tags">
                  {selected.allergenTags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="lead allergen-modal__none">{t("allergens.dishNoAllergensShort")}</p>
            )}

            {selected.extraNotes ? (
              <p className="allergen-modal__extra">{selected.extraNotes}</p>
            ) : null}

            <button type="button" className="btn btn-outline allergen-modal__done" onClick={closeModal}>
              {t("allergens.modalClose")}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
