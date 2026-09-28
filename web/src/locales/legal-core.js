const OWNER = "Christian David Villar Colodro";
const TRADING = "Dakinis Systems";
const NIF = "18513473Z";
const ADDRESS = "Málaga, España";
const COUNTRY_ES = "España";
const COUNTRY_EN = "Spain";
const PRIVACY = "privacy@dakinissystems.com";
const LEGAL = "legal@dakinissystems.com";
const HELP = "help@dakinissystems.com";
const SAFETY = "legal@dakinissystems.com";
const HELLO = "hello@dakinissystems.com";
const AEPD = "https://www.aepd.es";
const CORPORATE = "https://dakinissystems.com/";
const PRIVACY_REQUESTS_AKOENET_ES = "https://akoenet.dakinissystems.com/legal/privacidad-solicitudes";
const PRIVACY_REQUESTS_AKOENET_EN = "https://akoenet.dakinissystems.com/legal/privacy-requests";
const META_BUSINESS_TOOLS_TERMS = "https://www.facebook.com/legal/terms/businesstools";
const META_DATA_PROCESSING_TERMS = "https://www.facebook.com/legal/terms/dataprocessing";
const WHATSAPP_BUSINESS_TERMS = "https://www.whatsapp.com/legal/business-terms";
const AD_CHOICES = "https://www.aboutads.info/choices";
const EU_AD_CHOICES = "https://www.youronlinechoices.eu/";
const UPDATED_ES = "Última actualización: 4 agosto 2026";
const UPDATED_EN = "Last updated: 4 August 2026";
const MIN_AGE = 14;

const controllerEs = `Operador / Responsable: ${OWNER}. Nombre comercial: ${TRADING}. NIF: ${NIF}. Domicilio: ${ADDRESS}. País: ${COUNTRY_ES}. Privacidad: ${PRIVACY}. Legal: ${LEGAL}.`;
const controllerEn = `Operator / Controller: ${OWNER}. Trading name: ${TRADING}. Tax ID (NIF): ${NIF}. Address: ${ADDRESS}. Country: ${COUNTRY_EN}. Privacy: ${PRIVACY}. Legal: ${LEGAL}.`;

const processorsEs =
  "Solo compartimos datos personales con encargados del tratamiento que ofrecen garantías contractuales y técnicas adecuadas conforme al RGPD (p. ej. hosting Railway, base de datos PostgreSQL/Supabase, Stripe para suscripciones, Resend/Cloudflare para correo).";
const processorsEn =
  "We only share personal data with processors that provide adequate contractual and technical safeguards under the GDPR (e.g. Railway hosting, PostgreSQL/Supabase database, Stripe for subscriptions, Resend/Cloudflare for email).";

const retentionEs =
  "Datos de cuenta: mientras la cuenta permanezca activa. Logs de seguridad: hasta 12 meses. Comunicaciones de soporte: hasta 24 meses. Registros de facturación: según obligaciones fiscales aplicables.";
const retentionEn =
  "Account data: while the account remains active. Security logs: up to 12 months. Support communications: up to 24 months. Billing records: according to applicable tax obligations.";

const minAgeEs = `Los servicios no están dirigidos a personas menores de ${MIN_AGE} años.`;
const minAgeEn = `The services are not directed to persons under ${MIN_AGE} years of age.`;

const exportEs = `Puedes solicitar una copia de tus datos personales en un formato estructurado y de uso habitual escribiendo a ${PRIVACY} o usando nuestro canal de solicitudes de privacidad (${PRIVACY_REQUESTS_AKOENET_ES} para AkoeNet).`;
const exportEn = `You may request a copy of your personal data in a structured, commonly used format by writing to ${PRIVACY} or using our Privacy Requests channel (${PRIVACY_REQUESTS_AKOENET_EN} for AkoeNet).`;

const aiEs =
  "Algunas funciones pueden usar sistemas automatizados para clasificar, enrutar o procesar información. Estos sistemas asisten la toma de decisiones humana y no están destinados a producir decisiones con efectos jurídicos significativos sobre las personas usuarias sin revisión humana cuando la ley lo exija.";
const aiEn =
  "Some features may use automated systems to classify, route, or process information. These systems assist human decision-making and are not intended to produce legally significant decisions about users without human review where required by law.";

const metaExtraEs =
  "Dakinis Systems no controla el tratamiento independiente de Meta. Los clientes deben revisar la documentación legal de Meta antes de activar integraciones.";
