const KEY = "dakinis-visual-density";
const VALUES = new Set(["compact", "normal", "comfortable"]);

export function dakinisReadVisualDensity() {
  try {
    const value = localStorage.getItem(KEY);
    return VALUES.has(value) ? value : "normal";
  } catch {
    return "normal";
  }
}

export function dakinisApplyVisualDensity(value = dakinisReadVisualDensity()) {
  const next = VALUES.has(value) ? value : "normal";
  document.documentElement.dataset.density = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* ignore quota */
  }
  return next;
}
