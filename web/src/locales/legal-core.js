const PRIVACY = "privacy@dakinis-systems.com";
const LEGAL = "legal@dakinis-systems.com";
const CORPORATE = "https://dakinissystems.com/";
const META_BUSINESS_TOOLS_TERMS = "https://www.facebook.com/legal/terms/businesstools";
const META_DATA_PROCESSING_TERMS = "https://www.facebook.com/legal/terms/dataprocessing";
const WHATSAPP_BUSINESS_TERMS = "https://www.whatsapp.com/legal/business-terms";
const AD_CHOICES = "https://www.aboutads.info/choices";
const EU_AD_CHOICES = "https://www.youronlinechoices.eu/";

export const legalCoreEs = {
  back: "← Inicio",
  updated: "Última actualización: 3 de junio de 2026",
  corporateLink: "Política corporativa",
  faq: {
    title: "FAQ",
    sections: [
      {
        h: "¿Qué es Dakinis One?",
        p: "Demo y panel SaaS multi-tenant para distintos tipos de negocio (clínica, peluquería, restaurante, inmobiliaria). Algunas funciones son maquetación; otras persisten datos por tenant en la API."
      },
      {
        h: "¿Cómo contacto?",
        p: `Usa la sección de contacto en ${CORPORATE} o escribe a ${PRIVACY}.`
      }
    ]
  },
  privacy: {
    title: "Política de privacidad",
    sections: [
      {
        h: "1. Responsable",
        p: `Dakinis Systems (nombre comercial de Christian Villar). Contacto privacidad: ${PRIVACY}. Sitio corporativo: ${CORPORATE}`
      },
      {
        h: "2. Ámbito",
        p: "Esta política aplica a core.dakinissystems.com (Dakinis One): login, paneles por tenant, cartel público de alérgenos y rutas /app de prueba API."
      },
      {
        h: "3. Datos que tratamos",
        p: "Email, contraseña (almacenada de forma segura en el servidor), rol de usuario, datos del negocio (slug, tipo), registros operativos del tenant, checklist de alérgenos y nombre del local si usas el módulo restaurante."
      },
      {
        h: "4. Cartel público de alergias",
        p: "La página /alergenos/... muestra solo la información que el restaurante marca como visible. No exige cuenta del comensal. El restaurante puede editar el cartel si inicia sesión como admin de su tenant."
      },
      {
        h: "5. Finalidad y base legal",
        p: "Prestar el servicio contratado o demo autorizada, seguridad de la plataforma e interés legítimo. No vendemos datos personales."
      },
      {
        h: "6. Encargados",
        p: "Hosting (p. ej. Railway) y base de datos (SQLite en demo, PostgreSQL en producción según despliegue)."
      },
      {
        h: "7. Conservación y seguridad",
        p: "Conservamos datos mientras la cuenta o el tenant estén activos o sea necesario por ley. Aplicamos medidas técnicas razonables (HTTPS, aislamiento por tenant)."
      },
      {
        h: "8. Google y analítica",
        p: "Dakinis One no usa login con Google ni cookies de analítica en el estado actual. Si se añaden integraciones, actualizaremos esta política."
      },
      {
        h: "9. Tus derechos",
        p: `Puedes solicitar acceso, rectificación o supresión en ${PRIVACY}. Reclamación ante la AEPD: www.aepd.es.`
      },
      {
        h: "10. Comunicaciones y WhatsApp",
        p: "El módulo Comunicaciones (ruta /app/messages) permite plantillas, reglas y vistas previa de mensajes. El envío real por WhatsApp Business API solo aplica cuando el tenant activa la integración y dispone de cuenta y permisos de Meta/WhatsApp."
      },
      {
        h: "11. Condiciones de las herramientas empresariales de Meta",
        p: `Si usas WhatsApp Business API, píxel de Meta, API de conversiones u otras herramientas empresariales de Meta a través de Dakinis One o tus propios canales vinculados al tenant, también se aplican las Condiciones de las herramientas empresariales de Meta (texto oficial: ${META_BUSINESS_TOOLS_TERMS}). Meta puede tratar «Datos de herramientas empresariales», incluida información de contacto (para coincidencias, con cifrado según su documentación) y datos de eventos (acciones en tu web, app o tienda). En la UE, pueden aplicarse las Condiciones del tratamiento de los datos de Meta (${META_DATA_PROCESSING_TERMS}) y, según el caso, tratamiento conjunto (art. 26 RGPD) entre tú y Meta Ireland para ciertos datos de eventos.`
      },
      {
        h: "12. Obligaciones del tenant frente a Meta y a tus clientes",
        p: `Como responsable del tratamiento frente a tus clientes finales debes, entre otras cosas: (a) tener base legal y, si procede, consentimiento para compartir datos con Meta y enviar mensajes comerciales; (b) no compartir datos de menores de 13 años ni categorías prohibidas por Meta; (c) cifrar la información de contacto según exija Meta; (d) mostrar en tu web y app un aviso claro sobre tecnologías de terceros (incl. Meta) para medición y publicidad, y enlaces de exclusión (p. ej. ${AD_CHOICES} y ${EU_AD_CHOICES}); (e) obtener consentimiento previo donde la ley lo exija antes de cookies o SDK de Meta en dispositivos de usuarios; (f) notificarnos sin demora reclamaciones relacionadas con herramientas Meta y colaborar en su respuesta. Meta puede conservar datos de eventos hasta dos años y usar datos para mensajes comerciales en Messenger/WhatsApp según sus condiciones. WhatsApp Business: ${WHATSAPP_BUSINESS_TERMS}. Dudas: ${PRIVACY}.`
      }
    ]
  },
  terms: {
    title: "Términos de uso",
    sections: [
      {
        h: "1. Aceptación",
        p: "Al usar Dakinis One aceptas estos términos. Si no estás de acuerdo, no uses el servicio."
      },
      {
        h: "2. Naturaleza del servicio",
        p: "Incluye entornos demo con credenciales de prueba. No uses datos reales de clientes finales sin acuerdo comercial y despliegue adecuado."
      },
      {
        h: "3. Cuentas y tenants",
        p: "Cada negocio opera en un espacio aislado. Eres responsable de la confidencialidad de tus credenciales."
      },
      {
        h: "4. Uso permitido",
        p: "No intentes acceder a datos de otros tenants, ni realizar pruebas de intrusión sin autorización."
      },
      {
        h: "5. Limitación de responsabilidad",
        p: "El servicio se ofrece «tal cual» en fase demo/MVP. Dakinis Systems no responde por daños indirectos derivados del uso de prueba."
      },
      {
        h: "6. Contacto",
        p: `${LEGAL}`
      },
      {
        h: "7. WhatsApp, Comunicaciones y Meta",
        p: `El módulo Comunicaciones y cualquier integración con WhatsApp Business API están sujetos a las condiciones de WhatsApp y a las Condiciones de las herramientas empresariales de Meta (${META_BUSINESS_TOOLS_TERMS}), además de estos términos. Dakinis Systems no es Meta ni WhatsApp; no garantizamos la disponibilidad de APIs de terceros. El tenant es responsable del cumplimiento de las condiciones de Meta, de obtener los consentimientos necesarios y de las políticas de mensajería comercial aplicables.`
      }
    ]
  },
  notice: {
    title: "Aviso legal",
    sections: [
      {
        h: "1. Titular",
        p: `Dakinis Systems — nombre comercial de Christian Villar (España). ${LEGAL} · ${PRIVACY}`
      },
      {
        h: "2. Objeto del sitio",
        p: "Aplicación web Dakinis One para demostración y operación de paneles multi-tenant."
      },
      {
        h: "3. Propiedad intelectual",
        p: "Código, diseño y marcas protegidos. Queda prohibida la reproducción no autorizada."
      },
      {
        h: "4. Enlaces",
        p: `Información corporativa en ${CORPORATE}`
      }
    ]
  }
};

