/**
 * Pluggable AEAT / VERI*FACTU submission adapter.
 * Default: local stub (records intent, does not call AEAT).
 * Swap for a certified connector or external billing provider later.
 */

/**
 * @param {object} invoice
 * @param {object} settings
 * @returns {Promise<{ ok: boolean, submissionId: string, status: string, message: string }>}
 */
export async function dakinisFiscalSubmitToAeat(invoice, settings) {
  if (settings?.mode !== "verifactu") {
    return {
      ok: false,
      submissionId: "",
      status: "skipped",
      message: "Modo no_verifactu / disabled — no se remite a AEAT (conservación local)."
    };
  }

  // Stub until SIF / webservice credentials are configured.
  const submissionId = `stub_${invoice.id}_${Date.now()}`;
  return {
    ok: true,
    submissionId,
    status: "queued_local",
    message:
      "Registro encolado localmente. Conectar conector AEAT certificado antes de producción VERI*FACTU."
  };
}
