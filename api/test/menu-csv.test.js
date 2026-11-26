import test from "node:test";
import assert from "node:assert/strict";
import {
  DAKINIS_MENU_CSV_TEMPLATE,
  dakinisParseMenuCsv
} from "../src/modules/hospitality/menu-csv.js";

test("parse template CSV yields create[]", () => {
  const parsed = dakinisParseMenuCsv(DAKINIS_MENU_CSV_TEMPLATE);
  assert.equal(parsed.errors.length, 0);
  assert.equal(parsed.create.length, 3);
  assert.equal(parsed.create[0].nameEs, "Pizza margarita");
  assert.equal(parsed.create[0].category, "Pizzas");
  assert.equal(parsed.create[0].priceEur, 9.5);
  assert.equal(parsed.create[0].description, "Tomate y mozzarella");
  assert.equal(parsed.create[2].nameEs, "Café solo");
  assert.equal(parsed.create[2].priceEur, 1.4);
});

test("parse accepts Spanish headers and semicolon", () => {
  const csv = "nombre;categoria;precio;descripcion\nTarta;Postres;3,50;Casa\n";
  const parsed = dakinisParseMenuCsv(csv);
  assert.equal(parsed.create.length, 1);
  assert.equal(parsed.create[0].nameEs, "Tarta");
  assert.equal(parsed.create[0].category, "Postres");
  assert.equal(parsed.create[0].priceEur, 3.5);
  assert.equal(parsed.create[0].description, "Casa");
});

test("parse skips blank names and reports bad prices", () => {
  const csv = "name,category,priceEur,description\n,Skip,1,\nMal,,abc,\nOk,Bebidas,2,\n";
  const parsed = dakinisParseMenuCsv(csv);
  assert.equal(parsed.skipped, 1);
  assert.equal(parsed.create.length, 1);
  assert.equal(parsed.create[0].nameEs, "Ok");
  assert.ok(parsed.errors.some((e) => e.includes("precio inválido")));
});

test("empty CSV errors", () => {
  const parsed = dakinisParseMenuCsv("   ");
  assert.equal(parsed.create.length, 0);
  assert.ok(parsed.errors.length);
});
