/** Rutas públicas donde mostramos el FAB de contacto WhatsApp (no en app autenticada). */
export function dakinisShouldShowPublicWhatsappFab(pathname) {
  const path = String(pathname || "");
  if (!path || path === "/") return true;
  if (path.startsWith("/app/")) return false;
  if (path.startsWith("/admin")) return false;
  if (path === "/login" || path.startsWith("/forgot-password") || path.startsWith("/reset-password")) {
    return false;
  }
  if (path.startsWith("/portal/")) return false;
  if (path.startsWith("/ecosystem/")) return false;
  return true;
}
