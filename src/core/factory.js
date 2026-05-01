import { dakinisCreateConfig } from "./config.js";
import { dakinisCreateAgendaModule } from "./modules/agenda.js";
import { dakinisCreateBookingModule } from "./modules/booking.js";
import { dakinisCreateCrmModule } from "./modules/crm.js";
import { dakinisCreateWhatsAppModule } from "./modules/whatsapp.js";
import { dakinisCreateLeadsModule } from "./modules/leads.js";
import { dakinisCreateDashboardModule } from "./modules/dashboard.js";

export function dakinisCreatePlatformModules(overrides = {}) {
  const config = dakinisCreateConfig(overrides);
  return {
    config,
    agenda: dakinisCreateAgendaModule(config),
    booking: dakinisCreateBookingModule(config),
    crm: dakinisCreateCrmModule(config),
    whatsapp: dakinisCreateWhatsAppModule(config),
    leads: dakinisCreateLeadsModule(config),
    dashboard: dakinisCreateDashboardModule(config)
  };
}
