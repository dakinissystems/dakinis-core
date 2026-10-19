import { randomUUID } from "node:crypto";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../../db/query.js";
import { dakinisFiscalComputeRecordHash } from "./hash-chain.js";
import { dakinisFiscalBuildQr } from "./qr.js";
import { dakinisFiscalSubmitToAeat } from "./aeat-adapter.js";

function dakinisNewId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function dakinisRound2(n) {
  return Math.round(Number(n) * 100) / 100;
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

function dakinisParseJson(raw, fallback) {
  try {
    return JSON.parse(raw || "") ?? fallback;
  } catch {
    return fallback;
  }
}

function dakinisMapInvoiceRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    businessId: row.business_id,
    series: row.series,
    number: row.number,
    invoiceNumber: row.invoice_number,
    kind: row.kind,
    status: row.status,
    customerName: row.customer_name,
    customerTaxId: row.customer_tax_id,
    customerAddress: row.customer_address,
    lines: dakinisParseJson(row.lines_json, []),
    baseAmount: row.base_amount,
    taxRate: row.tax_rate,
    taxAmount: row.tax_amount,
    totalAmount: row.total_amount,
    currency: row.currency,
    issuedAt: row.issued_at,
    recordHash: row.record_hash,
    previousRecordHash: row.previous_record_hash,
    qrPayload: row.qr_payload,
    qrUrl: row.qr_url,
    rectifiesId: row.rectifies_id,
    hospitalityInvoiceId: row.hospitality_invoice_id,
    aeatSubmissionId: row.aeat_submission_id,
    aeatSubmittedAt: row.aeat_submitted_at,
    aeatStatus: row.aeat_status,
    meta: dakinisParseJson(row.meta_json, {}),
    createdAt: row.created_at
  };
}

function dakinisDefaultSettings(businessId) {
  return {
    businessId,
    enabled: false,
    mode: "disabled",
    series: "A",
    issuerName: "",
    issuerTaxId: "",
    issuerAddress: "",
    defaultTaxRate: 10,
    softwareId: "dakinis-one-fiscal",
    softwareVersion: "0.1.0",
    declarationRef: "",
    meta: {},
    updatedAt: null
  };
}

function dakinisMapSettingsRow(row, businessId) {
  if (!row) return dakinisDefaultSettings(businessId);
  return {
    businessId: row.business_id,
    enabled: Boolean(row.enabled),
    mode: row.mode || "disabled",
    series: row.series || "A",
    issuerName: row.issuer_name || "",
    issuerTaxId: row.issuer_tax_id || "",
    issuerAddress: row.issuer_address || "",
    defaultTaxRate: Number(row.default_tax_rate ?? 10),
    softwareId: row.software_id || "dakinis-one-fiscal",
    softwareVersion: row.software_version || "0.1.0",
    declarationRef: row.declaration_ref || "",
    meta: dakinisParseJson(row.meta_json, {}),
    updatedAt: row.updated_at
  };
}

