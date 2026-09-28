import { useEffect } from "react";
import { useLocale } from "../context/LocaleContext.jsx";
import {
  DAKINIS_RESTAURANT_TASKS,
  dakinisWriteRestaurantTask
} from "../utils/restaurantTaskStorage.js";

const TASK_META = {
  sala: { icon: "🍽", labelKey: "restaurant.taskSala", shortcut: "1" },
  cocina: { icon: "👨‍🍳", labelKey: "restaurant.taskCocina", shortcut: "2" },
  inventario: { icon: "📦", labelKey: "restaurant.taskInventario", shortcut: "3" },
  delivery: { icon: "🚚", labelKey: "restaurant.taskDelivery", shortcut: "4" },
  caja: { icon: "💶", labelKey: "restaurant.taskCaja", shortcut: "5" },
  config: { icon: "⚙", labelKey: "restaurant.taskConfig", shortcut: "6" }
};

/**
 * Command Dock — navegación por tarea + badges semánticos + Alt+1…6.
 * badges[id] = number | string | { value, tone: 'attention'|'warn'|'activity' }
 */
export default function RestaurantTaskDock({ task, onTaskChange, badges = {} }) {
  const { t } = useLocale();

  useEffect(() => {
    function onKey(e) {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const target = e.target;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      const idx = Number(e.key);
      if (!Number.isFinite(idx) || idx < 1 || idx > DAKINIS_RESTAURANT_TASKS.length) return;
      e.preventDefault();
      const next = DAKINIS_RESTAURANT_TASKS[idx - 1];
      dakinisWriteRestaurantTask(next);
      onTaskChange(next);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onTaskChange]);

  return (
    <nav className="restaurant-task-dock" aria-label={t("restaurant.taskNav")}>
      <ul className="restaurant-task-dock__list">
        {DAKINIS_RESTAURANT_TASKS.map((id) => {
          const meta = TASK_META[id];
          const raw = badges[id];
          const value = raw && typeof raw === "object" ? raw.value : raw;
          const tone = raw && typeof raw === "object" ? raw.tone || "activity" : "activity";
          const showBadge = value != null && value !== "" && Number(value) !== 0;
          const active = task === id;
          return (
            <li key={id}>
              <button
                type="button"
                className={`restaurant-task-dock__btn${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
                aria-pressed={active}
                title={`${t(meta.labelKey, id)} (Alt+${meta.shortcut})`}
                onClick={() => {
                  dakinisWriteRestaurantTask(id);
                  onTaskChange(id);
                }}
              >
                <span className="restaurant-task-dock__icon" aria-hidden="true">
                  {meta.icon}
                </span>
                <span className="restaurant-task-dock__label">{t(meta.labelKey, id)}</span>
                {showBadge ? (
                  <span
                    className={`restaurant-task-dock__badge restaurant-task-dock__badge--${tone}`}
                    key={`${id}-${value}`}
                  >
                    {value}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
