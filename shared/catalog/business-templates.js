/**
 * Plantillas de industria: onboarding, módulos por defecto y KPIs de dashboard.
 * Convierte el tenant "configurable" en perfil especializado por sector.
 */

import { dakinisHospitalityLabel, dakinisIsHospitalityBusiness, dakinisHospitalityTypeOptions } from "./hospitality.js";

export const DAKINIS_CORE_INDUSTRY_KEYS = Object.freeze([
  "clinica",
  "peluqueria",
  "restaurante",
  "inmobiliaria",
  "gimnasio",
  "academia",
  "taller",
  "veterinaria",
  "hotel",
  "retail",
  "distribuidor",
  "ecommerce"
]);

/** @type {Record<string, import("./business-templates.types.js").DakinisIndustryTemplate>} */
export const DAKINIS_INDUSTRY_TEMPLATES = {
  clinica: {
    key: "clinica",
    label: "Clínica estética",
    market: "Salud estética y bienestar",
    entity: "paciente",
    onboardingTitle: "Configura tu clínica",
    onboardingSteps: ["perfil", "horario", "agenda", "pacientes", "whatsapp"],
    autoModules: ["agenda", "booking", "crm", "dashboard"],
    featureLabels: ["Agenda por cabina", "Ficha paciente", "CRM", "Recordatorios WhatsApp"],
    dashboardKpis: [
      { key: "pacientes_hoy", label: "Pacientes hoy" },
      { key: "citas_pendientes", label: "Citas pendientes" },
      { key: "no_show_semana", label: "No-show (7 días)" },
      { key: "ingresos_estimados", label: "Ingresos estimados hoy" }
    ],
    portalFeatures: ["citas", "historial", "pagos"],
    priority: "immediate"
  },
  peluqueria: {
    key: "peluqueria",
    label: "Peluquería premium",
    market: "Belleza y estilismo",
    entity: "reserva",
    onboardingTitle: "Configura tu salón",
    onboardingSteps: ["perfil", "horario", "estilistas", "servicios", "reservas_online"],
    autoModules: ["agenda", "booking", "crm", "leads", "dashboard"],
    featureLabels: ["Agenda estilistas", "Reserva online", "Fidelización", "CRM"],
    dashboardKpis: [
      { key: "citas_hoy", label: "Citas hoy" },
      { key: "sillas_ocupadas", label: "Sillas ocupadas" },
      { key: "reservas_online", label: "Reservas online (7 días)" },
      { key: "clientes_recurrentes", label: "Clientes recurrentes" }
    ],
    portalFeatures: ["reservas", "historial", "promociones"],
    priority: "immediate"
  },
  restaurante: {
    key: "restaurante",
    label: "Restaurante",
    market: "Hostelería y food service",
    entity: "comanda",
    onboardingTitle: "Configura tu restaurante",
    onboardingSteps: ["perfil", "mesas", "menu", "stock", "comandas", "whatsapp"],
    autoModules: ["agenda", "booking", "crm", "inventario", "reservas", "dashboard"],
    featureLabels: ["Mesas", "Menú", "Comandas", "Stock", "WhatsApp"],
    dashboardKpis: [
      { key: "mesas_ocupadas", label: "Mesas ocupadas" },
      { key: "ventas_hoy", label: "Ventas hoy" },
      { key: "comandas_abiertas", label: "Comandas abiertas" },
      { key: "stock_alertas", label: "Alertas de stock" }
    ],
    portalFeatures: ["reservas", "pedidos", "facturas"],
    priority: "immediate"
  },
  inmobiliaria: {
    key: "inmobiliaria",
    label: "Inmobiliaria",
    market: "Real estate y gestión de propiedades",
    entity: "lead",
    onboardingTitle: "Configura tu inmobiliaria",
    onboardingSteps: ["perfil", "equipo", "propiedades", "embudo", "visitas"],
    autoModules: ["agenda", "booking", "crm", "leads", "dashboard"],
    featureLabels: ["Agenda visitas", "Embudo comercial", "Leads", "Dashboard agentes"],
    dashboardKpis: [
      { key: "leads_activos", label: "Leads activos" },
      { key: "visitas_hoy", label: "Visitas hoy" },
      { key: "propuestas_abiertas", label: "Propuestas abiertas" },
      { key: "cierres_mes", label: "Cierres del mes" }
    ],
    portalFeatures: ["visitas", "documentos", "seguimiento"],
    priority: "immediate"
  },
  gimnasio: {
    key: "gimnasio",
    label: "Gimnasio / CrossFit",
    market: "Fitness y entrenamiento",
    entity: "socio",
    onboardingTitle: "Configura tu centro deportivo",
    onboardingSteps: ["perfil", "horario", "planes", "clases", "accesos"],
    autoModules: ["agenda", "booking", "crm", "reservas", "dashboard"],
    featureLabels: ["Clases grupales", "Cuotas", "Reservas", "CRM socios"],
    dashboardKpis: [
      { key: "socios_activos", label: "Socios activos" },
      { key: "clases_hoy", label: "Clases hoy" },
      { key: "ocupacion_media", label: "Ocupación media" },
      { key: "altas_mes", label: "Altas del mes" }
    ],
    portalFeatures: ["reservas_clase", "cuotas", "perfil"],
    priority: "strategic"
  },
  academia: {
    key: "academia",
    label: "Academia / Formación",
    market: "Idiomas, cursos y formación",
    entity: "alumno",
    onboardingTitle: "Configura tu academia",
    onboardingSteps: ["perfil", "cursos", "grupos", "matriculas", "pagos"],
    autoModules: ["agenda", "booking", "crm", "reservas", "dashboard"],
    featureLabels: ["Grupos", "Matrículas", "Asistencia", "CRM alumnos"],
    dashboardKpis: [
      { key: "alumnos_activos", label: "Alumnos activos" },
      { key: "clases_hoy", label: "Clases hoy" },
      { key: "matriculas_mes", label: "Matrículas del mes" },
      { key: "asistencia_media", label: "Asistencia media" }
    ],
    portalFeatures: ["horario", "notas", "pagos"],
    priority: "strategic"
  },
  taller: {
    key: "taller",
    label: "Taller automoción",
    market: "Reparación y mantenimiento vehículos",
    entity: "orden",
    onboardingTitle: "Configura tu taller",
    onboardingSteps: ["perfil", "servicios", "citas", "repuestos", "facturacion"],
    autoModules: ["agenda", "booking", "crm", "inventario", "dashboard"],
    featureLabels: ["Órdenes de trabajo", "Citas", "Repuestos", "CRM clientes"],
    dashboardKpis: [
      { key: "ordenes_abiertas", label: "Órdenes abiertas" },
      { key: "citas_hoy", label: "Citas hoy" },
      { key: "repuestos_bajo_min", label: "Repuestos bajo mínimo" },
      { key: "facturacion_mes", label: "Facturación del mes" }
    ],
    portalFeatures: ["citas", "estado_vehiculo", "facturas"],
    priority: "strategic"
  },
  veterinaria: {
    key: "veterinaria",
    label: "Veterinaria",
    market: "Clínicas y centros veterinarios",
    entity: "mascota",
    onboardingTitle: "Configura tu veterinaria",
    onboardingSteps: ["perfil", "agenda", "fichas", "vacunas", "recordatorios"],
    autoModules: ["agenda", "booking", "crm", "dashboard"],
    featureLabels: ["Agenda consultas", "Ficha mascota", "Vacunas", "CRM tutores"],
    dashboardKpis: [
      { key: "consultas_hoy", label: "Consultas hoy" },
      { key: "citas_pendientes", label: "Citas pendientes" },
      { key: "vacunas_pendientes", label: "Vacunas pendientes" },
      { key: "tutores_activos", label: "Tutores activos" }
    ],
    portalFeatures: ["citas", "historial_mascota", "pagos"],
    priority: "strategic"
  },
  hotel: {
    key: "hotel",
    label: "Hotel / Alojamiento",
    market: "Hospitality y alojamiento",
    entity: "reserva",
    onboardingTitle: "Configura tu alojamiento",
    onboardingSteps: ["perfil", "habitaciones", "tarifas", "checkin", "housekeeping"],
    autoModules: ["agenda", "booking", "crm", "reservas", "dashboard"],
    featureLabels: ["Habitaciones", "Reservas", "Check-in", "CRM huéspedes"],
    dashboardKpis: [
      { key: "ocupacion_hoy", label: "Ocupación hoy" },
      { key: "checkins_hoy", label: "Check-ins hoy" },
      { key: "checkouts_hoy", label: "Check-outs hoy" },
      { key: "ingresos_hoy", label: "Ingresos hoy" }
    ],
    portalFeatures: ["reservas", "checkin", "facturas"],
    priority: "commercial"
  },
  retail: {
    key: "retail",
    label: "Retail / Tienda",
    market: "Comercio minorista",
    entity: "venta",
    onboardingTitle: "Configura tu tienda",
    onboardingSteps: ["perfil", "catalogo", "stock", "caja", "clientes"],
    autoModules: ["crm", "inventario", "dashboard"],
    featureLabels: ["Catálogo", "Stock", "Ventas", "CRM clientes"],
    dashboardKpis: [
      { key: "ventas_hoy", label: "Ventas hoy" },
      { key: "ticket_medio", label: "Ticket medio" },
      { key: "productos_top", label: "Top productos" },
      { key: "stock_critico", label: "SKU bajo mínimo" }
    ],
    portalFeatures: ["pedidos", "fidelizacion", "facturas"],
    priority: "commercial"
  },
  distribuidor: {
    key: "distribuidor",
    label: "Distribuidor / Almacén",
    market: "Logística y distribución B2B",
    entity: "pedido",
    onboardingTitle: "Configura tu almacén",
    onboardingSteps: ["perfil", "catalogo", "rutas", "stock", "clientes_b2b"],
    autoModules: ["crm", "inventario", "leads", "dashboard"],
    featureLabels: ["Pedidos B2B", "Stock", "Rutas", "CRM clientes"],
    dashboardKpis: [
      { key: "pedidos_abiertos", label: "Pedidos abiertos" },
      { key: "entregas_hoy", label: "Entregas hoy" },
      { key: "stock_alertas", label: "Alertas de stock" },
      { key: "clientes_activos", label: "Clientes B2B activos" }
    ],
    portalFeatures: ["pedidos", "seguimiento", "facturas"],
    priority: "commercial"
  },
  ecommerce: {
    key: "ecommerce",
    label: "E-commerce",
    market: "Ventas online",
    entity: "pedido",
    onboardingTitle: "Configura tu tienda online",
    onboardingSteps: ["perfil", "catalogo", "envios", "pagos", "marketing"],
    autoModules: ["crm", "inventario", "leads", "analytics", "dashboard"],
    featureLabels: ["Catálogo", "Pedidos", "CRM", "Analytics"],
    dashboardKpis: [
      { key: "pedidos_hoy", label: "Pedidos hoy" },
      { key: "conversion", label: "Conversión" },
      { key: "carritos_abandonados", label: "Carritos abandonados" },
      { key: "ingresos_mes", label: "Ingresos del mes" }
    ],
    portalFeatures: ["pedidos", "seguimiento", "devoluciones"],
    priority: "commercial"
  }
};