async function dakinisAppendEvent(businessId, invoiceId, eventType, payload, recordHash = "") {
  await dakinisRun(
    `INSERT INTO tenant_fiscal_events (id, business_id, invoice_id, event_type, payload_json, record_hash)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      dakinisNewId("fev"),
      businessId,
      invoiceId,
      eventType,
      JSON.stringify(payload || {}),
      recordHash || ""
    ]
  );
}

export async function dakinisFiscalGetSettings(businessId) {
  try {
    const row = await dakinisQueryOne(`SELECT * FROM tenant_fiscal_settings WHERE business_id = ?`, [
      businessId
    ]);
    return dakinisMapSettingsRow(row, businessId);
  } catch (err) {
    if (!dakinisIsMissingRelation(err)) throw err;
    return dakinisDefaultSettings(businessId);
  }
}

/**
 * @param {string} businessId
 * @param {object} body
 */
export async function dakinisFiscalPatchSettings(businessId, body) {
  const prev = await dakinisFiscalGetSettings(businessId);
  const mode = ["disabled", "verifactu", "no_verifactu"].includes(body.mode) ? body.mode : prev.mode;
  const enabled = body.enabled !== undefined ? Boolean(body.enabled) : prev.enabled && mode !== "disabled";
  const next = {
    enabled: mode === "disabled" ? false : enabled,
    mode,
    series: String(body.series ?? prev.series).trim() || "A",
    issuerName: String(body.issuerName ?? prev.issuerName).trim(),
    issuerTaxId: String(body.issuerTaxId ?? prev.issuerTaxId).trim().toUpperCase(),
    issuerAddress: String(body.issuerAddress ?? prev.issuerAddress).trim(),
    defaultTaxRate: Number(body.defaultTaxRate ?? prev.defaultTaxRate) || 0,
    softwareId: String(body.softwareId ?? prev.softwareId),
    softwareVersion: String(body.softwareVersion ?? prev.softwareVersion),
    declarationRef: String(body.declarationRef ?? prev.declarationRef).trim(),
    meta: body.meta && typeof body.meta === "object" ? body.meta : prev.meta
  };

  const params = [
    next.enabled ? 1 : 0,
    next.mode,
    next.series,
    next.issuerName,
    next.issuerTaxId,
    next.issuerAddress,
    next.defaultTaxRate,
    next.softwareId,
    next.softwareVersion,
    next.declarationRef,
    JSON.stringify(next.meta || {}),
    new Date().toISOString(),
    businessId
  ];

  try {
    const existing = await dakinisQueryOne(`SELECT business_id FROM tenant_fiscal_settings WHERE business_id = ?`, [
      businessId
    ]);
    if (existing) {
      await dakinisRun(
        `UPDATE tenant_fiscal_settings SET
           enabled = ?, mode = ?, series = ?, issuer_name = ?, issuer_tax_id = ?, issuer_address = ?,
           default_tax_rate = ?, software_id = ?, software_version = ?, declaration_ref = ?,
           meta_json = ?, updated_at = ?
         WHERE business_id = ?`,
        params
      );
    } else {
      await dakinisRun(
        `INSERT INTO tenant_fiscal_settings
          (enabled, mode, series, issuer_name, issuer_tax_id, issuer_address,
           default_tax_rate, software_id, software_version, declaration_ref, meta_json, updated_at, business_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params
      );
    }
  } catch (err) {
    if (dakinisIsMissingRelation(err)) {
      return {
        error: {
          status: 503,
          code: "FISCAL_NOT_PROVISIONED",
          message: "Tablas fiscales no provisionadas. Aplica migración 060_fiscal_invoicing_verifactu.sql"
        }
      };
    }
    throw err;
  }

  return { settings: await dakinisFiscalGetSettings(businessId) };
}

export async function dakinisFiscalListInvoices(businessId, { limit = 80 } = {}) {
  try {
    const rows = await dakinisQueryAll(
      `SELECT * FROM tenant_fiscal_invoices
       WHERE business_id = ?
       ORDER BY issued_at DESC
       LIMIT ?`,
      [businessId, Math.min(200, Math.max(1, Number(limit) || 80))]
    );
    return rows.map(dakinisMapInvoiceRow);
  } catch (err) {
    if (!dakinisIsMissingRelation(err)) throw err;
    return [];
  }
}

export async function dakinisFiscalGetInvoice(businessId, invoiceId) {
  const row = await dakinisQueryOne(
    `SELECT * FROM tenant_fiscal_invoices WHERE business_id = ? AND id = ?`,
    [businessId, invoiceId]
  );
  return dakinisMapInvoiceRow(row);
}

function dakinisNormalizeLines(lines) {
  return (Array.isArray(lines) ? lines : []).map((l) => ({
    name: String(l.name || l.description || "Concepto").trim() || "Concepto",
    qty: Number(l.qty) > 0 ? Number(l.qty) : 1,
    unitPrice: Number(l.unitPrice ?? l.price) || 0,
    taxRate: l.taxRate !== undefined ? Number(l.taxRate) : undefined
  }));
}

function dakinisComputeAmounts(lines, defaultTaxRate) {
  const base = dakinisRound2(lines.reduce((s, l) => s + l.qty * l.unitPrice, 0));
  const taxRate = Number(defaultTaxRate) || 0;
  const taxAmount = dakinisRound2(base * (taxRate / 100));
  const total = dakinisRound2(base + taxAmount);
  return { baseAmount: base, taxRate, taxAmount, totalAmount: total };
}

/**
 * Issue a fiscal invoice (immutable once issued). Optionally auto-submit in verifactu mode.
 * @param {string} businessId
 * @param {object} body
 * @param {{ issuerFallbackName?: string }} [ctx]
 */
