export function dakinisBuildModuleFunctionMap(modules) {
  return {
    Agenda: Object.keys(modules.agenda),
    Reservas: Object.keys(modules.booking),
    CRM: Object.keys(modules.crm),
    WhatsApp: Object.keys(modules.whatsapp),
    Leads: Object.keys(modules.leads),
    Dashboard: Object.keys(modules.dashboard)
  };
}
