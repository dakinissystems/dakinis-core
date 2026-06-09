/**
 * Navegación a precios/contacto (página dedicada `/precios`).
 */
export function dakinisGoPricing(navigate, fragment) {
  const id = String(fragment || "").replace(/^#/, "");
  if (id === "contact") {
    navigate("/precios#contact");
    return;
  }
  navigate("/precios");
}

/** @deprecated Usar `dakinisGoPricing`. */
export function dakinisGoHomeAnchor(navigate, fragment) {
  dakinisGoPricing(navigate, fragment);
}
