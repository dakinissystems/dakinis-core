/** English UI strings. */
export default {
  nav: {
    packages: "Plans",
    login: "Log in",
    quote: "Request a quote",
    platformPanel: "Platform admin",
    myBusiness: "My business",
    panelMockup: "Panel mockup",
    platformAdmin: "Platform administrator",
    logout: "Log out",
    language: "Language",
    corporateSite: "Dakinis Systems — corporate site",
    homeApp: "Go to app home"
  },
  footer: {
    navAria: "Footer links",
    copyright:
      "© {year} Dakinis Systems (trading name of Christian Villar). All rights reserved.",
    faq: "FAQ",
    privacy: "Privacy",
    terms: "Terms",
    legalNotice: "Legal notice",
    packages: "Plans",
    contact: "Contact",
    access: "Sign in"
  },
  home: {
    hero: {
      kicker: "PHASE 2 — Multi-tenant SaaS (SQLite MVP)",
      h1Line1: "Fewer cancellations.",
      h1Line2: "More clients.",
      h1Line3: "More control.",
      benefit:
        "Saves you time, keeps your business organised, and reduces mistakes with bookings, orders and follow-ups — no spreadsheet chaos.",
      demoLead:
        "Technical demo: each business has its own isolated environment and login; ready to grow with you.",
      ctaQuote: "Request a quote",
      ctaTalk: "Talk about your project",
      loginAdmin: "Admin login",
      viewDemos: "View system demos",
      stack: "Stack: React + Node + SQLite (PostgreSQL-ready).",
      cardLi1Prefix: "Data scoped by ",
      cardLi1Suffix: " in the API",
      cardLi2: "Mockups wired to the database",
      cardLi3: "JWT + master API key for development only"
    },
    modules: {
      title: "Demo tenants by business type",
      lead:
        "Seed slugs: clinica-demo, peluqueria-demo, inmobiliaria-demo, restaurante-demo. Dev API key:",
      adminCta: "Platform administration (businesses and users)",
      mockTitle: "Panel preview (mockup)",
      mockLead: "Static layout preview of how the product could look by vertical.",
      vistaPrefix: "Preview ·",
      sessionNote: "Session: you only see your business type (",
      sessionNoteEnd: ")."
    },
    pricing: {
      kicker: "Pricing and next step",
      maintenanceHeading: "Monthly maintenance",
      contactTitle: "Let’s talk",
      contactLead:
        "Tell us your idea and we’ll outline how to build it, what it would cost, and how long it would take.",
      emailCta: "Email us",
      whatsappCta: "WhatsApp"
    },
    demo: {
      title: "Dakinis One — technical demo",
      lead: "Explore demo tenants, mockups and JWT login. Postgres and Stripe in the next phase.",
      enterAdmin: "Enter as admin",
      viewSystems: "View systems"
    },
    demoTenant: {
      ribbonTitle: "You’re on a demo account",
      ribbonLead:
        "Use the mockup for an app-style panel preview, then scroll for tenant-persisted data. Password: demo123.",
      toPanel: "Open my functional panel",
      toMockup: "Open interactive mockup",
      benefitIntro: "Why try your vertical here:"
    }
  },
  systemDemo: {
    badge: "Demo (seed) account",
    accountLine: "Signed in as: {email}",
    passwordLabel: "Password for this demo",
    benefitsTitle: "What to explore in this vertical",
    mockupPrimary: "Open panel mockup — {label}",
    toHome: "Back to home",
    functionalHint:
      "Below: forms and tables with real per-tenant persistence (SQLite). The mockup is interactive layout only.",
    verticals: {
      clinica: {
        headline: "Clinic demo: scheduling and patients without the mess",
        lead: "Your data is isolated from other businesses. Pair the visual mockup with the functional flow below.",
        benefits: [
          "Mockup: browse the panel like the final app (no API).",
          "Functional panel: records stored in the database per tenant.",
          "Sample automations for reminders and commercial follow-up."
        ]
      },
      peluqueria: {
        headline: "Barbershop/salon demo: stylist agenda and bookings",
        lead: "See how shifts and suppliers fit in one place.",
        benefits: [
          "Mockup: preview of the salon with typical sections.",
          "Persisted demo data for appointments and stock hints.",
          "Quick paths to bookings and loyalty in the page content."
        ]
      },
      restaurante: {
        headline: "Restaurant demo: floor and daily operations",
        lead: "See how orders, shifts and alerts fit in one panel.",
        benefits: [
          "Mockup: front-of-house and back-of-house layout.",
          "Forms with persistence to simulate operational load.",
          "KPIs and copy focused on ticket and occupancy."
        ]
      },
      inmobiliaria: {
        headline: "Real estate demo: visits and sales pipeline",
        lead: "Combine leads, visits and suppliers in a demo aligned with your vertical.",
        benefits: [
          "Mockup: funnel and board to show your sales team.",
          "Per-tenant records for leads and follow-up.",
          "Suppliers and alerts like in real operations."
        ]
      }
    }
  },
  pricing: {
    intro: {
      title: "Clear packages",
      subtitle:
        "We don’t sell loose hours: you choose a scope with a fixed price and timeline. On the call I recommend a specific package within these ranges — no vague “we’ll see”.",
      portfolioNote:
        "Reduced rates while I expand my portfolio of real projects; same proven base that speeds delivery.",
      valuePoints: [
        "I already have a foundation built — we don’t start from zero.",
        "That lowers cost, time and risk for you.",
        "Focused on solving your operations (time, mess, mistakes), not tech jargon."
      ]
    },
    deliveryLabel: "Delivery:",
    pack: {
      mvp: {
        badge: "Pack 1",
        name: "Fast MVP",
        audience: "For smaller clients — your entry offer",
        delivery: "5 – 10 days",
        pitch: "I’ll leave you with a working system in under 10 days so you can start operating.",
        includes: [
          "Basic login",
          "Functional panel",
          "1 module (schedule / clients / orders)",
          "Deployment included"
        ]
      },
      pro: {
        badge: "Pack 2",
        name: "Professional system",
        audience: "Your main product",
        delivery: "2 – 4 weeks",
        pitch: "I’ll build a complete system tailored to your business.",
        includes: [
          "Everything in the MVP +",
          "2–3 modules (schedule + CRM + automation)",
          "User roles",
          "UX improvements",
          "Scalable foundation"
        ]
      },
      advanced: {
        badge: "Pack 3",
        name: "Advanced bespoke solution",
        audience: "Only when your case needs it",
        delivery: "Scope-dependent (fixed in proposal)",
        pitch: "Integrations, business rules and automation when the standard offering isn’t enough.",
        includes: [
          "Integrations (WhatsApp, external APIs)",
          "Complex automations",
          "Logic specific to your operations"
        ]
      }
    },
    maintenancePitch:
      "After launch you can maintain and improve it step by step — no surprises.",
    maintenance: {
      basic: {
        name: "Basic support",
        description: "Incidents, small tweaks and keeping the system healthy in production."
      },
      plus: {
        name: "Support + improvements",
        description: "Priority support and monthly capacity for small, guided improvements."
      }
    }
  },
  login: {
    kicker: "Multi-tenant SaaS access",
    title: "Sign in",
    demoPassword: "Demo password for all tenants:",
    tenants: {
      clinic: "Aesthetic clinic",
      barber: "Premium barbershop",
      restaurant: "Premium restaurant",
      estate: "Real estate"
    },
    platformAdmin:
      "Platform — if the server sets DAKINIS_PLATFORM_TOTP_SECRET, a TOTP code is required in addition to the password.",
    email: "Email",
    password: "Password",
    totpLabel: "TOTP code (platform administrator)",
    totpPlaceholder: "6 digits",
    submitting: "Signing in…",
    submit: "Sign in",
    back: "Back",
    errors: {
      totpRequired: "Enter the 6-digit code from your authenticator app.",
      noData:
        "Login: empty response. Check VITE_API_BASE_URL and that the seed exists in the database.",
      incomplete: "Incomplete login: missing token or business type in the response.",
      generic: "Login error"
    }
  },
  legal: {
    back: "← Home",
    faq: {
      title: "FAQ",
      body:
        "Frequently asked questions about Dakinis One. This content will grow; for specific help, use the contact section on the main page."
    },
    privacy: {
      title: "Privacy",
      body:
        "Information about personal data processing when using this application. Full legal text in preparation; for ARCO rights or privacy questions, use the channels listed on the Dakinis Systems corporate site."
    },
    terms: {
      title: "Terms",
      body:
        "Terms and conditions of use. Draft; demo and trial environments are subject to what is agreed in writing per project."
    },
    notice: {
      title: "Legal notice",
      body:
        "Legal notice and information about the site and service owner. Dakinis Systems (trading name of Christian Villar). Registration details and applicable law: being updated."
    }
  },
  doc: {
    default: "Dakinis One | Scheduler + CRM + WhatsApp",
    login: "Sign in · Dakinis One",
    admin: "Platform administration · Dakinis One",
    faq: "FAQ · Dakinis One",
    privacy: "Privacy · Dakinis One",
    terms: "Terms · Dakinis One",
    legal: "Legal notice · Dakinis One",
    vista: "Preview · {label} · Dakinis One",
    sistema: "{label} · Dakinis One"
  },
  vistaMockup: {
    kicker: "Preview · layout only",
    title: "App-style panel — {label}",
    lead:
      "Visual example of how the app could look for this business type; no data persistence or API calls.",
    home: "Home",
    platformAdmin: "Platform administration",
    goDemoSystem: "Open demo system",
    myFunctionalPanel: "My functional panel"
  }
};
