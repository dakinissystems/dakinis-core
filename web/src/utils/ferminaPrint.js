/**
 * Espera a que las imágenes del bloque de impresión estén cargadas y activa modo print en <html>.
 */
export function dakinisFerminaPrint(printRoot) {
  const root =
    printRoot ?? document.querySelector(".fermina-print-host, .fermina-print-sheet");

  const waitImages = root
    ? Promise.all(
        [...root.querySelectorAll("img")].map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete && img.naturalWidth > 0) {
                resolve();
                return;
              }
              const done = () => resolve();
              img.addEventListener("load", done, { once: true });
              img.addEventListener("error", done, { once: true });
            })
        )
      )
    : Promise.resolve();

  return waitImages.then(() => {
    document.documentElement.classList.add("fermina-print-mode");
    const cleanup = () => document.documentElement.classList.remove("fermina-print-mode");
    window.addEventListener("afterprint", cleanup, { once: true });
    window.print();
  });
}
