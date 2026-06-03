import { useLocale } from "../context/LocaleContext.jsx";

const ROLES = [
  { id: "camarero", labelKey: "restaurant.roleWaiter" },
  { id: "cocina", labelKey: "restaurant.roleKitchen" },
  { id: "admin", labelKey: "restaurant.roleAdmin" }
];

const STORAGE_KEY = "dakinis-restaurant-role";

export function dakinisReadRestaurantRole() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "admin" || v === "cocina" || v === "camarero") return v;
  } catch {
    /* ignore */
  }
  return "camarero";
}

export function dakinisWriteRestaurantRole(role) {
  try {
    localStorage.setItem(STORAGE_KEY, role);
  } catch {
    /* ignore */
  }
}

/** Selector de vista: camareros · cocina · administración. */
export default function RestaurantRoleNav({ role, onRoleChange }) {
  const { t } = useLocale();

  return (
    <nav className="restaurant-role-nav" aria-label={t("restaurant.roleNav")}>
      {ROLES.map(({ id, labelKey }) => (
        <button
          key={id}
          type="button"
          className={`btn${role === id ? "" : " btn-outline"}`}
          aria-pressed={role === id}
          onClick={() => onRoleChange(id)}
        >
          {t(labelKey)}
        </button>
      ))}
    </nav>
  );
}