export async function dakinisFiscalIssueInvoice(businessId, body, ctx = {}) {
  const settings = await dakinisFiscalGetSettings(businessId);
  if (!settings.enabled || settings.mode === "disabled") {
    return {
      error: {
        status: 400,
        code: "FISCAL_DISABLED",
        message: "Activa el módulo fiscal (modo verifactu o no_verifactu) antes de emitir."
      }
    };
  }
  if (!settings.issuerTaxId) {
    return {
      error: {
        status: 400,
        code: "VALIDATION_ERROR",
        message: "Configura el NIF/CIF emisor en ajustes fiscales."
      }
    };
  }

  const lines = dakinisNormalizeLines(body.lines);
  if (!lines.length) {
    return { error: { status: 400, code: "VALIDATION_ERROR", message: "La factura necesita líneas." } };
  }

  const series = String(body.series || settings.series || "A").trim() || "A";
  const taxRate = body.taxRate !== undefined ? Number(body.taxRate) : settings.defaultTaxRate;
  const { baseAmount, taxAmount, totalAmount } = dakinisComputeAmounts(lines, taxRate);
  const kind = body.kind === "simplified" ? "simplified" : body.kind === "rectificative" ? "rectificative" : "standard";
  const issuedAt = body.issuedAt || new Date().toISOString();

  let last;
  try {
    last = await dakinisQueryOne(
      `SELECT number, record_hash FROM tenant_fiscal_invoices
       WHERE business_id = ? AND series = ?
       ORDER BY number DESC LIMIT 1`,
      [businessId, series]
    );
  } catch (err) {
    if (dakinisIsMissingRelation(err)) {
      return {
        error: {
          status: 503,
          code: "FISCAL_NOT_PROVISIONED",
          message: "Tablas fiscales no provisionadas. Aplica migración 060."
        }
      };
    }
    throw err;
  }

  const number = (Number(last?.number) || 0) + 1;
  const invoiceNumber = `${series}-${new Date(issuedAt).getFullYear()}-${String(number).padStart(5, "0")}`;
  const previousRecordHash = last?.record_hash || "";
  const id = dakinisNewId("finv");

  const hashInput = {
    businessId,
    series,
    number,
    invoiceNumber,
    kind,
    issuerTaxId: settings.issuerTaxId,
    issuerName: settings.issuerName || ctx.issuerFallbackName || "",
    customerName: String(body.customerName || "Cliente").trim() || "Cliente",
    customerTaxId: String(body.customerTaxId || body.taxId || "").trim().toUpperCase(),
    lines,
    baseAmount,
    taxRate,
    taxAmount,
    totalAmount,
    currency: "EUR",
    issuedAt,
    rectifiesId: body.rectifiesId || null,
    softwareId: settings.softwareId,
    softwareVersion: settings.softwareVersion
  };

  const recordHash = dakinisFiscalComputeRecordHash(hashInput, previousRecordHash);
  const { qrUrl, qrPayload } = dakinisFiscalBuildQr({
    invoiceId: id,
    invoiceNumber,
    issuerTaxId: settings.issuerTaxId,
    totalAmount,
    issuedAt,
    recordHash
  });

  try {
    await dakinisRun(
      `INSERT INTO tenant_fiscal_invoices
        (id, business_id, series, number, invoice_number, kind, status,
         customer_name, customer_tax_id, customer_address, lines_json,
         base_amount, tax_rate, tax_amount, total_amount, currency, issued_at,
         record_hash, previous_record_hash, qr_payload, qr_url, rectifies_id,
         hospitality_invoice_id, aeat_submission_id, aeat_status, immutable, meta_json)
       VALUES (?, ?, ?, ?, ?, ?, 'issued', ?, ?, ?, ?, ?, ?, ?, ?, 'EUR', ?, ?, ?, ?, ?, ?, ?, '', '', 1, ?)`,
      [
        id,
        businessId,
        series,
        number,
        invoiceNumber,
        kind,
        hashInput.customerName,
        hashInput.customerTaxId,
        String(body.customerAddress || "").trim(),
        JSON.stringify(lines),
        baseAmount,
        taxRate,
        taxAmount,
        totalAmount,
        issuedAt,
        recordHash,
        previousRecordHash,
        qrPayload,
        qrUrl,
        body.rectifiesId || null,
        body.hospitalityInvoiceId || null,
        JSON.stringify({ source: body.source || "api" })
      ]
    );
  } catch (err) {
    if (dakinisIsMissingRelation(err)) {
      return {
        error: {
          status: 503,
          code: "FISCAL_NOT_PROVISIONED",
          message: "Tablas fiscales no provisionadas. Aplica migración 060."
        }
      };
    }
    throw err;
  }

  await dakinisAppendEvent(businessId, id, "issued", { invoiceNumber, recordHash }, recordHash);

  let invoice = await dakinisFiscalGetInvoice(businessId, id);

  if (settings.mode === "verifactu") {
    const submit = await dakinisFiscalSubmitToAeat(invoice, settings);
    await dakinisRun(
      `UPDATE tenant_fiscal_invoices
       SET aeat_submission_id = ?, aeat_submitted_at = ?, aeat_status = ?, status = ?
       WHERE id = ? AND business_id = ?`,
      [
        submit.submissionId || "",
        new Date().toISOString(),
        submit.status,
        submit.ok ? "submitted" : invoice.status,
        id,
        businessId
      ]
    );
    await dakinisAppendEvent(businessId, id, "aeat_submit", submit, recordHash);
    invoice = await dakinisFiscalGetInvoice(businessId, id);
  }

  return { invoice, settings };
}