/**
 * @param {string} type
 * @returns {import("./business-templates.types.js").DakinisIndustryTemplate|null}
 */
export function dakinisGetIndustryTemplate(type) {
  const key = String(type || "").trim().toLowerCase();
  if (DAKINIS_INDUSTRY_TEMPLATES[key]) return DAKINIS_INDUSTRY_TEMPLATES[key];
  if (dakinisIsHospitalityBusiness(key) && DAKINIS_INDUSTRY_TEMPLATES.restaurante) {
    const base = DAKINIS_INDUSTRY_TEMPLATES.restaurante;
    return { ...base, key, label: dakinisHospitalityLabel(key) };
  }
  return null;
}

/** Catálogo para selects de onboarding / admin plataforma. */
export function dakinisGetIndustryTemplateCatalog() {
  const base = DAKINIS_CORE_INDUSTRY_KEYS.map((key) => {
    const t = DAKINIS_INDUSTRY_TEMPLATES[key];
    return {
      key,
      label: t.label,
      market: t.market,
      entity: t.entity,
      autoModules: t.autoModules,
      featureLabels: t.featureLabels,
      onboardingSteps: t.onboardingSteps
    };
  });
  const seen = new Set(base.map((b) => b.key));
  for (const opt of dakinisHospitalityTypeOptions()) {
    if (seen.has(opt.value)) continue;
    const t = dakinisGetIndustryTemplate(opt.value);
    if (!t) continue;
    base.push({
      key: opt.value,
      label: opt.label,
      market: t.market,
      entity: t.entity,
      autoModules: t.autoModules,
      featureLabels: t.featureLabels,
      onboardingSteps: t.onboardingSteps
    });
    seen.add(opt.value);
  }
  return base;
}

/**
 * Módulos sugeridos al crear tenant (antes de aplicar plan).
 * @param {string} type
 * @returns {string[]}
 */
export function dakinisDefaultModulesForIndustry(type) {
  const t = dakinisGetIndustryTemplate(type);
  return t ? [...t.autoModules] : ["agenda", "booking", "dashboard"];
}
