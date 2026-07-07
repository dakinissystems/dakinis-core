export function dakinisContactLabel(c) {
  const name = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  return name || c.displayName || c.phone || c.email || c.id;
}
