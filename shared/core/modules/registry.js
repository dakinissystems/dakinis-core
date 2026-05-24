/**
 * Registro de módulos extensibles del engine Dakinis One.
 * Permite activar rutas, permisos y UI por tenant/plan en fases futuras.
 */

/** @typedef {{
 *   key: string,
 *   label?: string,
 *   routes?: Array<{ method: string, path: string, handler: Function, permission?: string }>,
 *   permissions?: string[],
 *   sidebar?: Array<{ label: string, path: string, icon?: string }>,
 *   plans?: string[],
 *   verticals?: string[]
 * }} DakinisModuleDefinition
 */

const dakinisRegisteredModules = new Map();

/**
 * @param {DakinisModuleDefinition} definition
 */
export function dakinisRegisterModule(definition) {
  const key = String(definition?.key || "").trim();
  if (!key) {
    throw new Error("dakinisRegisterModule: key requerido");
  }
  if (dakinisRegisteredModules.has(key)) {
    throw new Error(`dakinisRegisterModule: modulo "${key}" ya registrado`);
  }
  dakinisRegisteredModules.set(key, {
    key,
    label: definition.label || key,
    routes: definition.routes || [],
    permissions: definition.permissions || [],
    sidebar: definition.sidebar || [],
    plans: definition.plans || ["starter", "growth", "pro"],
    verticals: definition.verticals || []
  });
  return key;
}

export function dakinisGetRegisteredModules() {
  return Array.from(dakinisRegisteredModules.values());
}

export function dakinisGetModule(key) {
  return dakinisRegisteredModules.get(String(key)) || null;
}

/** Módulos del engine ya cableados (bootstrap). */
export function dakinisBootstrapCoreModules() {
  const engineKeys = ["agenda", "booking", "crm", "whatsapp", "leads", "dashboard"];
  for (const key of engineKeys) {
    if (!dakinisRegisteredModules.has(key)) {
      dakinisRegisterModule({
        key,
        label: key,
        permissions: [`${key}:read`, `${key}:write`],
        plans:
          key === "crm" || key === "leads"
            ? ["growth", "pro"]
            : key === "whatsapp"
              ? ["pro"]
              : ["starter", "growth", "pro"]
      });
    }
  }
}

dakinisBootstrapCoreModules();
