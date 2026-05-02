export const DAKINIS_SYSTEM_PAGE_CONTENT = {
  clinica: {
    pageTitle: "Sistema para Clínica estética",
    pageDescription:
      "Centraliza agenda medica, seguimiento de pacientes y automatizacion de confirmaciones para reducir ausencias.",
    highlights: [
      "Menos no-show en tratamientos",
      "Seguimiento post-sesion automatizado",
      "Vision comercial del paciente"
    ],
    ctaLabel: "Solicitar demo para clinica",
    kpis: [
      { label: "Citas hoy", value: "28" },
      { label: "No-show", value: "6%" },
      { label: "Pacientes reactivados", value: "14" },
      { label: "Facturacion estimada", value: "€3.420" }
    ],
    workflow: [
      {
        title: "Agenda medica",
        items: ["09:00 Limpieza facial", "10:30 Botox - Cabina 2", "12:00 Control post-tratamiento"]
      },
      {
        title: "Seguimiento paciente",
        items: ["7 pacientes sin confirmar", "3 pendientes de reagendar", "2 VIP para llamada"]
      },
      {
        title: "Cobro y cierre",
        items: ["4 presupuestos por cerrar", "2 upsells sugeridos", "Caja proyectada al 85%"]
      }
    ],
    automations: [
      "Recordatorio automatico 24h y 2h antes",
      "Mensaje post-tratamiento con recomendaciones",
      "Reactivacion de pacientes inactivos 45 dias"
    ],
    quickActions: ["Abrir agenda de hoy", "Enviar campaña de reactivacion", "Ver pacientes sin confirmar"]
  },
  peluqueria: {
    pageTitle: "Sistema para Peluqueria Premium",
    pageDescription:
      "Controla estilistas, reservas online y fidelizacion para aumentar recurrencia y ticket medio.",
    highlights: [
      "Agenda por silla y profesional",
      "Reserva online sin friccion",
      "Campanas de retorno automaticas"
    ],
    ctaLabel: "Solicitar demo para peluqueria",
    kpis: [
      { label: "Turnos hoy", value: "36" },
      { label: "Ocupacion estilistas", value: "89%" },
      { label: "Clientes recurrentes", value: "62%" },
      { label: "Ticket medio", value: "€47" }
    ],
    workflow: [
      {
        title: "Agenda salon",
        items: ["09:00 Corte + peinado", "10:00 Coloracion premium", "11:30 Keratina"]
      },
      {
        title: "Reservas online",
        items: ["5 nuevas reservas web", "2 reprogramaciones", "1 cancelacion recuperada"]
      },
      {
        title: "Fidelizacion",
        items: ["12 clientes para promo retorno", "5 cumpleaños esta semana", "3 packs por sugerir"]
      }
    ],
    automations: [
      "Confirmacion automatica al reservar",
      "Campana de retorno a 30 dias sin visita",
      "Oferta personalizada por historial de servicios"
    ],
    quickActions: [
      "Ver huecos de estilistas",
      "Publicar promo de baja ocupacion",
      "Enviar WhatsApp a clientes VIP"
    ]
  },
  restaurante: {
    pageTitle: "Sistema para Restaurante premium",
    pageDescription:
      "Coordina reservas por mesa y turno, gestiona comensales recurrentes y automatiza confirmaciones por WhatsApp.",
    highlights: [
      "Plan de sala por turnos",
      "CRM con preferencias y alergias",
      "Menos no-show en horas punta"
    ],
    ctaLabel: "Solicitar demo para restaurante premium",
    kpis: [
      { label: "Coberturas hoy", value: "52" },
      { label: "Ocupacion sala", value: "84%" },
      { label: "Reservas web", value: "38%" },
      { label: "Ticket medio", value: "€34" }
    ],
    workflow: [
      {
        title: "Plan de mesas",
        items: ["20:00 Terraza completa", "20:30 Mesa 4 — 4 pax", "21:00 Lista de espera (3)"]
      },
      {
        title: "Servicio y cocina",
        items: ["12 comandas activas", "2 fuera de tiempo", "Postres prioritarios mesa 7"]
      },
      {
        title: "Clientes y fidelidad",
        items: ["6 cumpleaños esta semana", "4 VIP sin reserva", "3 encuestas pendientes"]
      }
    ],
    automations: [
      "Confirmacion y recordatorio 24h por WhatsApp",
      "Etiquetado de alergias en la reserva",
      "Mensaje post-visita con valoracion y promocion"
    ],
    quickActions: ["Abrir mapa de mesas", "Liberar hueco por cancelacion", "Enviar oferta a lista de espera"]
  },
  inmobiliaria: {
    pageTitle: "Sistema para Inmobiliaria",
    pageDescription:
      "Gestiona visitas, pipeline comercial y seguimiento de leads para cerrar mas operaciones.",
    highlights: [
      "Agenda de visitas por propiedad",
      "Embudo claro por etapa comercial",
      "Metricas de conversion por agente"
    ],
    ctaLabel: "Solicitar demo para inmobiliaria",
    kpis: [
      { label: "Leads nuevos", value: "22" },
      { label: "Visitas programadas", value: "11" },
      { label: "Tasa de conversion", value: "18%" },
      { label: "Comision estimada", value: "€12.600" }
    ],
    workflow: [
      {
        title: "Agenda de visitas",
        items: ["10:00 Piso centro", "12:00 Chalet norte", "17:30 Oficina premium"]
      },
      {
        title: "Pipeline comercial",
        items: ["9 leads en contacto", "6 en propuesta", "3 en negociacion final"]
      },
      {
        title: "Cierre de operaciones",
        items: ["2 reservas pendientes", "1 firma esta semana", "4 seguimientos de precio"]
      }
    ],
    automations: [
      "Recordatorio automatico de visita al lead",
      "Seguimiento post-visita con encuesta de interes",
      "Reactivacion de leads frios por zona y presupuesto"
    ],
    quickActions: ["Crear visita guiada", "Ver pipeline por agente", "Lanzar seguimiento a leads frios"]
  }
};