const metaExtraEn =
  "Dakinis Systems does not control Meta's independent processing activities. Customers should review Meta's own legal documentation before enabling integrations.";

export const legalCoreEs = {
  back: "← Inicio",
  updated: UPDATED_ES,
  corporateLink: "Política corporativa",
  faq: {
    title: "FAQ",
    sections: [
      {
        h: "¿Qué es Dakinis One?",
        p: "Panel SaaS multi-tenant para distintos tipos de negocio (clínica, peluquería, restaurante, inmobiliaria)."
      },
      {
        h: "¿Cómo contacto?",
        p: `Sección de contacto en ${CORPORATE} o ${PRIVACY}.`
      }
    ]
  },
  privacy: {
    title: "Política de privacidad",
    sections: [
      { h: "1. Responsable", p: controllerEs },
      {
        h: "2. Ámbito",
        p: "Esta política aplica a core.dakinissystems.com (Dakinis One): login, paneles por tenant, cartel público de alérgenos, inventario/stock, CRM/clientes, citas y rutas /app."
      },
      {
        h: "3. Datos que tratamos",
        p: "Email, contraseña (hash seguro), rol, datos del negocio (slug, tipo), registros del tenant (CRM/clientes, citas, notas), checklist de alérgenos, módulo restaurante (carta, comandas, facturas con datos fiscales del cliente cuando el tenant los introduce), inventario/stock (insumos, códigos de barras, movimientos, lotes/caducidad opcionales) y comunicaciones (p. ej. WhatsApp Business si el tenant lo activa)."
      },
      {
        h: "3bis. Roles: Dakinis vs tenant",
        p: "Dakinis Systems actúa como encargado del tratamiento respecto de los datos de clientes finales que el negocio (tenant) introduce en Dakinis One. El tenant es responsable frente a sus clientes (comensales, pacientes, etc.) y debe disponer de base legal propia. Dakinis trata esos datos solo para prestar el servicio SaaS al tenant."
      },
      {
        h: "4. Cartel público de alergias",
        p: "La página /alergenos/... muestra solo información que el restaurante marca como visible. No exige cuenta del comensal."
      },
      {
        h: "5. Finalidad y base legal",
        p: "Prestar el servicio contratado, seguridad e interés legítimo. No vendemos datos personales."
      },
      { h: "6. Encargados del tratamiento", p: processorsEs },
      { h: "7. Conservación", p: retentionEs },
      {
        h: "8. Transferencias internacionales",
        p: "Algunos encargados (Railway, Meta, Stripe u OAuth) pueden tratar datos fuera del EEE. Cuando proceda, usamos Cláusulas Contractuales Tipo (CCT/SCC) u otras garantías equivalentes."
      },
      {
        h: "9. Conservación y seguridad",
        p: "Medidas: HTTPS, aislamiento por tenant, hashes de contraseña. Ver /security."
      },
      {
        h: "10. Analítica",
        p: "Actualmente no usamos cookies de analítica en Dakinis One. Si se añaden, actualizaremos esta política y solicitaremos consentimiento cuando sea exigible."
      },
      { h: "11. Menores", p: minAgeEs },
      {
        h: "12. Tus derechos",
        p: `Acceso, rectificación, supresión, oposición, limitación y portabilidad en ${PRIVACY}. Reclamación AEPD: ${AEPD}`
      },
      { h: "13. Exportación de datos", p: exportEs },
      {
        h: "14. Comunicaciones y WhatsApp",
        p: "El módulo Comunicaciones permite plantillas y vistas previa. WhatsApp Business API solo con integración activa del tenant."
      },
      {
        h: "15. Meta Business Tools",
        p: `WhatsApp Business API y otras herramientas Meta: ${META_BUSINESS_TOOLS_TERMS}. DPA Meta: ${META_DATA_PROCESSING_TERMS}. ${metaExtraEs}`
      },
      {
        h: "16. Obligaciones del tenant (Meta)",
        p: `Debes tener base legal, no compartir datos de menores de ${MIN_AGE} años ni categorías prohibidas, mostrar avisos y enlaces de exclusión (${AD_CHOICES}, ${EU_AD_CHOICES}). WhatsApp: ${WHATSAPP_BUSINESS_TERMS}.`
      },
      { h: "17. Automatización e IA", p: aiEs }
    ]
  },
  terms: {
    title: "Términos de uso",
    sections: [
      { h: "1. Aceptación", p: "Al usar Dakinis One aceptas estos términos." },
      {
        h: "2. Operador",
        p: controllerEs
      },
      {
        h: "3. Naturaleza del servicio",
        p: "SaaS B2B multi-tenant. Puede incluir entornos demo; no uses datos reales de clientes finales sin acuerdo comercial."
      },
      { h: "4. Cuentas y tenants", p: "Cada negocio opera aislado. Eres responsable de tus credenciales." },
      { h: "5. Uso permitido", p: "No accedas a datos de otros tenants ni realices pruebas de intrusión sin autorización." },
      {
        h: "6. Suscripción e impago",
        p: "El impago puede degradar el plan contratado hasta regularizar el pago (plan efectivo Starter). Dakinis Systems puede suspender o cerrar cuentas por incumplimiento grave, abuso o requerimiento legal. Detalle en la política de acceso de tenant (docs corporativos)."
      },
      { h: "7. SLA", p: "Objetivo de disponibilidad 99,5 % mensual; soporte en 48 h laborables; incidentes críticos en 24 h. Detalle en /sla." },
      { h: "8. Limitación de responsabilidad", p: "Servicio «tal cual». No respondemos por daños indirectos en la medida permitida por ley." },
      { h: "9. Contacto", p: `${LEGAL} · ${PRIVACY}` },
      {
        h: "10. WhatsApp y Meta",
        p: `Integraciones sujetas a condiciones Meta (${META_BUSINESS_TOOLS_TERMS}). ${metaExtraEs} Dakinis Systems no es Meta ni WhatsApp.`
      },
      { h: "11. Automatización e IA", p: aiEs }
    ]
  },
  notice: {
    title: "Aviso legal",
    sections: [
      { h: "1. Titular (LSSI)", p: controllerEs },
      { h: "2. Objeto", p: "Aplicación web Dakinis One — panel SaaS multi-tenant." },
      { h: "3. Propiedad intelectual", p: "Código, diseño y marcas protegidos." },
      { h: "4. Enlaces", p: `Información corporativa: ${CORPORATE}` }
    ]
  },
  security: {
    title: "Política de seguridad",
    sections: [
      { h: "1. Transporte", p: "HTTPS/TLS obligatorio en producción." },
      { h: "2. Contraseñas", p: "Almacenamiento con hash seguro (bcrypt u equivalente)." },
      { h: "3. Multi-tenant", p: "Aislamiento por business_id en API y base de datos." },
      { h: "4. Acceso", p: "Roles de usuario, admin de tenant y platform admin." },
      { h: "5. Backups", p: "Copias periódicas de PostgreSQL según procedimiento operativo." },
      { h: "6. Monitorización", p: "Registro estructurado e revisión de incidentes." },
      {
        h: "7. Vulnerabilidades",
        p: `Reportar a ${HELP} o ${LEGAL}.`
      },
      { h: "8. Limitación", p: "Medidas razonables; ningún sistema es totalmente invulnerable." }
    ]
  },
  sla: {
    title: "Acuerdo de nivel de servicio (SLA)",
    sections: [
      { h: "1. Operador", p: controllerEs },
      { h: "2. Disponibilidad", p: "Objetivo de disponibilidad del servicio: 99,5 % mensual (excluye mantenimiento programado comunicado)." },
      { h: "3. Soporte", p: "Respuesta general: 48 horas laborables. Incidentes críticos: 24 horas." },
      { h: "4. Exclusiones", p: "Fuerza mayor, fallos de terceros fuera de control razonable y mantenimiento anunciado." },
      { h: "5. Contacto", p: `${HELP} · ${LEGAL}` }
    ]
  },
  cookies: {
    title: "Política de cookies",
    sections: [
      {
        h: "1. Resumen",
        p: "Dakinis One no usa Google Analytics, Meta Pixel ni cookies de publicidad. Si las añadimos, actualizaremos esta política y solicitaremos consentimiento cuando sea exigible."
      },
      {
        h: "2. Almacenamiento estrictamente necesario",
        p: "Token de sesión JWT, preferencia de idioma y datos de sesión del tenant en almacenamiento local o cookies de sesión. Son imprescindibles para el login y el panel."
      },
      {
        h: "3. Analítica",
        p: "Actualmente no hay cookies de analítica. Ver también la sección 10 de /privacy."
      },
      {
        h: "4. Contacto",
        p: `Consultas: ${PRIVACY} · ${LEGAL}. Política corporativa: ${CORPORATE}`
      }
    ]
  },
  refunds: {
    title: "Política de reembolsos",
    sections: [
      {
        h: "1. Suscripciones B2B",
        p: "Los planes Growth y Pro se facturan vía Stripe. La renovación es automática hasta cancelación desde Ajustes o el portal de cliente."
      },
      {
        h: "2. Reembolsos",
        p: "Salvo obligación legal, no hay reembolso de periodos ya facturados. Cancela antes de la fecha de renovación para evitar cargos futuros."
      },
      {
        h: "3. Errores de cobro",
        p: "Cargos duplicados o incorrectos: billing@dakinissystems.com en un plazo de 14 días."
      },
      { h: "4. Contacto", p: `billing@dakinissystems.com · ${LEGAL}` }
    ]
  }
};

