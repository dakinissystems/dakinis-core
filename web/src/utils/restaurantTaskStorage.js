/** Tareas operativas del vertical hostelería (navegación UI; no RBAC). */
export const DAKINIS_RESTAURANT_TASKS = [
  "sala",
  "cocina",
  "inventario",
  "delivery",
  "caja",
  "config"
];

const TASK_KEY = "dakinis-restaurant-task";
const CTX_KEY = "dakinis-restaurant-module-ctx";
const LEGACY_ROLE_KEY = "dakinis-restaurant-role";

/** Aliases de URL → tarea canónica. */
export const DAKINIS_RESTAURANT_TASK_ALIASES = {
  floor: "sala",
  sala: "sala",
  mesas: "sala",
  kitchen: "cocina",
  cocina: "cocina",
  stock: "inventario",
  inventario: "inventario",
  inventory: "inventario",
  lots: "inventario",
  lotes: "inventario",
  delivery: "delivery",
  cash: "caja",
  caja: "caja",
  cierre: "caja",
  config: "config",
  allergens: "config",
  alergenos: "config",
  menu: "config"
};

const ROLE_TO_TASK = {
  camarero: "sala",
  cocina: "cocina",
  admin: "config"
};

export function dakinisNormalizeRestaurantTask(raw) {
  const key = String(raw || "")
    .trim()
    .toLowerCase();
  const mapped = DAKINIS_RESTAURANT_TASK_ALIASES[key];
  if (mapped && DAKINIS_RESTAURANT_TASKS.includes(mapped)) return mapped;
  if (DAKINIS_RESTAURANT_TASKS.includes(key)) return key;
  return null;
}

function dakinisMigrateLegacyRole() {
  try {
    const role = localStorage.getItem(LEGACY_ROLE_KEY);
    const task = ROLE_TO_TASK[role];
    if (task) {
      localStorage.setItem(TASK_KEY, task);
      return task;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function dakinisReadRestaurantTask() {
  try {
    const v = localStorage.getItem(TASK_KEY);
    const normalized = dakinisNormalizeRestaurantTask(v);
    if (normalized) return normalized;
    const migrated = dakinisMigrateLegacyRole();
    if (migrated) return migrated;
  } catch {
    /* ignore */
  }
  return "sala";
}

export function dakinisWriteRestaurantTask(task) {
  const normalized = dakinisNormalizeRestaurantTask(task) || "sala";
  try {
    localStorage.setItem(TASK_KEY, normalized);
  } catch {
    /* ignore */
  }
  return normalized;
}

/** @returns {Record<string, Record<string, string>>} */
export function dakinisReadRestaurantModuleContext() {
  try {
    const raw = localStorage.getItem(CTX_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function dakinisWriteRestaurantModuleContext(task, patch) {
  const normalized = dakinisNormalizeRestaurantTask(task);
  if (!normalized || !patch || typeof patch !== "object") return;
  try {
    const all = dakinisReadRestaurantModuleContext();
    all[normalized] = { ...(all[normalized] || {}), ...patch };
    localStorage.setItem(CTX_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function dakinisParseRestaurantTaskQuery(rawTask, rawSub) {
  const key = String(rawTask || "")
    .trim()
    .toLowerCase();
  const subIn = String(rawSub || "")
    .trim()
    .toLowerCase();
  const task = dakinisNormalizeRestaurantTask(key) || null;
  let sub = subIn;

  if (key === "stock" || key === "inventory") sub = sub || "scan";
  if (key === "lots" || key === "lotes") sub = "lots";
  if (key === "allergens" || key === "alergenos") sub = "allergens";
  if (key === "menu") sub = sub || "menu";

  return { task, sub };
}

export function dakinisRestaurantTaskPath(vertical, task, extras = {}) {
  const params = new URLSearchParams();
  const normalized = dakinisNormalizeRestaurantTask(task);
  if (normalized) params.set("task", normalized);
  if (extras.sub) params.set("sub", String(extras.sub));
  if (extras.mode) params.set("mode", String(extras.mode));
  const q = params.toString();
  return `/sistema/${encodeURIComponent(vertical || "restaurante")}${q ? `?${q}` : ""}`;
}
