import { dakinisIsResendConfigured } from "./resend-mail.js";

export {
  dakinisIsResendConfigured,
  dakinisSendResendEmail,
  dakinisOnboardingEmailHtml,
  dakinisPasswordResetEmailHtml
} from "./resend-mail.js";

export function dakinisEmailAdapter() {
  return {
    provider: dakinisIsResendConfigured() ? "resend" : "internal"
  };
}