export const legalCoreEn = {
  back: "← Home",
  updated: UPDATED_EN,
  corporateLink: "Corporate policy",
  faq: {
    title: "FAQ",
    sections: [
      {
        h: "What is Dakinis One?",
        p: "Multi-tenant SaaS panel for business types (clinic, salon, restaurant, real estate)."
      },
      {
        h: "How to contact?",
        p: `Contact section at ${CORPORATE} or ${PRIVACY}.`
      }
    ]
  },
  privacy: {
    title: "Privacy policy",
    sections: [
      { h: "1. Controller", p: controllerEn },
      {
        h: "2. Scope",
        p: "This policy covers core.dakinissystems.com (Dakinis One): login, tenant panels, public allergy posters, inventory/stock, CRM/clients, appointments, and /app routes."
      },
      {
        h: "3. Data we process",
        p: "Email, password (secure hash), role, business data (slug, type), tenant records (CRM/clients, appointments, notes), allergen checklist, restaurant module data (menu, orders, invoices with customer tax details when entered by the tenant), inventory/stock (items, barcodes, movements, optional lots/expiry), and communications (e.g. WhatsApp Business when the tenant enables it)."
      },
      {
        h: "3bis. Roles: Dakinis vs tenant",
        p: "Dakinis Systems acts as a processor for end-customer personal data that the business (tenant) enters into Dakinis One. The tenant is the controller toward its customers (diners, patients, etc.) and must have its own legal basis. Dakinis processes that data only to provide the SaaS service to the tenant."
      },
      {
        h: "4. Public allergy poster",
        p: "The /alergenos/... page shows only information the restaurant chooses to display. No diner account is required."
      },
      {
        h: "5. Purpose and legal basis",
        p: "Provide the contracted service, security, and legitimate interest. We do not sell personal data."
      },
      { h: "6. Processors", p: processorsEn },
      { h: "7. Retention", p: retentionEn },
      {
        h: "8. International transfers",
        p: "Some processors (Railway, Meta, Stripe, or OAuth) may process data outside the EEA. Where applicable, we use Standard Contractual Clauses (SCCs) or equivalent safeguards."
      },
      {
        h: "9. Security measures",
        p: "HTTPS, tenant isolation, password hashing. See /security."
      },
      {
        h: "10. Analytics",
        p: "We currently do not use analytics cookies on Dakinis One. If added, we will update this policy and request consent where required."
      },
      { h: "11. Minors", p: minAgeEn },
      {
        h: "12. Your rights",
        p: `Access, rectification, erasure, objection, restriction, and portability at ${PRIVACY}. AEPD complaint: ${AEPD}`
      },
      { h: "13. Data export", p: exportEn },
      {
        h: "14. Communications and WhatsApp",
        p: "The Communications module supports templates and previews. WhatsApp Business API only when the tenant enables the integration."
      },
      {
        h: "15. Meta Business Tools",
        p: `WhatsApp Business API and other Meta tools: ${META_BUSINESS_TOOLS_TERMS}. Meta DPA: ${META_DATA_PROCESSING_TERMS}. ${metaExtraEn}`
      },
      {
        h: "16. Tenant obligations (Meta)",
        p: `Lawful basis required; do not share data on children under ${MIN_AGE} or prohibited categories; provide notices and opt-out links (${AD_CHOICES}, ${EU_AD_CHOICES}). WhatsApp: ${WHATSAPP_BUSINESS_TERMS}.`
      },
      { h: "17. Automation and AI", p: aiEn }
    ]
  },
  terms: {
    title: "Terms of use",
    sections: [
      { h: "1. Acceptance", p: "By using Dakinis One you accept these terms." },
      { h: "2. Operator", p: controllerEn },
      {
        h: "3. Nature of the service",
        p: "B2B multi-tenant SaaS. May include demo environments; do not use real end-customer data without a commercial agreement."
      },
      { h: "4. Accounts and tenants", p: "Each business is isolated. You are responsible for your credentials." },
      { h: "5. Acceptable use", p: "Do not access other tenants' data or perform unauthorized security testing." },
      {
        h: "6. Subscription and non-payment",
        p: "Non-payment may downgrade your contracted plan until payment is regularized (effective Starter plan). Dakinis Systems may suspend or close accounts for serious breach, abuse, or legal requirement. See the tenant access policy (corporate docs) for details."
      },
      { h: "7. SLA", p: "Service availability target 99.5% monthly; support within 48 business hours; critical incidents within 24 hours. Details at /sla." },
      { h: "8. Limitation of liability", p: "Service provided as is. No liability for indirect damages to the extent permitted by law." },
      { h: "9. Contact", p: `${LEGAL} · ${PRIVACY}` },
      {
        h: "10. WhatsApp and Meta",
        p: `Integrations subject to Meta terms (${META_BUSINESS_TOOLS_TERMS}). ${metaExtraEn} Dakinis Systems is not Meta or WhatsApp.`
      },
      { h: "11. Automation and AI", p: aiEn }
    ]
  },
  notice: {
    title: "Legal notice",
    sections: [
      { h: "1. Owner (LSSI)", p: controllerEn },
      { h: "2. Purpose", p: "Dakinis One web application — multi-tenant SaaS panel." },
      { h: "3. Intellectual property", p: "Code, design, and trademarks are protected." },
      { h: "4. Links", p: `Corporate information: ${CORPORATE}` }
    ]
  },
  security: {
    title: "Security policy",
    sections: [
      { h: "1. Transport", p: "Mandatory HTTPS/TLS in production." },
      { h: "2. Passwords", p: "Secure hashing (bcrypt or equivalent)." },
      { h: "3. Multi-tenant", p: "Isolation by business_id in API and database." },
      { h: "4. Access", p: "User roles, tenant admin, and platform admin." },
      { h: "5. Backups", p: "Periodic PostgreSQL backups per operational procedure." },
      { h: "6. Monitoring", p: "Structured logging and incident review." },
      {
        h: "7. Vulnerabilities",
        p: `Report to ${HELP} or ${LEGAL}.`
      },
      { h: "8. Limitation", p: "Reasonable measures; no system is fully invulnerable." }
    ]
  },
  sla: {
    title: "Service level agreement (SLA)",
    sections: [
      { h: "1. Operator", p: controllerEn },
      { h: "2. Availability", p: "Service availability target: 99.5% monthly (excluding announced scheduled maintenance)." },
      { h: "3. Support", p: "General response: 48 business hours. Critical incidents: 24 hours." },
      { h: "4. Exclusions", p: "Force majeure, third-party failures outside reasonable control, and announced maintenance." },
      { h: "5. Contact", p: `${HELP} · ${LEGAL}` }
    ]
  },
  cookies: {
    title: "Cookie policy",
    sections: [
      {
        h: "1. Summary",
        p: "Dakinis One does not use Google Analytics, Meta Pixel, or advertising cookies. If we add them, we will update this policy and request consent where required."
      },
      {
        h: "2. Strictly necessary storage",
        p: "JWT session token, language preference, and tenant session data in local storage or session cookies. Required for login and the dashboard."
      },
      {
        h: "3. Analytics",
        p: "We currently do not use analytics cookies. See also section 10 of /privacy."
      },
      {
        h: "4. Contact",
        p: `Questions: ${PRIVACY} · ${LEGAL}. Corporate policy: ${CORPORATE}`
      }
    ]
  },
  refunds: {
    title: "Refund policy",
    sections: [
      {
        h: "1. B2B subscriptions",
        p: "Growth and Pro plans are billed via Stripe. Renewal is automatic until cancelled from Settings or the customer portal."
      },
      {
        h: "2. Refunds",
        p: "Unless required by law, billed periods are non-refundable. Cancel before renewal to avoid future charges."
      },
      {
        h: "3. Billing errors",
        p: "Duplicate or incorrect charges: billing@dakinissystems.com within 14 days."
      },
      { h: "4. Contact", p: `billing@dakinissystems.com · ${LEGAL}` }
    ]
  }
};
