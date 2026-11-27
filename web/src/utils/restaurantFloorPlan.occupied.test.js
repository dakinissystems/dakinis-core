import test from "node:test";
import assert from "node:assert/strict";
import { dakinisTableIsOccupied } from "./restaurantFloorPlan.js";

test("mesa con carrito cuenta como ocupada", () => {
  assert.equal(dakinisTableIsOccupied({ cart: { m1: 1 } }, { label: "Salón 1" }, []), true);
});

test("mesa sin sesión ni pedidos está libre", () => {
  assert.equal(dakinisTableIsOccupied(null, { label: "Salón 1" }, []), false);
});

test("comanda abierta por label ocupa la mesa aunque la sesión se haya limpiado", () => {
  const orders = [{ table: "Salón 1", status: "cocina", orderNumber: 1 }];
  assert.equal(dakinisTableIsOccupied(null, { label: "Salón 1" }, orders), true);
});

test("comanda entregada no ocupa la mesa", () => {
  const orders = [{ table: "Salón 1", status: "entregada", orderNumber: 1 }];
  assert.equal(dakinisTableIsOccupied(null, { label: "Salón 1" }, orders), false);
});

test("sesión con carrito vacío (post-envío) sigue ocupada", () => {
  assert.equal(dakinisTableIsOccupied({ cart: {}, notes: "" }, { label: "Salón 1" }, []), true);
});
