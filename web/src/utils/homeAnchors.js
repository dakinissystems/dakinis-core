/**
 * Anclas en la home (`#precios`, `#contact`) con el router manual de la SPA.
 */
export function dakinisGoHomeAnchor(navigate, fragment) {
  const id = String(fragment).replace(/^#/, "");
  const path = window.location.pathname;
  if (path === "/" || path === "") {
    window.location.hash = id;
    return;
  }
  navigate("/");
  setTimeout(() => {
    window.location.hash = id;
  }, 16);
}
