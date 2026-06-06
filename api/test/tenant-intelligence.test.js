import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dakinisComputeTenantHealthScore } from "@dakinis/shared/catalog/tenant-health-score.js";
import { dakinisResolveTenantModules } from "@dakinis/shared/catalog/tenant-modules.js";
import { dakinisGetIndustryTemplate } from "@dakinis/shared/catalog/business-templates.js";
import { dakinisCompareToSector } from "@dakinis/shared/catalog/sector-benchmarks.js";
import { dakinisComputeGrowthScore } from "@dakinis/shared/catalog/tenant-growth-score.js";
import { dakinisBuildModuleRecommendations } from "@dakinis/shared/catalog/module-recommendations.js";
import {
  dakinisComputeCommercialMonthlyInvoice,
  dakinisEstimateAiCostEur
} from "@dakinis/shared/catalog/bos-pricing.js";
import { dakinisPathToTelemetryFeature } from "@dakinis/shared/catalog/telemetry-features.js";
import {
  dakinisComputeAdoptionScores,
  dakinisComputeBusinessValueScores
} from "@dakinis/shared/catalog/telemetry-scores.js";

describe("tenant intelligence catalog", () => {
  it("resuelve plantilla restaurante con KPIs", () => {
    const t = dakinisGetIndustryTemplate("restaurante");
    assert.equal(t.entity, "comanda");
    assert.ok(t.dashboardKpis.some((k) => k.key === "mesas_ocupadas"));
  });

  it("health score sube con señales positivas", () => {
    const low = dakinisComputeTenantHealthScore({ type: "restaurante" }, {});
    const high = dakinisComputeTenantHealthScore(
      { type: "restaurante" },
      {
        onboardingCompleted: true,
        crmContacts: 10,
        activities7d: 5,
        reservations7d: 8,
        users: 3
      }
    );
    assert.ok(high.score > low.score);
    assert.ok(high.score <= 100);
  });

  it("growth habilita CRM pero no WhatsApp sin override", () => {
    const mods = dakinisResolveTenantModules({ plan: "growth", type: "restaurante" }, {});
    const crm = mods.marketplace.find((m) => m.key === "crm");
    const wa = mods.marketplace.find((m) => m.key === "whatsapp");
    assert.equal(crm.enabled, true);
    assert.equal(wa.enabled, false);
  });

  it("benchmark compara tenant vs sector", () => {
    const bench = dakinisCompareToSector("restaurante", {
      salesMonthDeltaPct: 12,
      crmContacts: 200,
      occupancyPct: 75
    });
    assert.ok(bench.comparisons.length > 0);
    assert.ok(bench.highlights.length > 0);
  });

  it("growth score distinto de health score", () => {
    const g = dakinisComputeGrowthScore({ type: "restaurante" }, {
      newContacts30d: 10,
      salesMonthDeltaPct: 15,
      dealsPipeline: 4
    });
    assert.ok(g.score > 0);
    assert.notEqual(g.status, undefined);
  });

  it("recomienda upgrade WhatsApp en restaurante starter", () => {
    const recs = dakinisBuildModuleRecommendations({ plan: "starter", type: "restaurante" }, {}, {});
    assert.ok(recs.some((r) => r.moduleKey === "whatsapp" || r.moduleKey === "crm"));
  });

  it("estima coste IA por tokens", () => {
    const cost = dakinisEstimateAiCostEur(5000, 1200);
    assert.ok(cost > 0);
  });

  it("factura comercial hibrida plan + exceso consumo", () => {
    const within = dakinisComputeCommercialMonthlyInvoice("growth", {
      aiQueries: 0,
      whatsappMessages: 200
    });
    assert.equal(within.totalEur, 79);
    assert.equal(within.overage.whatsappEur, 0);

    const over = dakinisComputeCommercialMonthlyInvoice("pro", {
      aiQueries: 2500,
      whatsappMessages: 2200
    });
    assert.equal(over.baseEur, 149);
    assert.ok(over.overage.aiEur >= 5);
    assert.ok(over.overage.whatsappEur >= 5);
    assert.ok(over.totalEur > 149);
  });

  it("mapea rutas /app a claves de telemetria", () => {
    assert.equal(dakinisPathToTelemetryFeature("/app/dashboard"), "dashboard");
    assert.equal(dakinisPathToTelemetryFeature("/app/crm"), "crm");
    assert.equal(dakinisPathToTelemetryFeature("/app/whatsapp/conversations"), "whatsapp.inbox");
    assert.equal(dakinisPathToTelemetryFeature("/app/settings"), "settings");
    assert.equal(dakinisPathToTelemetryFeature("/login"), null);
  });

  it("calcula adoption y business value scores", () => {
    const adoption = dakinisComputeAdoptionScores(
      [
        { feature: "crm", sessions: 20, totalMinutes: 45, bounceRatePct: 5 },
        { feature: "dashboard", sessions: 30, totalMinutes: 60, bounceRatePct: 2 }
      ],
      30
    );
    const crm = adoption.find((a) => a.module === "crm");
    assert.ok(crm.scorePct > 50);

    const value = dakinisComputeBusinessValueScores(
      {
        "crm.contact.created": 8,
        "crm.deal.won": 1,
        "whatsapp.message.sent": 25
      },
      30
    );
    const wa = value.find((v) => v.module === "whatsapp");
    assert.ok(wa.scorePct > 0);
  });
});
