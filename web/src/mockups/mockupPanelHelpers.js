/** Tabs y toolbar de mockups desde locales (mockupPanels.{vertical}). */
export function dakinisMockupTabList(t, vertical, tabIds) {
  return tabIds.map((id) => ({
    id,
    label: t(`mockupPanels.${vertical}.tabs.${id}`)
  }));
}

function dakinisLocaleOrEmpty(t, key) {
  const val = t(key);
  return typeof val === "string" && val.startsWith("mockupPanels.") ? "" : val;
}

export function dakinisMockupToolbar(t, vertical, tabId) {
  const base = `mockupPanels.${vertical}.toolbar.${tabId}`;
  const extra = dakinisLocaleOrEmpty(t, `${base}.extra`);
  const roleKey = dakinisLocaleOrEmpty(t, `${base}.role`) || "owner";
  return {
    title: t(`${base}.title`),
    badge: t(`${base}.badge`),
    extra: extra || undefined,
    roleKey
  };
}
