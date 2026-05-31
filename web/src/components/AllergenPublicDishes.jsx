import { useCallback, useEffect, useMemo, useState } from "react";
import {
  dakinisEnrichPublicDishesList,
  dakinisFormatPublicDishName,
  dakinisSplitPublicAllergenDisplay
} from "@dakinis/shared/catalog/restaurant-allergens.js";
import { dakinisResolveMushroomSelection } from "@dakinis/shared/catalog/restaurant-mushrooms.js";
import AllergenPublicTable from "./AllergenPublicTable.jsx";

function dakinisNormalizeSearch(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

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
  const [searchQuery, setSearchQuery] = useState("");

  const split = useMemo(() => {
    if (dishesProp) {
      return {
        dishes: dakinisEnrichPublicDishesList(dishesProp),
        infoRows: infoRowsProp ?? [],
        catalogRows: catalogRowsProp ?? []
      };
    }
    return dakinisSplitPublicAllergenDisplay(presentList);
  }, [presentList, dishesProp, infoRowsProp, catalogRowsProp]);

  const { dishes, infoRows, catalogRows } = split;

  useEffect(() => {
    if (!dishes.length && !infoRows.length && catalogRows.length) {
      setCatalogOpen(true);
    }
  }, [dishes.length, infoRows.length, catalogRows.length]);

  const searchNorm = useMemo(() => dakinisNormalizeSearch(searchQuery.trim()), [searchQuery]);

  const filteredDishes = useMemo(() => {
    if (!searchNorm) return dishes;
    return dishes.filter((d) => {
      const label = d.displayName || dakinisFormatPublicDishName(d.name);
      const name = dakinisNormalizeSearch(label);
      const raw = dakinisNormalizeSearch(d.name);
      return name.includes(searchNorm) || raw.includes(searchNorm);
    });
  }, [dishes, searchNorm]);

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

  if (!dishes.length && !infoRows.length && !catalogRows.length) {
    return (
      <p className="lead allergen-public__empty">{t("allergens.emptyDeclared")}</p>
    );
  }

  return (
    <>
      {dishes.length ? (
        <>
          <div className="allergen-public__search">
            <label className="sr-only" htmlFor="allergen-dish-search">
              {t("allergens.dishSearchLabel")}
            </label>
            <input
              id="allergen-dish-search"
              type="search"
              className="allergen-public__search-input"
              placeholder={t("allergens.dishSearchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              enterKeyHint="search"
            />
            {searchQuery ? (
              <button
                type="button"
                className="allergen-public__search-clear"
                aria-label={t("allergens.dishSearchClear")}
                onClick={() => setSearchQuery("")}
              >
                ×
              </button>
            ) : null}
          </div>

          <p className="allergen-public__table-title">
            {searchNorm ? (
              <>
                <strong>{filteredDishes.length}</strong>{" "}
                {t("allergens.dishSearchResults", { total: dishes.length })}
              </>
            ) : (
              <>
                <strong>{dishes.length}</strong>{" "}
                {dishes.length === 1 ? t("allergens.dishCountOne") : t("allergens.dishCountMany")}
              </>
            )}{" "}
            <span className="allergen-public__hint-inline">{t("allergens.dishTapHint")}</span>
          </p>

          {searchNorm && !filteredDishes.length ? (
            <p className="lead allergen-public__search-empty" role="status">
              {t("allergens.dishSearchNoMatch", { query: searchQuery.trim() })}
            </p>
          ) : null}

          <ul className="allergen-dish-grid allergen-dish-grid--flat" role="list">
            {filteredDishes.map((dish) => {
              const label = dish.displayName || dakinisFormatPublicDishName(dish.name);
              return (
                <li key={dish.id}>
                  <button
                    type="button"
                    className="allergen-dish-card"
                    onClick={() => setSelected({ ...dish, displayName: label })}
                    aria-haspopup="dialog"
                  >
                    <span className="allergen-dish-card__name">{label}</span>
                    <span className="allergen-dish-card__meta">
                      {dish.allergenTags.length
                        ? t("allergens.dishAllergenCount", { count: dish.allergenTags.length })
                        : t("allergens.dishNoAllergensShort")}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      {infoRows.map((row) => {
        const mushroomTags = dakinisResolveMushroomSelection(row.mushroomTypes, row.notes);
        const notesTail = row.notes?.includes(". ")
          ? row.notes.split(/\.\s+/).slice(1).join(". ")
          : "";
        return (
          <aside key={row.id || row.name} className="allergen-public__info-banner" role="note">
            <strong>{row.name}</strong>
            {mushroomTags.length ? (
              <ul className="allergen-modal__tags allergen-public__info-tags">
                {mushroomTags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            ) : null}
            {notesTail ? <p>{notesTail}</p> : !mushroomTags.length && row.notes ? <p>{row.notes}</p> : null}
          </aside>
        );
      })}

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
            <h2 id="allergen-modal-title" className="allergen-modal__title">
              {selected.displayName || dakinisFormatPublicDishName(selected.name)}
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

            {selected.mushroomTags?.length ? (
              <>
                <p className="allergen-modal__label">{t("allergens.modalMushrooms")}</p>
                <ul className="allergen-modal__tags">
                  {selected.mushroomTags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {selected.extraNotes && !selected.mushroomTags?.length ? (
              <p className="allergen-modal__extra">{selected.extraNotes}</p>
            ) : selected.extraNotes && selected.mushroomTags?.length ? (
              <p className="allergen-modal__extra allergen-modal__extra--muted">
                {selected.extraNotes.replace(/Hongos que pueden estar presentes:[^.]+\.\s*/i, "").trim()}
              </p>
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
