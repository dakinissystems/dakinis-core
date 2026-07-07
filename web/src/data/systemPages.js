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
