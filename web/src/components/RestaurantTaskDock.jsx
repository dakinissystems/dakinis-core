import { useLocale } from "../context/LocaleContext.jsx";
import {
  DAKINIS_RESTAURANT_TASKS,
  dakinisWriteRestaurantTask
} from "../utils/restaurantTaskStorage.js";

const TASK_META = {
  sala: { icon: "🏠", labelKey: "restaurant.taskSala" },
  cocina: { icon: "👨‍🍳", labelKey: "restaurant.taskCocina" },
  inventario: { icon: "📦", labelKey: "restaurant.taskInventario" },
  delivery: { icon: "🚚", labelKey: "restaurant.taskDelivery" },
  caja: { icon: "💶", labelKey: "restaurant.taskCaja" },
  config: { icon: "⚙️", labelKey: "restaurant.taskConfig" }
};

/**
 * Dock persistente por tarea (desktop arriba / móvil abajo vía CSS).
 * @param {{
 *   task: string,
 *   onTaskChange: (task: string) => void,
 *   badges?: Record<string, string|number|null|undefined>
 * }} props
 */
export default function RestaurantTaskDock({ task, onTaskChange, badges = {} }) {
  const { t } = useLocale();

  return (
    <nav className="restaurant-task-dock" aria-label={t("restaurant.taskNav")}>
      <ul className="restaurant-task-dock__list">
        {DAKINIS_RESTAURANT_TASKS.map((id) => {
          const meta = TASK_META[id];
          const badge = badges[id];
          const active = task === id;
          return (
            <li key={id}>
              <button
                type="button"
                className={`restaurant-task-dock__btn${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
                aria-pressed={active}
                onClick={() => {
                  dakinisWriteRestaurantTask(id);
                  onTaskChange(id);
                }}
              >
                <span className="restaurant-task-dock__icon" aria-hidden="true">
                  {meta.icon}
                </span>
                <span className="restaurant-task-dock__label">{t(meta.labelKey)}</span>
                {badge != null && badge !== "" && Number(badge) !== 0 ? (
                  <span className="restaurant-task-dock__badge">{badge}</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
