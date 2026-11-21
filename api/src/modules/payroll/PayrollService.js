import { randomUUID } from "node:crypto";
import { calculatePay, selectComponents, slipIsLocked } from "@dakinis/payroll";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../../db/query.js";

function dakinisNewId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function dakinisParseJson(raw, fallback) {
  try {
    return JSON.parse(raw || "") ?? fallback;
  } catch {
    return fallback;
  }
}

function dakinisIsMissingRelation(err) {
  const msg = String(err?.message || err || "").toLowerCase();
  return (
    msg.includes("no such table") ||
    msg.includes("does not exist") ||
    msg.includes("undefined_table") ||
    err?.code === "42P01"
  );
}

function dakinisErr(status, code, message) {
  return { error: { status, code, message } };
}

function dakinisDefaultSettings(businessId) {
  return {
    businessId,
    enabled: false,
    defaultCurrency: "EUR",
    defaultJurisdiction: "GENERIC",
    rounding: "half_up",
    exponent: 2,
    allowNegativeNet: false,
    meta: {},
    updatedAt: null
  };
}

function dakinisMapSettings(row, businessId) {
  if (!row) return dakinisDefaultSettings(businessId);
  return {
    businessId: row.business_id,
    enabled: Boolean(row.enabled),
    defaultCurrency: row.default_currency || "EUR",
    defaultJurisdiction: row.default_jurisdiction || "GENERIC",
    rounding: row.rounding || "half_up",
    exponent: Number(row.exponent ?? 2),
    allowNegativeNet: Boolean(row.allow_negative_net),
    meta: dakinisParseJson(row.meta_json, {}),
    updatedAt: row.updated_at
  };
}

function dakinisMapJurisdiction(row) {
  return {
    id: row.id,
    businessId: row.business_id,
    code: row.code,
    name: row.name || "",
    currency: row.currency,
    exponent: Number(row.exponent ?? 2),
    rounding: row.rounding || "half_up",
    identifierLabels: dakinisParseJson(row.identifier_labels_json, {}),
    meta: dakinisParseJson(row.meta_json, {}),
    createdAt: row.created_at
  };
}

function dakinisMapComponent(row, brackets = []) {
  return {
    id: row.id,
    businessId: row.business_id,
    jurisdictionCode: row.jurisdiction_code || "",
    code: row.code,
    name: row.name || "",
    kind: row.kind,
    method: row.method,
    party: row.party || "worker",
    base: row.base_code || "gross",
    rateBps: row.rate_bps == null ? null : Number(row.rate_bps),
    amountMinor: row.amount_minor == null ? null : Number(row.amount_minor),
    floorMinor: row.floor_minor == null ? null : Number(row.floor_minor),
    ceilingMinor: row.ceiling_minor == null ? null : Number(row.ceiling_minor),
    sequence: Number(row.sequence ?? 100),
    taxable: row.taxable !== 0 && row.taxable !== false,
    reducesTaxable: Boolean(row.reduces_taxable),
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
    brackets: brackets.map((b) => ({
      id: b.id,
      sequence: Number(b.sequence),
      upToMinor: b.up_to_minor == null ? null : Number(b.up_to_minor),
      rateBps: Number(b.rate_bps)
    })),
    meta: dakinisParseJson(row.meta_json, {}),
    createdAt: row.created_at
  };
}