export const DAKINIS_SYSTEM_MOCKUPS = {
  clinica: {
    entityLabel: "paciente",
    formFields: [
      { key: "nombre", label: "Nombre", type: "text", placeholder: "Ej. Laura Diaz" },
      { key: "tratamiento", label: "Tratamiento", type: "text", placeholder: "Ej. Limpieza facial" },
      { key: "fecha", label: "Fecha", type: "date" },
      {
        key: "estado",
        label: "Estado",
        type: "select",
        options: ["Confirmado", "Pendiente", "Reagendar"]
      }
    ],
    tableColumns: [
      { key: "nombre", label: "Paciente" },
      { key: "tratamiento", label: "Tratamiento" },
      { key: "fecha", label: "Fecha" },
      { key: "estado", label: "Estado" }
    ],
    initialRecords: [
      {
        id: "local-c-1",
        nombre: "Elena Suarez",
        tratamiento: "Botox",
        fecha: "2026-05-02",
        estado: "Confirmado"
      },
      {
        id: "local-c-2",
        nombre: "Marta Ruiz",
        tratamiento: "Peeling",
        fecha: "2026-05-03",
        estado: "Pendiente"
      }
    ]
  },
  peluqueria: {
    entityLabel: "reserva",
    formFields: [
      { key: "cliente", label: "Cliente", type: "text", placeholder: "Ej. Carla Gomez" },
      { key: "servicio", label: "Servicio", type: "text", placeholder: "Ej. Coloracion premium" },
      { key: "estilista", label: "Estilista", type: "text", placeholder: "Ej. Sofia" },
      { key: "hora", label: "Hora", type: "time" }
    ],
    tableColumns: [
      { key: "cliente", label: "Cliente" },
      { key: "servicio", label: "Servicio" },
      { key: "estilista", label: "Estilista" },
      { key: "hora", label: "Hora" }
    ],
    initialRecords: [
      {
        id: "local-p-1",
        cliente: "Raquel Martin",
        servicio: "Corte + peinado",
        estilista: "Diana",
        hora: "10:30"
      },
      { id: "local-p-2", cliente: "Alicia Perez", servicio: "Keratina", estilista: "Sofia", hora: "12:00" }
    ]
  },
  restaurante: {
    entityLabel: "comanda",
    formFields: [
      { key: "cliente", label: "Cliente", type: "text", placeholder: "Ej. Pablo Vega" },
      { key: "mesa", label: "Mesa / zona", type: "text", placeholder: "Ej. Terraza 4" },
      { key: "hora", label: "Hora", type: "time" },
      {
        key: "comensales",
        label: "Comensales",
        type: "text",
        placeholder: "Ej. 4"
      },
      {
        key: "estado",
        label: "Estado",
        type: "select",
        options: ["Confirmada", "En sala", "Completada", "No show"]
      }
    ],
    tableColumns: [
      { key: "cliente", label: "Cliente" },
      { key: "mesa", label: "Mesa" },
      { key: "hora", label: "Hora" },
      { key: "comensales", label: "Pax" },
      { key: "estado", label: "Estado" }
    ],
    initialRecords: [
      {
        id: "local-r-1",
        cliente: "Pablo Vega",
        mesa: "Terraza 4",
        hora: "20:30",
        comensales: 4,
        estado: "Confirmada"
      },
      {
        id: "local-r-2",
        cliente: "Lucia Ortega",
        mesa: "Interior 2",
        hora: "21:00",
        comensales: 2,
        estado: "En sala"
      }
    ]
  },
  inmobiliaria: {
    entityLabel: "lead",
    formFields: [
      { key: "nombre", label: "Lead", type: "text", placeholder: "Ej. Diego Sanchez" },
      { key: "propiedad", label: "Propiedad", type: "text", placeholder: "Ej. Piso centro 3 hab." },
      { key: "agente", label: "Agente", type: "text", placeholder: "Ej. Lucia" },
      {
        key: "etapa",
        label: "Etapa",
        type: "select",
        options: ["Contacto", "Visita", "Propuesta", "Negociacion"]
      }
    ],
    tableColumns: [
      { key: "nombre", label: "Lead" },
      { key: "propiedad", label: "Propiedad" },
      { key: "agente", label: "Agente" },
      { key: "etapa", label: "Etapa" }
    ],
    initialRecords: [
      {
        id: "local-i-1",
        nombre: "Carlos Diaz",
        propiedad: "Chalet zona norte",
        agente: "Mario",
        etapa: "Visita"
      },
      {
        id: "local-i-2",
        nombre: "Ana Torres",
        propiedad: "Oficina premium",
        agente: "Lucia",
        etapa: "Propuesta"
      }
    ]
  }
};

export function dakinisBuildDefaultFormValues(systemMockup) {
  return systemMockup.formFields.reduce((acc, field) => {
    if (field.type === "select") {
      acc[field.key] = field.options?.[0] || "";
      return acc;
    }
    acc[field.key] = "";
    return acc;
  }, {});
}
