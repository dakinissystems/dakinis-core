/**
 * Telemetría ligera in-process para Delivery / Channel Bus.
 * Sustituible por métricas Prometheus / OTel cuando haya exportador.
 */

/** @type {Map<string, { imports: number, duplicates: number, failures: number, retries: number, latencyMsSum: number, latencyN: number }>} */
const byProvider = new Map();

function bucket(providerId) {
  const id = String(providerId || "unknown").toLowerCase();
  if (!byProvider.has(id)) {
    byProvider.set(id, {
      imports: 0,
      duplicates: 0,
      failures: 0,
      retries: 0,
      latencyMsSum: 0,
      latencyN: 0
    });
  }
  return byProvider.get(id);
}

export function dakinisDeliveryTelemetryRecord(providerId, kind, ms = 0) {
  const b = bucket(providerId);
  if (kind === "import") {
    b.imports += 1;
    if (ms > 0) {
      b.latencyMsSum += ms;
      b.latencyN += 1;
    }
  } else if (kind === "duplicate") b.duplicates += 1;
  else if (kind === "failure") b.failures += 1;
  else if (kind === "retry") b.retries += 1;
}

export function dakinisDeliveryTelemetrySnapshot() {
  const providers = {};
  for (const [id, b] of byProvider.entries()) {
    providers[id] = {
      imports: b.imports,
      duplicates: b.duplicates,
      failures: b.failures,
      retries: b.retries,
      avgImportMs: b.latencyN ? Math.round(b.latencyMsSum / b.latencyN) : null
    };
  }
  return { providers, at: new Date().toISOString() };
}
