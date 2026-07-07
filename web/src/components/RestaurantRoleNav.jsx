import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisWriteRestaurantRole } from "../utils/restaurantRoleStorage.js";

const ROLES = [
  { id: "camarero", labelKey: "restaurant.roleWaiter" },
  { id: "cocina", labelKey: "restaurant.roleKitchen" },
  { id: "admin", labelKey: "restaurant.roleAdmin" }
];

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
          onClick={() => {
            dakinisWriteRestaurantRole(id);
            onRoleChange(id);
          }}
        >
          {t(labelKey)}
        </button>
      ))}
    </nav>
  );
}
