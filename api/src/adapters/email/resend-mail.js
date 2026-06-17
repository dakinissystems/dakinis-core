const RESEND_API_URL = "https://api.resend.com/emails";

/** Email transaccional Dakinis One (onboarding, reset password). Requiere RESEND_API_KEY + RESEND_FROM. */

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function dakinisIsResendConfigured() {
  return Boolean(String(process.env.RESEND_API_KEY || "").trim());
}

function dakinisLayoutEmail({ title, innerHtml, footerNote }) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:#0f172a;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0f172a;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#1e293b;border-radius:12px;border:1px solid #334155;">
        <tr><td style="padding:22px 24px;background:linear-gradient(135deg,#0f766e 0%,#14b8a6 50%,#2dd4bf 100%);">
          <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.9);">Dakinis One</div>
          <div style="font-size:20px;font-weight:700;color:#fff;margin-top:6px;">${escapeHtml(title)}</div>
        </td></tr>
        <tr><td style="padding:24px;font-size:15px;line-height:1.55;color:#cbd5e1;">${innerHtml}</td></tr>
        <tr><td style="padding:16px 24px 20px;border-top:1px solid #334155;font-size:12px;color:#94a3b8;">
          ${escapeHtml(footerNote || "Mensaje automático de Dakinis One. Si no solicitaste esto, ignora el correo.")}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/**
 * @param {{ to: string; subject: string; html: string; text?: string }} opts
 */
export async function dakinisSendResendEmail({ to, subject, html, text }) {
  const key = String(process.env.RESEND_API_KEY || "").trim();
  if (!key) {
    return { ok: false, error: "RESEND_API_KEY not set" };
  }
  const from =
    String(process.env.RESEND_FROM || "").trim() || "Dakinis Systems <noreply@streamautomator.com>";

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        ...(text ? { text } : {})
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data?.message || data?.name || `http_${res.status}` };
    }
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "fetch_failed" };
  }
}

export function dakinisOnboardingEmailHtml({ businessName, businessSlug, tempPassword, resetUrl }) {
  const inner = `
    <p style="margin:0 0 16px;">Tu negocio <strong>${escapeHtml(businessName)}</strong> (<code>${escapeHtml(businessSlug)}</code>) ya está creado en Dakinis One.</p>
    <p style="margin:0 0 16px;">Contraseña temporal:</p>
    <p style="margin:0 0 16px;padding:12px 16px;background:#0f172a;border-radius:8px;font-family:monospace;font-size:16px;color:#5eead4;">${escapeHtml(tempPassword)}</p>
    <p style="margin:0 0 16px;">Por seguridad, confirma el acceso y elige una contraseña nueva:</p>
    <p style="margin:0 0 16px;"><a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:12px 20px;background:#14b8a6;color:#0f172a;border-radius:8px;text-decoration:none;font-weight:600;">Confirmar y cambiar contraseña</a></p>
    <p style="margin:0;font-size:13px;color:#94a3b8;word-break:break-all;">${escapeHtml(resetUrl)}</p>
    <p style="margin:16px 0 0;font-size:13px;color:#94a3b8;">El enlace caduca en 24 horas. También puedes iniciar sesión con la contraseña temporal y cambiarla desde Ajustes.</p>
  `;
  return dakinisLayoutEmail({
    title: "Acceso a tu negocio en Dakinis One",
    innerHtml: inner
  });
}

export function dakinisPasswordResetEmailHtml({ businessName, resetUrl }) {
  const inner = `
    <p style="margin:0 0 16px;">Recibimos una solicitud para restablecer la contraseña de tu cuenta${businessName ? ` en <strong>${escapeHtml(businessName)}</strong>` : ""}.</p>
    <p style="margin:0 0 16px;"><a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:12px 20px;background:#14b8a6;color:#0f172a;border-radius:8px;text-decoration:none;font-weight:600;">Restablecer contraseña</a></p>
    <p style="margin:0;font-size:13px;color:#94a3b8;word-break:break-all;">${escapeHtml(resetUrl)}</p>
    <p style="margin:16px 0 0;font-size:13px;color:#94a3b8;">Caduca en 24 horas. Si no lo pediste, ignora este correo.</p>
  `;
  return dakinisLayoutEmail({
    title: "Restablecer contraseña",
    innerHtml: inner
  });
}
