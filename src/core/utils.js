export function dakinisDeepFreeze(value) {
  if (!value || typeof value !== "object") return value;
  Object.freeze(value);
  Object.getOwnPropertyNames(value).forEach((key) => {
    const nested = value[key];
    if (nested && typeof nested === "object" && !Object.isFrozen(nested)) {
      dakinisDeepFreeze(nested);
    }
  });
  return value;
}

export function dakinisMergeConfig(base, overrides = {}) {
  return {
    ...base,
    ...overrides,
    agenda: { ...base.agenda, ...(overrides.agenda || {}) },
    booking: { ...base.booking, ...(overrides.booking || {}) },
    crm: { ...base.crm, ...(overrides.crm || {}) },
    whatsapp: { ...base.whatsapp, ...(overrides.whatsapp || {}) },
    leads: { ...base.leads, ...(overrides.leads || {}) },
    dashboard: { ...base.dashboard, ...(overrides.dashboard || {}) }
  };
}

export function dakinisAssert(condition, message) {
  if (!condition) throw new Error(message);
}

export function dakinisToDate(value, fieldName) {
  const parsed = value instanceof Date ? value : new Date(value);
  dakinisAssert(!Number.isNaN(parsed.getTime()), `Fecha inválida en ${fieldName}`);
  return parsed;
}
