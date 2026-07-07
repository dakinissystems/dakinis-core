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