/**
 * Rectificative invoice — never deletes the original; marks it rectified.
 */
export async function dakinisFiscalRectifyInvoice(businessId, invoiceId, body = {}) {
  const original = await dakinisFiscalGetInvoice(businessId, invoiceId);
  if (!original) {
    return { error: { status: 404, code: "NOT_FOUND", message: "Factura no encontrada" } };
  }
  if (original.status === "void") {
    return { error: { status: 400, code: "VALIDATION_ERROR", message: "No se puede rectificar una factura anulada" } };
  }

  const lines =
    Array.isArray(body.lines) && body.lines.length
      ? body.lines
      : original.lines.map((l) => ({ ...l, unitPrice: -Math.abs(Number(l.unitPrice) || 0) }));

  const result = await dakinisFiscalIssueInvoice(
    businessId,
    {
      ...body,
      kind: "rectificative",
      rectifiesId: original.id,
      lines,
      customerName: body.customerName || original.customerName,
      customerTaxId: body.customerTaxId || original.customerTaxId,
      customerAddress: body.customerAddress || original.customerAddress,
      taxRate: body.taxRate !== undefined ? body.taxRate : original.taxRate,
      source: "rectificative"
    },
    {}
  );
  if (result.error) return result;

  await dakinisRun(
    `UPDATE tenant_fiscal_invoices SET status = 'rectified' WHERE id = ? AND business_id = ?`,
    [original.id, businessId]
  );
  await dakinisAppendEvent(businessId, original.id, "rectified_by", {
    rectificativeId: result.invoice.id
  });

  return { invoice: result.invoice, originalId: original.id };
}

/**
 * Best-effort bridge from hospitality restaurant_invoice → fiscal module.
 */
export async function dakinisFiscalMaybeFromHospitality(businessId, hospitalityInvoice, ctx = {}) {
  const settings = await dakinisFiscalGetSettings(businessId);
  if (!settings.enabled || settings.mode === "disabled") {
    return { skipped: true, reason: "fiscal_disabled" };
  }

  const lines = (hospitalityInvoice.lines || []).map((l) => ({
    name: l.name,
    qty: l.qty,
    unitPrice: l.unitPrice
  }));
  if (!lines.length) return { skipped: true, reason: "no_lines" };

  const tax = Number(hospitalityInvoice.tax || 0);
  const subtotal = Number(hospitalityInvoice.subtotal || 0);
  const taxRate =
    subtotal > 0 && tax > 0 ? dakinisRound2((tax / subtotal) * 100) : settings.defaultTaxRate;

  return dakinisFiscalIssueInvoice(
    businessId,
    {
      lines,
      customerName: hospitalityInvoice.customerName,
      customerTaxId: hospitalityInvoice.taxId,
      taxRate,
      hospitalityInvoiceId: hospitalityInvoice.id,
      source: "hospitality"
    },
    { issuerFallbackName: ctx.venueName || hospitalityInvoice.venueName || "" }
  );
}

export async function dakinisFiscalListEvents(businessId, invoiceId) {
  try {
    const rows = await dakinisQueryAll(
      `SELECT id, event_type, payload_json, record_hash, created_at
       FROM tenant_fiscal_events
       WHERE business_id = ? AND invoice_id = ?
       ORDER BY created_at ASC`,
      [businessId, invoiceId]
    );
    return rows.map((r) => ({
      id: r.id,
      eventType: r.event_type,
      payload: dakinisParseJson(r.payload_json, {}),
      recordHash: r.record_hash,
      createdAt: r.created_at
    }));
  } catch (err) {
    if (!dakinisIsMissingRelation(err)) throw err;
    return [];
  }
}
