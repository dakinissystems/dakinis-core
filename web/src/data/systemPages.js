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
    quickActions: ["Abrir agenda de hoy", "Enviar campaña de reactivacion", "Ver pacientes sin confirmar"],
    suppliersProducts: {
      sectionTitle: "Proveedores y productos por proveedor",
      sectionLead:
        "Cada tratamiento puede enlazarse a consumibles catalogados por su proveedor habitual. Ejemplo orientativo.",
      supplierRows: [
        {
          name: "DermaMedical Dist.",
          contact: "Pedidos demo",
          niche: "Rellenos, toxina, peeling"
        },
        {
          name: "Laboratorio SkinPro",
          contact: "Laura — comercial regional",
          niche: "Cosmética clínica, post-tratamiento"
        }
      ],
      productRows: [
        {
          supplier: "DermaMedical Dist.",
          product: "Ácido hialurónico 1 ml",
          reference: "DM-HYA-01",
          note: "Bajo consumo"
        },
        {
          supplier: "DermaMedical Dist.",
          product: "Toxina botulínica 100 U",
          reference: "DM-TOX-100",
          note: "En rango óptimo"
        },
        {
          supplier: "Laboratorio SkinPro",
          product: "Kit limpieza pos-peeling",
          reference: "SP-POST-K2",
          note: "Reposición próxima semana"
        }
      ],
      incomingDeliveries: [
        {
          supplier: "DermaMedical Dist.",
          arrivalWindow: "Mié 7 may · 09:00–11:00",
          contents: "Toxina 100 U x6, HA 1 ml x12",
          status: "Confirmado"
        },
        {
          supplier: "Laboratorio SkinPro",
          arrivalWindow: "Vie 9 may · tarde (almacén)",
          contents: "Kits post-peeling temporada",
          status: "En ruta"
        }
      ],
      merchandiseAlerts: [
        {
          title: "Stock mínimo toxina",
          productRef: "DM-TOX-100",
          condition: "Avisar si quedan menos de 6 unidades",
          severity: "warning"
        },
        {
          title: "Caducidad próxima HA",
          productRef: "DM-HYA-01",
          condition: "Revisar lotes que caducan en los próximos 60 días",
          severity: "info"
        }
      ]
    }
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
    ],
    suppliersProducts: {
      sectionTitle: "Proveedores y productos por proveedor",
      sectionLead:
        "Tintes, decoloraciones y tratamientos quedan vinculados al mayorista o marca que los suministra al salón.",
      supplierRows: [
        { name: "ColorLux Professional", contact: "Pedidos online L-V", niche: "Coloración premium" },
        { name: "HairCare Mayorista", contact: "Comercial norte", niche: "Tratamiento, queratina" }
      ],
      productRows: [
        {
          supplier: "ColorLux Professional",
          product: "Tinte oxidation 60 ml — rubio frío",
          reference: "CL-60BF",
          note: "2 unidades en salón"
        },
        {
          supplier: "ColorLux Professional",
          product: "Oxidante 20 vol.",
          reference: "CL-OX20-1L",
          note: "Stock OK"
        },
        {
          supplier: "HairCare Mayorista",
          product: "Tratamiento keratina 500 ml",
          reference: "HC-K500",
          note: "Pedido mensual"
        }
      ],
      incomingDeliveries: [
        {
          supplier: "ColorLux Professional",
          arrivalWindow: "Mar 6 may · mañana reparto zona norte",
          contents: "Tintes rubio/platinado + oxidantes",
          status: "Confirmado"
        },
        {
          supplier: "HairCare Mayorista",
          arrivalWindow: "Jue 8 may · ventana 14:00–16:00",
          contents: "Keratina y mascarillas pedido quincenal",
          status: "Programado"
        }
      ],
      merchandiseAlerts: [
        {
          title: "Oxidante 20 vol.",
          productRef: "CL-OX20-1L",
          condition: "Alerta si queda menos de 1 bote visible en sala técnica",
          severity: "warning"
        },
        {
          title: "Tinte rubio frío",
          productRef: "CL-60BF",
          condition: "Reposición semanal si ventas > 8 unidades",
          severity: "info"
        }
      ]
    }
  },
  restaurante: {
    pageTitle: "Sistema para Restaurante premium",
    pageDescription:
      "Coordina reservas por mesa y turno, gestiona comensales recurrentes y automatiza confirmaciones por WhatsApp.",
    highlights: [
      "Plan de sala por turnos",
      "Stock y recetas (pizzas / empanadas)",
      "QR de alergias actualizable",
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
    quickActions: ["Abrir mapa de mesas", "Liberar hueco por cancelacion", "Enviar oferta a lista de espera"],
    suppliersProducts: {
      sectionTitle: "Proveedores y productos por proveedor",
      sectionLead:
        "Gestiona qué ingredientes y bebidas llegan de cada proveedor para mantener fichas de coste coherentes.",
      supplierRows: [
        { name: "Mare Terra Alimentaria", contact: "Reparto mañanas", niche: "Pescado fresco" },
        { name: "Bodegas y suministro local", contact: "Comercial plaza", niche: "Vinos y vermut" }
      ],
      productRows: [
        {
          supplier: "Mare Terra Alimentaria",
          product: "Lubina salvaje peso variable",
          reference: "MT-LUBINA",
          note: "Especial viernes/sábado"
        },
        {
          supplier: "Mare Terra Alimentaria",
          product: "Mejillón steamed bag 2 kg",
          reference: "MT-MEJ-2",
          note: "Inventario congelados"
        },
        {
          supplier: "Bodegas y suministro local",
          product: "Vino blanco DO Rueda caja x6",
          reference: "BS-RUEDA-X6",
          note: "Ración carta temporada"
        }
      ],
      incomingDeliveries: [
        {
          supplier: "Mare Terra Alimentaria",
          arrivalWindow: "Cada ma · 07:30 (muelle cocina)",
          contents: "Pescado y marisco pedido fin de semana",
          status: "Recurrente"
        },
        {
          supplier: "Bodegas y suministro local",
          arrivalWindow: "Mié 7 may · 11:00",
          contents: "Vinos blanco/tinto carta + vermut barril",
          status: "Confirmado"
        }
      ],
      merchandiseAlerts: [
        {
          title: "Congelados mejillón",
          productRef: "MT-MEJ-2",
          condition: "Pedido urgente si stock congelador < 4 bolsas",
          severity: "warning"
        },
        {
          title: "Lubina fin de semana",
          productRef: "MT-LUBINA",
          condition: "Coordinar con carta si hay evento >40 cubiertos",
          severity: "info"
        }
      ]
    }
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
    quickActions: ["Crear visita guiada", "Ver pipeline por agente", "Lanzar seguimiento a leads frios"],
    suppliersProducts: {
      sectionTitle: "Aliados externos y servicios por proveedor",
      sectionLead:
        "Las operaciones inmobiliarias coordinan fotografía, homologaciones y portales externos; aquí ves el catálogo asociado a cada socio.",
      supplierRows: [
        { name: "Foto360 Interiors", contact: "Sesiones martes-jueves", niche: "Fotografía HDR y tour" },
        { name: "Portal Urbano Elite", contact: "Gestor de cuenta", niche: "Destacados y leads premium" },
        {
          name: "Notaria asociada López & Ruiz",
          contact: "Cita firma electrónica",
          niche: "Precontrato y cierre"
        }
      ],
      productRows: [
        {
          supplier: "Foto360 Interiors",
          product: "Paquete piso hasta 120 m²",
          reference: "F360-P120",
          note: "Incluye 25 fotos + plano"
        },
        {
          supplier: "Portal Urbano Elite",
          product: "Destacado 30 días zona norte",
          reference: "PUE-ZN-30",
          note: "Renovación automática"
        },
        {
          supplier: "Notaria asociada López & Ruiz",
          product: "Preparación firma escritura estándar",
          reference: "NLR-E1",
          note: "Solicitud tras reserva firmada"
        }
      ],
      incomingDeliveries: [
        {
          supplier: "Foto360 Interiors",
          arrivalWindow: "Jue 8 may · visita piso Avda. Sur",
          contents: "Sesión HDR + dron (tras llave comercial)",
          status: "Confirmado"
        },
        {
          supplier: "Portal Urbano Elite",
          arrivalWindow: "Online · renovación automática",
          contents: "Destacados zona norte — ciclo mensual",
          status: "Activo"
        }
      ],
      merchandiseAlerts: [
        {
          title: "Destacados por expirar",
          productRef: "PUE-ZN-30",
          condition: "Avisar 5 días antes del fin del destacado",
          severity: "warning"
        },
        {
          title: "Paquete foto estándar",
          productRef: "F360-P120",
          condition: "Seguimiento si el informe de valoración no llega en 48 h",
          severity: "info"
        }
      ]
    }
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