export const legalCoreEn = {
  back: "← Home",
  updated: "Last updated: June 3, 2026",
  corporateLink: "Corporate policy",
  faq: {
    title: "FAQ",
    sections: [
      {
        h: "What is Dakinis One?",
        p: "A multi-tenant SaaS demo and panel for business types (clinic, salon, restaurant, real estate). Some views are mockups; others persist per-tenant data via the API."
      },
      {
        h: "How to contact?",
        p: `Use the contact section at ${CORPORATE} or email ${PRIVACY}.`
      }
    ]
  },
  privacy: {
    title: "Privacy policy",
    sections: [
      {
        h: "1. Controller",
        p: `Dakinis Systems (trading name of Christian Villar). Privacy: ${PRIVACY}. Corporate site: ${CORPORATE}`
      },
      {
        h: "2. Scope",
        p: "This policy covers core.dakinissystems.com (Dakinis One): login, tenant panels, public allergy posters, and /app API test routes."
      },
      {
        h: "3. Data we process",
        p: "Email, password (stored securely on the server), user role, business data (slug, type), tenant operational records, allergen checklist, and venue name for the restaurant module."
      },
      {
        h: "4. Public allergy poster",
        p: "The /alergenos/... page shows only information the restaurant chooses to display. No diner account is required. The restaurant may edit the poster when signed in as its tenant admin."
      },
      {
        h: "5. Purpose and legal basis",
        p: "Provide the contracted or authorized demo service, platform security, and legitimate interest. We do not sell personal data."
      },
      {
        h: "6. Processors",
        p: "Hosting (e.g. Railway) and database (SQLite in demo, PostgreSQL in production depending on deployment)."
      },
      {
        h: "7. Retention and security",
        p: "We keep data while the account or tenant is active or required by law. We use reasonable measures (HTTPS, tenant isolation)."
      },
      {
        h: "8. Google and analytics",
        p: "Dakinis One does not use Google sign-in or analytics cookies currently. If integrations are added, this policy will be updated."
      },
      {
        h: "9. Your rights",
        p: `You may request access, rectification, or erasure at ${PRIVACY}. Complaints to the Spanish DPA (AEPD): www.aepd.es.`
      },
      {
        h: "10. Communications and WhatsApp",
        p: "The Communications module (/app/messages) supports templates, rules, and message previews. Actual sending via WhatsApp Business API only applies when the tenant enables the integration and holds valid Meta/WhatsApp accounts and permissions."
      },
      {
        h: "11. Meta Business Tools Terms",
        p: `If you use WhatsApp Business API, Meta Pixel, Conversions API, or other Meta Business Tools through Dakinis One or your own channels linked to the tenant, Meta’s Business Tools Terms also apply (official text: ${META_BUSINESS_TOOLS_TERMS}). Meta may process “Business Tool Data”, including contact information (for matching, encrypted per Meta’s documentation) and event data (actions on your website, app, or store). In the EU/EEA, Meta’s Data Processing Terms (${META_DATA_PROCESSING_TERMS}) may apply, and in some cases joint controllership (GDPR Art. 26) between you and Meta Ireland for certain event data.`
      },
      {
        h: "12. Tenant obligations regarding Meta and your customers",
        p: `As controller for your end-customers you must, among other things: (a) have a lawful basis and, where required, consent to share data with Meta and send commercial messages; (b) not share data relating to children under 13 or prohibited categories under Meta’s terms; (c) encrypt contact information as required by Meta; (d) provide a clear notice on your website and app about third-party technologies (including Meta) for measurement and advertising, with opt-out links (e.g. ${AD_CHOICES} and ${EU_AD_CHOICES}); (e) obtain prior consent where the law requires it before Meta cookies or SDKs on end-users’ devices; (f) promptly notify us of claims related to Meta tools and cooperate in responses. Meta may retain event data for up to two years and use data for commercial messaging on Messenger/WhatsApp per its terms. WhatsApp Business: ${WHATSAPP_BUSINESS_TERMS}. Questions: ${PRIVACY}.`
      }
    ]
  },
  terms: {
    title: "Terms of use",
    sections: [
      {
        h: "1. Acceptance",
        p: "By using Dakinis One you accept these terms. If you disagree, do not use the service."
      },
      {
        h: "2. Nature of the service",
        p: "Includes demo environments with test credentials. Do not use real end-customer data without a commercial agreement and proper deployment."
      },
      {
        h: "3. Accounts and tenants",
        p: "Each business operates in an isolated space. You are responsible for keeping credentials confidential."
      },
      {
        h: "4. Acceptable use",
        p: "Do not access other tenants’ data or perform unauthorized security testing."
      },
      {
        h: "5. Limitation of liability",
        p: "The service is provided “as is” in demo/MVP phase. Dakinis Systems is not liable for indirect damages from trial use."
      },
      {
        h: "6. Contact",
        p: `${LEGAL}`
      },
      {
        h: "7. WhatsApp, Communications, and Meta",
        p: `The Communications module and any WhatsApp Business API integration are subject to WhatsApp’s terms and Meta Business Tools Terms (${META_BUSINESS_TOOLS_TERMS}), in addition to these terms. Dakinis Systems is not Meta or WhatsApp; we do not guarantee third-party API availability. The tenant is responsible for complying with Meta’s terms, obtaining required consents, and applicable commercial messaging rules.`
      }
    ]
  },
  notice: {
    title: "Legal notice",
    sections: [
      {
        h: "1. Owner",
        p: `Dakinis Systems — trading name of Christian Villar (Spain). ${LEGAL} · ${PRIVACY}`
      },
      {
        h: "2. Purpose",
        p: "Dakinis One web application for multi-tenant panel demonstration and operation."
      },
      {
        h: "3. Intellectual property",
        p: "Code, design, and trademarks are protected. Unauthorized reproduction is prohibited."
      },
      {
        h: "4. Links",
        p: `Corporate information at ${CORPORATE}`
      }
    ]
  }
};
