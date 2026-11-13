import assert from "node:assert/strict";
import test from "node:test";
import { dakinisMergeDashboardLoad } from "./liveTenantDashboardReducer.js";

test("finanzas can fail while the operations panel stays", () => {
  const previous = {
    industryDash: { kpis: [{ key: "comandas_abiertas", value: "3" }] },
    health: { factors: [{ key: "operations", label: "3 comandas registradas, 0 alertas de stock" }] },
    aiTips: null,
    growth: null,
    recommendations: [],
    finance: { available: false, currency: "EUR", periodDays: 30 }
  };
  const merged = dakinisMergeDashboardLoad(previous, [
    { key: "panel", ok: true, value: { data: { dashboard: previous.industryDash } } },
    { key: "finanzas", ok: false, message: "No se ha podido cargar" }
  ]);
  assert.equal(merged.errors.finanzas, "No se ha podido cargar");
  assert.equal(merged.industryDash.kpis[0].value, "3");
  assert.equal(merged.finance.available, false);
  assert.equal(merged.benchmark, null);
});