function dakinisMapEngagement(row) {
  return {
    id: row.id,
    businessId: row.business_id,
    workerRef: row.worker_ref,
    displayName: row.display_name || "",
    workerKind: row.worker_kind,
    jurisdictionCode: row.jurisdiction_code,
    currency: row.currency,
    payBasis: row.pay_basis,
    amountMinor: Number(row.amount_minor),
    payFrequency: row.pay_frequency,
    proration: row.proration || "none",
    externalIds: dakinisParseJson(row.external_ids_json, {}),
    active: Boolean(row.active),
    meta: dakinisParseJson(row.meta_json, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function dakinisMapPeriod(row) {
  return {
    id: row.id,
    businessId: row.business_id,
    jurisdictionCode: row.jurisdiction_code || "",
    frequency: row.frequency,
    startOn: row.start_on,
    endOn: row.end_on,
    payOn: row.pay_on,
    status: row.status
  };
}

function dakinisMapRun(row) {
  return {
    id: row.id,
    businessId: row.business_id,
    periodId: row.period_id,
    status: row.status,
    calculatedAt: row.calculated_at,
    approvedAt: row.approved_at,
    createdAt: row.created_at
  };
}

function dakinisMapSlip(row) {
  return {
    id: row.id,
    businessId: row.business_id,
    runId: row.run_id,
    engagementId: row.engagement_id,
    currency: row.currency,
    status: row.status,
    grossMinor: Number(row.gross_minor),
    deductionMinor: Number(row.deduction_minor),
    netMinor: Number(row.net_minor),
    employerMinor: Number(row.employer_minor),
    informationalMinor: Number(row.informational_minor || 0),
    lines: dakinisParseJson(row.lines_json, []),
    inputs: dakinisParseJson(row.inputs_json, {}),
    createdAt: row.created_at
  };
}

function dakinisComponentForEngine(comp) {
  return {
    code: comp.code,
    kind: comp.kind,
    method: comp.method,
    sequence: comp.sequence,
    base: comp.base,
    rateBps: comp.rateBps,
    amountMinor: comp.amountMinor,
    floorMinor: comp.floorMinor,
    ceilingMinor: comp.ceilingMinor,
    taxable: comp.taxable,
    reducesTaxable: comp.reducesTaxable,
    jurisdictionCode: comp.jurisdictionCode,
    effectiveFrom: comp.effectiveFrom,
    effectiveTo: comp.effectiveTo,
    brackets: (comp.brackets || []).map((b) => ({
      upToMinor: b.upToMinor,
      rateBps: b.rateBps
    }))
  };
}

export async function dakinisPayrollGetSettings(businessId) {
  try {
    const row = await dakinisQueryOne(`SELECT * FROM tenant_payroll_settings WHERE business_id = ?`, [businessId]);
    return { settings: dakinisMapSettings(row, businessId) };
  } catch (err) {
    if (dakinisIsMissingRelation(err)) return { settings: dakinisDefaultSettings(businessId) };
    throw err;
  }
}

export async function dakinisPayrollPatchSettings(businessId, body) {
  const current = (await dakinisPayrollGetSettings(businessId)).settings;
  const next = {
    enabled: body.enabled != null ? Boolean(body.enabled) : current.enabled,
    defaultCurrency: body.defaultCurrency || current.defaultCurrency,
    defaultJurisdiction: body.defaultJurisdiction || current.defaultJurisdiction,
    rounding: body.rounding === "half_even" ? "half_even" : body.rounding === "half_up" ? "half_up" : current.rounding,
    exponent:
      body.exponent != null && Number.isInteger(body.exponent) ? body.exponent : current.exponent,
    allowNegativeNet:
      body.allowNegativeNet != null ? Boolean(body.allowNegativeNet) : current.allowNegativeNet,
    meta: body.meta && typeof body.meta === "object" ? body.meta : current.meta
  };
  if (next.exponent < 0 || next.exponent > 6) {
    return dakinisErr(400, "VALIDATION", "exponent must be 0..6");
  }
  try {
    const existing = await dakinisQueryOne(`SELECT business_id FROM tenant_payroll_settings WHERE business_id = ?`, [
      businessId
    ]);
    if (existing) {
      await dakinisRun(
        `UPDATE tenant_payroll_settings SET enabled = ?, default_currency = ?, default_jurisdiction = ?,
         rounding = ?, exponent = ?, allow_negative_net = ?, meta_json = ?, updated_at = CURRENT_TIMESTAMP
         WHERE business_id = ?`,
        [
          next.enabled ? 1 : 0,
          next.defaultCurrency,
          next.defaultJurisdiction,
          next.rounding,
          next.exponent,
          next.allowNegativeNet ? 1 : 0,
          JSON.stringify(next.meta),
          businessId
        ]
      );
    } else {
      await dakinisRun(
        `INSERT INTO tenant_payroll_settings
         (business_id, enabled, default_currency, default_jurisdiction, rounding, exponent, allow_negative_net, meta_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          businessId,
          next.enabled ? 1 : 0,
          next.defaultCurrency,
          next.defaultJurisdiction,
          next.rounding,
          next.exponent,
          next.allowNegativeNet ? 1 : 0,
          JSON.stringify(next.meta)
        ]
      );
    }
  } catch (err) {
    if (dakinisIsMissingRelation(err)) {
      return dakinisErr(503, "SCHEMA_MISSING", "Tablas de nómina no disponibles (migración 061)");
    }
    throw err;
  }
  return dakinisPayrollGetSettings(businessId);
}

export async function dakinisPayrollListJurisdictions(businessId) {
  const rows = await dakinisQueryAll(
    `SELECT * FROM tenant_payroll_jurisdictions WHERE business_id = ? ORDER BY code`,
    [businessId]
  );
  return { jurisdictions: rows.map(dakinisMapJurisdiction) };
}

export async function dakinisPayrollCreateJurisdiction(businessId, body) {
  const code = String(body.code || "").trim().toUpperCase();
  const currency = String(body.currency || "").trim().toUpperCase();
  if (!code || !currency) return dakinisErr(400, "VALIDATION", "code y currency son obligatorios");
  const id = dakinisNewId("pjuris");
  await dakinisRun(
    `INSERT INTO tenant_payroll_jurisdictions
     (id, business_id, code, name, currency, exponent, rounding, identifier_labels_json, meta_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      businessId,
      code,
      String(body.name || code),
      currency,
      Number.isInteger(body.exponent) ? body.exponent : 2,
      body.rounding === "half_even" ? "half_even" : "half_up",
      JSON.stringify(body.identifierLabels || {}),
      JSON.stringify(body.meta || {})
    ]
  );
  const row = await dakinisQueryOne(`SELECT * FROM tenant_payroll_jurisdictions WHERE business_id = ? AND id = ?`, [
    businessId,
    id
  ]);
  return { jurisdiction: dakinisMapJurisdiction(row) };
}

export async function dakinisPayrollListComponents(businessId, { jurisdictionCode, onDate } = {}) {
  const rows = await dakinisQueryAll(
    `SELECT * FROM tenant_payroll_components WHERE business_id = ? ORDER BY sequence, code`,
    [businessId]
  );
  const out = [];
  for (const row of rows) {
    const brackets = await dakinisQueryAll(
      `SELECT * FROM tenant_payroll_brackets WHERE component_id = ? ORDER BY sequence`,
      [row.id]
    );
    out.push(dakinisMapComponent(row, brackets));
  }
  if (jurisdictionCode != null || onDate) {
    const selected = selectComponents(
      out.map((c) => ({ ...c, jurisdictionCode: c.jurisdictionCode })),
      { jurisdictionCode: jurisdictionCode || "", onDate: onDate || "9999-12-31" }
    );
    const ids = new Set(selected.map((c) => c.code));
    return { components: out.filter((c) => ids.has(c.code)) };
  }
  return { components: out };
}

export async function dakinisPayrollCreateComponent(businessId, body) {
  const code = String(body.code || "").trim().toUpperCase();
  if (!code || !body.kind || !body.method) {
    return dakinisErr(400, "VALIDATION", "code, kind y method son obligatorios");
  }
  const id = dakinisNewId("pcomp");
  const jurisdictionCode = String(body.jurisdictionCode || "");
  const effectiveFrom = body.effectiveFrom || "1970-01-01";
  await dakinisRun(
    `INSERT INTO tenant_payroll_components
     (id, business_id, jurisdiction_code, code, name, kind, method, party, base_code, rate_bps, amount_minor,
      floor_minor, ceiling_minor, sequence, taxable, reduces_taxable, effective_from, effective_to, meta_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      businessId,
      jurisdictionCode,
      code,
      String(body.name || code),
      body.kind,
      body.method,
      body.party || "worker",
      body.base || "gross",
      body.rateBps ?? null,
      body.amountMinor ?? null,
      body.floorMinor ?? null,
      body.ceilingMinor ?? null,
      Number.isInteger(body.sequence) ? body.sequence : 100,
      body.taxable === false ? 0 : 1,
      body.reducesTaxable ? 1 : 0,
      effectiveFrom,
      body.effectiveTo || null,
      JSON.stringify(body.meta || {})
    ]
  );
  for (const [i, band] of (body.brackets || []).entries()) {
    await dakinisRun(
      `INSERT INTO tenant_payroll_brackets (id, component_id, sequence, up_to_minor, rate_bps) VALUES (?, ?, ?, ?, ?)`,
      [
        dakinisNewId("pbr"),
        id,
        Number.isInteger(band.sequence) ? band.sequence : i + 1,
        band.upToMinor ?? null,
        Number(band.rateBps)
      ]
    );
  }
  const { components } = await dakinisPayrollListComponents(businessId);
  return { component: components.find((c) => c.id === id) };
}

export async function dakinisPayrollListEngagements(businessId) {
  const rows = await dakinisQueryAll(
    `SELECT * FROM tenant_payroll_engagements WHERE business_id = ? ORDER BY display_name, worker_ref`,
    [businessId]
  );
  return { engagements: rows.map(dakinisMapEngagement) };
}

export async function dakinisPayrollCreateEngagement(businessId, body) {
  const workerRef = String(body.workerRef || "").trim();
  const currency = String(body.currency || "").trim().toUpperCase();
  if (!workerRef || !currency || !body.payBasis || !Number.isInteger(body.amountMinor)) {
    return dakinisErr(400, "VALIDATION", "workerRef, currency, payBasis y amountMinor son obligatorios");
  }
  const id = dakinisNewId("peng");
  await dakinisRun(
    `INSERT INTO tenant_payroll_engagements
     (id, business_id, worker_ref, display_name, worker_kind, jurisdiction_code, currency, pay_basis,
      amount_minor, pay_frequency, proration, external_ids_json, active, meta_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    [
      id,
      businessId,
      workerRef,
      String(body.displayName || workerRef),
      body.workerKind || "employee",
      String(body.jurisdictionCode || "GENERIC"),
      currency,
      body.payBasis,
      body.amountMinor,
      body.payFrequency || "monthly",
      body.proration || "none",
      JSON.stringify(body.externalIds || {}),
      JSON.stringify(body.meta || {})
    ]
  );
  const row = await dakinisQueryOne(`SELECT * FROM tenant_payroll_engagements WHERE business_id = ? AND id = ?`, [
    businessId,
    id
  ]);
  return { engagement: dakinisMapEngagement(row) };
}

export async function dakinisPayrollListPeriods(businessId) {
  const rows = await dakinisQueryAll(
    `SELECT * FROM tenant_payroll_periods WHERE business_id = ? ORDER BY start_on DESC`,
    [businessId]
  );
  return { periods: rows.map(dakinisMapPeriod) };
}

export async function dakinisPayrollCreatePeriod(businessId, body) {
  if (!body.startOn || !body.endOn || !body.payOn || !body.frequency) {
    return dakinisErr(400, "VALIDATION", "frequency, startOn, endOn y payOn son obligatorios");
  }
  const id = dakinisNewId("pper");
  await dakinisRun(
    `INSERT INTO tenant_payroll_periods
     (id, business_id, jurisdiction_code, frequency, start_on, end_on, pay_on, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'open')`,
    [
      id,
      businessId,
      String(body.jurisdictionCode || ""),
      body.frequency,
      body.startOn,
      body.endOn,
      body.payOn
    ]
  );
  const row = await dakinisQueryOne(`SELECT * FROM tenant_payroll_periods WHERE business_id = ? AND id = ?`, [
    businessId,
    id
  ]);
  return { period: dakinisMapPeriod(row) };
}

export async function dakinisPayrollGetRun(businessId, runId) {
  const row = await dakinisQueryOne(`SELECT * FROM tenant_payroll_runs WHERE business_id = ? AND id = ?`, [
    businessId,
    runId
  ]);
  if (!row) return dakinisErr(404, "NOT_FOUND", "Run no encontrado");
  const slips = await dakinisQueryAll(
    `SELECT * FROM tenant_payroll_slips WHERE business_id = ? AND run_id = ? ORDER BY created_at`,
    [businessId, runId]
  );
  return { run: dakinisMapRun(row), slips: slips.map(dakinisMapSlip) };
}

export async function dakinisPayrollListSlips(businessId, { runId } = {}) {
  const rows = runId
    ? await dakinisQueryAll(
        `SELECT * FROM tenant_payroll_slips WHERE business_id = ? AND run_id = ? ORDER BY created_at`,
        [businessId, runId]
      )
    : await dakinisQueryAll(
        `SELECT * FROM tenant_payroll_slips WHERE business_id = ? ORDER BY created_at DESC LIMIT 200`,
        [businessId]
      );
  return { slips: rows.map(dakinisMapSlip) };
}

export async function dakinisPayrollCreateRun(businessId, body) {
  const settings = (await dakinisPayrollGetSettings(businessId)).settings;
  if (!settings.enabled) return dakinisErr(403, "MODULE_DISABLED", "Módulo de nómina desactivado");
  const periodId = body.periodId;
  if (!periodId) return dakinisErr(400, "VALIDATION", "periodId es obligatorio");
  const periodRow = await dakinisQueryOne(`SELECT * FROM tenant_payroll_periods WHERE business_id = ? AND id = ?`, [
    businessId,
    periodId
  ]);
  if (!periodRow) return dakinisErr(404, "NOT_FOUND", "Periodo no encontrado");
  const period = dakinisMapPeriod(periodRow);

  let engagements = (await dakinisPayrollListEngagements(businessId)).engagements.filter((e) => e.active);
  if (Array.isArray(body.engagementIds) && body.engagementIds.length) {
    const set = new Set(body.engagementIds);
    engagements = engagements.filter((e) => set.has(e.id));
  }
  if (!engagements.length) return dakinisErr(400, "VALIDATION", "No hay engagements activos");

  const { components } = await dakinisPayrollListComponents(businessId);
  const onDate = String(period.endOn).slice(0, 10);
  const runId = dakinisNewId("prun");
  await dakinisRun(
    `INSERT INTO tenant_payroll_runs (id, business_id, period_id, status, calculated_at) VALUES (?, ?, ?, 'calculated', CURRENT_TIMESTAMP)`,
    [runId, businessId, periodId]
  );

  const slips = [];
  const inputsByEngagement = body.inputsByEngagement || {};
  for (const engagement of engagements) {
    const selected = selectComponents(components.map(dakinisComponentForEngine), {
      jurisdictionCode: engagement.jurisdictionCode,
      onDate
    });
    if (!selected.length) {
      return dakinisErr(400, "VALIDATION", `Sin conceptos vigentes para ${engagement.id}`);
    }
    const inputs = inputsByEngagement[engagement.id] || body.inputs || {};
    const calc = calculatePay({
      rounding: settings.rounding,
      allowNegativeNet: settings.allowNegativeNet,
      currency: engagement.currency,
      engagement: {
        currency: engagement.currency,
        payBasis: engagement.payBasis,
        amountMinor: engagement.amountMinor,
        proration: engagement.proration
      },
      period: {
        dayCount: inputs.dayCount,
        nominalDayCount: inputs.nominalDayCount
      },
      inputs,
      components: selected
    });
    if (!calc.ok) {
      return dakinisErr(400, "VALIDATION", calc.message || calc.code || "Cálculo fallido");
    }
    const existing = await dakinisQueryOne(
      `SELECT * FROM tenant_payroll_slips WHERE business_id = ? AND engagement_id = ? AND run_id IN
        (SELECT id FROM tenant_payroll_runs WHERE period_id = ? AND business_id = ?)`,
      [businessId, engagement.id, periodId, businessId]
    );
    if (existing && slipIsLocked(dakinisMapSlip(existing).status)) {
      return dakinisErr(409, "SLIP_LOCKED", `Slip bloqueado para engagement ${engagement.id}`);
    }
    const slipId = dakinisNewId("pslip");
    await dakinisRun(
      `INSERT INTO tenant_payroll_slips
       (id, business_id, run_id, engagement_id, currency, status, gross_minor, deduction_minor, net_minor,
        employer_minor, informational_minor, lines_json, inputs_json)
       VALUES (?, ?, ?, ?, ?, 'calculated', ?, ?, ?, ?, ?, ?, ?)`,
      [
        slipId,
        businessId,
        runId,
        engagement.id,
        calc.currency,
        calc.grossMinor,
        calc.deductionMinor,
        calc.netMinor,
        calc.employerMinor,
        calc.informationalMinor || 0,
        JSON.stringify(calc.lines),
        JSON.stringify(inputs)
      ]
    );
    slips.push(
      dakinisMapSlip({
        id: slipId,
        business_id: businessId,
        run_id: runId,
        engagement_id: engagement.id,
        currency: calc.currency,
        status: "calculated",
        gross_minor: calc.grossMinor,
        deduction_minor: calc.deductionMinor,
        net_minor: calc.netMinor,
        employer_minor: calc.employerMinor,
        informational_minor: calc.informationalMinor || 0,
        lines_json: JSON.stringify(calc.lines),
        inputs_json: JSON.stringify(inputs),
        created_at: new Date().toISOString()
      })
    );
  }

  await dakinisRun(`UPDATE tenant_payroll_periods SET status = 'calculated' WHERE business_id = ? AND id = ?`, [
    businessId,
    periodId
  ]);

  return { run: { id: runId, businessId, periodId, status: "calculated" }, slips };
}

export async function dakinisPayrollApproveRun(businessId, runId) {
  const settings = (await dakinisPayrollGetSettings(businessId)).settings;
  if (!settings.enabled) return dakinisErr(403, "MODULE_DISABLED", "Módulo de nómina desactivado");
  const got = await dakinisPayrollGetRun(businessId, runId);
  if (got.error) return got;
  await dakinisRun(
    `UPDATE tenant_payroll_runs SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE business_id = ? AND id = ?`,
    [businessId, runId]
  );
  await dakinisRun(
    `UPDATE tenant_payroll_slips SET status = 'approved' WHERE business_id = ? AND run_id = ? AND status = 'calculated'`,
    [businessId, runId]
  );
  const periodId = got.run.periodId;
  await dakinisRun(`UPDATE tenant_payroll_periods SET status = 'approved' WHERE business_id = ? AND id = ?`, [
    businessId,
    periodId
  ]);
  return dakinisPayrollGetRun(businessId, runId);
}

export async function dakinisPayrollPaySlip(businessId, slipId, body) {
  const settings = (await dakinisPayrollGetSettings(businessId)).settings;
  if (!settings.enabled) return dakinisErr(403, "MODULE_DISABLED", "Módulo de nómina desactivado");
  const row = await dakinisQueryOne(`SELECT * FROM tenant_payroll_slips WHERE business_id = ? AND id = ?`, [
    businessId,
    slipId
  ]);
  if (!row) return dakinisErr(404, "NOT_FOUND", "Slip no encontrado");
  const slip = dakinisMapSlip(row);
  const method = body.method || "bank_transfer";
  const amountMinor = Number.isInteger(body.amountMinor) ? body.amountMinor : slip.netMinor;
  const id = dakinisNewId("ppay");
  await dakinisRun(
    `INSERT INTO tenant_payroll_payments
     (id, business_id, slip_id, method, amount_minor, currency, instrument_ref, status, meta_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [
      id,
      businessId,
      slipId,
      method,
      amountMinor,
      body.currency || slip.currency,
      String(body.instrumentRef || ""),
      JSON.stringify(body.meta || {})
    ]
  );
  await dakinisRun(`UPDATE tenant_payroll_slips SET status = 'paid' WHERE business_id = ? AND id = ?`, [
    businessId,
    slipId
  ]);
  const payment = await dakinisQueryOne(`SELECT * FROM tenant_payroll_payments WHERE business_id = ? AND id = ?`, [
    businessId,
    id
  ]);
  return {
    payment: {
      id: payment.id,
      businessId: payment.business_id,
      slipId: payment.slip_id,
      method: payment.method,
      amountMinor: Number(payment.amount_minor),
      currency: payment.currency,
      instrumentRef: payment.instrument_ref,
      status: payment.status,
      createdAt: payment.created_at
    },
    slip: dakinisMapSlip({ ...row, status: "paid" })
  };
}
