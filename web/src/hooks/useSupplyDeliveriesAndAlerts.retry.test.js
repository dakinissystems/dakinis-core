import test from "node:test";
import assert from "node:assert/strict";

/**
 * Mirrors the filter used after a successful supply reload so Reintentar
 * clears persisted system:load-error rows from the alerts table UI.
 */
function dakinisIsPersistedSystemLoadError(row) {
  const ref = String(row?.productRef ?? row?.product_ref ?? "");
  return ref.startsWith("system:load-error:") || ref.startsWith("system:");
}

test("system load-error alerts are excluded after successful reload", () => {
  const alist = [
    { id: "1", productRef: "MT-LUBINA", title: "Stock bajo" },
    { id: "2", product_ref: "system:load-error:supply", title: "Error al cargar" },
    { id: "3", productRef: "system:other", title: "Incidencia" }
  ];
  const business = alist.filter((row) => !dakinisIsPersistedSystemLoadError(row));
  assert.deepEqual(
    business.map((r) => r.id),
    ["1"]
  );
});

test("business alerts keep product refs", () => {
  const alist = [{ id: "a", productRef: "BS-RUEDA-X6", title: "Sin movimiento" }];
  assert.equal(alist.filter((row) => !dakinisIsPersistedSystemLoadError(row)).length, 1);
});
