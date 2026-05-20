export default {
  clinica: {
    pageTitle: "System for Aesthetic Clinic",
    pageDescription:
      "Centralize medical scheduling, patient follow-up, and confirmation automation to reduce no-shows.",
    highlights: [
      "Fewer no-shows on treatments",
      "Automated post-session follow-up",
      "Commercial view of the patient"
    ],
    ctaLabel: "Request demo for clinic",
    kpis: [
      { label: "Appointments today", value: "28" },
      { label: "No-show", value: "6%" },
      { label: "Reactivated patients", value: "14" },
      { label: "Estimated revenue", value: "€3,420" }
    ],
    workflow: [
      {
        title: "Medical schedule",
        items: ["09:00 Facial cleansing", "10:30 Botox - Room 2", "12:00 Post-treatment check-up"]
      },
      {
        title: "Patient follow-up",
        items: ["7 patients unconfirmed", "3 pending reschedule", "2 VIP for callback"]
      },
      {
        title: "Payment and close",
        items: ["4 quotes to close", "2 suggested upsells", "Cash register projected at 85%"]
      }
    ],
    automations: [
      "Automatic reminder 24h and 2h before",
      "Post-treatment message with recommendations",
      "Reactivation of inactive patients after 45 days"
    ],
    quickActions: ["Open today's schedule", "Send reactivation campaign", "View unconfirmed patients"],
    suppliersProducts: {
      sectionTitle: "Suppliers and products by supplier",
      sectionLead:
        "Each treatment can be linked to consumables cataloged by their usual supplier. Illustrative example.",
      supplierRows: [
        {
          name: "DermaMedical Dist.",
          contact: "Demo orders",
          niche: "Fillers, toxin, peeling"
        },
        {
          name: "Laboratorio SkinPro",
          contact: "Laura — regional sales",
          niche: "Clinical cosmetics, post-treatment"
        }
      ],
      productRows: [
        {
          supplier: "DermaMedical Dist.",
          product: "Hyaluronic acid 1 ml",
          reference: "DM-HYA-01",
          note: "Low consumption"
        },
        {
          supplier: "DermaMedical Dist.",
          product: "Botulinum toxin 100 U",
          reference: "DM-TOX-100",
          note: "Within optimal range"
        },
        {
          supplier: "Laboratorio SkinPro",
          product: "Post-peeling cleansing kit",
          reference: "SP-POST-K2",
          note: "Restock next week"
        }
      ],
      incomingDeliveries: [
        {
          supplier: "DermaMedical Dist.",
          arrivalWindow: "Wed 7 May · 09:00–11:00",
          contents: "Toxin 100 U x6, HA 1 ml x12",
          status: "Confirmed"
        },
        {
          supplier: "Laboratorio SkinPro",
          arrivalWindow: "Fri 9 May · afternoon (warehouse)",
          contents: "Post-peeling kits seasonal",
          status: "In transit"
        }
      ],
      merchandiseAlerts: [
        {
          title: "Minimum toxin stock",
          productRef: "DM-TOX-100",
          condition: "Alert if fewer than 6 units remain",
          severity: "warning"
        },
        {
          title: "HA nearing expiry",
          productRef: "DM-HYA-01",
          condition: "Review batches expiring within the next 60 days",
          severity: "info"
        }
      ]
    }
  },
  peluqueria: {
    pageTitle: "System for Premium Hair Salon",
    pageDescription:
      "Manage stylists, online bookings, and loyalty programs to increase repeat visits and average ticket.",
    highlights: [
      "Schedule by chair and professional",
      "Frictionless online booking",
      "Automatic return campaigns"
    ],
    ctaLabel: "Request demo for hair salon",
    kpis: [
      { label: "Appointments today", value: "36" },
      { label: "Stylist occupancy", value: "89%" },
      { label: "Returning clients", value: "62%" },
      { label: "Average ticket", value: "€47" }
    ],
    workflow: [
      {
        title: "Salon schedule",
        items: ["09:00 Cut + styling", "10:00 Premium coloring", "11:30 Keratin treatment"]
      },
      {
        title: "Online bookings",
        items: ["5 new web bookings", "2 reschedules", "1 recovered cancellation"]
      },
      {
        title: "Loyalty",
        items: ["12 clients for return promo", "5 birthdays this week", "3 packages to suggest"]
      }
    ],
    automations: [
      "Automatic confirmation on booking",
      "Return campaign after 30 days without visit",
      "Personalized offer based on service history"
    ],
    quickActions: [
      "View stylist availability",
      "Publish low-occupancy promo",
      "Send WhatsApp to VIP clients"
    ],
    suppliersProducts: {
      sectionTitle: "Suppliers and products by supplier",
      sectionLead:
        "Dyes, bleaches, and treatments are linked to the wholesaler or brand that supplies them to the salon.",
      supplierRows: [
        { name: "ColorLux Professional", contact: "Online orders Mon–Fri", niche: "Premium coloring" },
        { name: "HairCare Mayorista", contact: "Northern sales rep", niche: "Treatment, keratin" }
      ],
      productRows: [
        {
          supplier: "ColorLux Professional",
          product: "Oxidation dye 60 ml — cool blonde",
          reference: "CL-60BF",
          note: "2 units in salon"
        },
        {
          supplier: "ColorLux Professional",
          product: "20 vol. developer",
          reference: "CL-OX20-1L",
          note: "Stock OK"
        },
        {
          supplier: "HairCare Mayorista",
          product: "Keratin treatment 500 ml",
          reference: "HC-K500",
          note: "Monthly order"
        }
      ],
      incomingDeliveries: [
        {
          supplier: "ColorLux Professional",
          arrivalWindow: "Tue 6 May · morning delivery north zone",
          contents: "Blonde/platinum dyes + developers",
          status: "Confirmed"
        },
        {
          supplier: "HairCare Mayorista",
          arrivalWindow: "Thu 8 May · window 14:00–16:00",
          contents: "Keratin and masks biweekly order",
          status: "Scheduled"
        }
      ],
      merchandiseAlerts: [
        {
          title: "20 vol. developer",
          productRef: "CL-OX20-1L",
          condition: "Alert if fewer than 1 bottle visible in technical area",
          severity: "warning"
        },
        {
          title: "Cool blonde dye",
          productRef: "CL-60BF",
          condition: "Weekly restock if sales > 8 units",
          severity: "info"
        }
      ]
    }
  },
  restaurante: {
    pageTitle: "System for Premium Restaurant",
    pageDescription:
      "Coordinate reservations by table and service, manage returning diners, and automate WhatsApp confirmations.",
    highlights: [
      "Floor plan by service shifts",
      "Stock and recipes (pizzas / empanadas)",
      "Updatable allergy QR",
      "Fewer no-shows at peak hours"
    ],
    ctaLabel: "Request demo for premium restaurant",
    kpis: [
      { label: "Covers today", value: "52" },
      { label: "Dining room occupancy", value: "84%" },
      { label: "Web reservations", value: "38%" },
      { label: "Average ticket", value: "€34" }
    ],
    workflow: [
      {
        title: "Table plan",
        items: ["20:00 Full terrace", "20:30 Table 4 — 4 pax", "21:00 Waitlist (3)"]
      },
      {
        title: "Service and kitchen",
        items: ["12 active orders", "2 overdue", "Priority desserts table 7"]
      },
      {
        title: "Clients and loyalty",
        items: ["6 birthdays this week", "4 VIP without reservation", "3 pending surveys"]
      }
    ],
    automations: [
      "Confirmation and 24h reminder via WhatsApp",
      "Allergy tagging on reservation",
      "Post-visit message with rating and promotion"
    ],
    quickActions: ["Open table map", "Free slot from cancellation", "Send offer to waitlist"],
    suppliersProducts: {
      sectionTitle: "Suppliers and products by supplier",
      sectionLead:
        "Manage which ingredients and beverages arrive from each supplier to keep cost sheets consistent.",
      supplierRows: [
        { name: "Mare Terra Alimentaria", contact: "Morning delivery", niche: "Fresh fish" },
        { name: "Bodegas y suministro local", contact: "Plaza sales rep", niche: "Wines and vermouth" }
      ],
      productRows: [
        {
          supplier: "Mare Terra Alimentaria",
          product: "Wild sea bass variable weight",
          reference: "MT-LUBINA",
          note: "Friday/Saturday special"
        },
        {
          supplier: "Mare Terra Alimentaria",
          product: "Steamed mussels bag 2 kg",
          reference: "MT-MEJ-2",
          note: "Frozen inventory"
        },
        {
          supplier: "Bodegas y suministro local",
          product: "DO Rueda white wine case x6",
          reference: "BS-RUEDA-X6",
          note: "Seasonal menu portion"
        }
      ],
      incomingDeliveries: [
        {
          supplier: "Mare Terra Alimentaria",
          arrivalWindow: "Every Tue · 07:30 (kitchen dock)",
          contents: "Fish and seafood weekend order",
          status: "Recurring"
        },
        {
          supplier: "Bodegas y suministro local",
          arrivalWindow: "Wed 7 May · 11:00",
          contents: "Menu white/red wines + vermouth barrel",
          status: "Confirmed"
        }
      ],
      merchandiseAlerts: [
        {
          title: "Frozen mussels",
          productRef: "MT-MEJ-2",
          condition: "Urgent order if freezer stock < 4 bags",
          severity: "warning"
        },
        {
          title: "Weekend sea bass",
          productRef: "MT-LUBINA",
          condition: "Coordinate with menu if event >40 covers",
          severity: "info"
        }
      ]
    }
  },
  inmobiliaria: {
    pageTitle: "System for Real Estate Agency",
    pageDescription:
      "Manage viewings, sales pipeline, and lead follow-up to close more deals.",
    highlights: [
      "Viewing schedule by property",
      "Clear funnel by sales stage",
      "Conversion metrics by agent"
    ],
    ctaLabel: "Request demo for real estate",
    kpis: [
      { label: "New leads", value: "22" },
      { label: "Scheduled viewings", value: "11" },
      { label: "Conversion rate", value: "18%" },
      { label: "Estimated commission", value: "€12,600" }
    ],
    workflow: [
      {
        title: "Viewing schedule",
        items: ["10:00 Downtown apartment", "12:00 North chalet", "17:30 Premium office"]
      },
      {
        title: "Sales pipeline",
        items: ["9 leads in contact", "6 in proposal", "3 in final negotiation"]
      },
      {
        title: "Deal closing",
        items: ["2 pending reservations", "1 signing this week", "4 price follow-ups"]
      }
    ],
    automations: [
      "Automatic viewing reminder to lead",
      "Post-viewing follow-up with interest survey",
      "Cold lead reactivation by area and budget"
    ],
    quickActions: ["Create guided viewing", "View pipeline by agent", "Launch cold lead follow-up"],
    suppliersProducts: {
      sectionTitle: "External partners and services by supplier",
      sectionLead:
        "Real estate operations coordinate photography, certifications, and external portals; here you see the catalog linked to each partner.",
      supplierRows: [
        { name: "Foto360 Interiors", contact: "Sessions Tuesday–Thursday", niche: "HDR photography and tour" },
        { name: "Portal Urbano Elite", contact: "Account manager", niche: "Featured listings and premium leads" },
        {
          name: "Notaria asociada López & Ruiz",
          contact: "Electronic signing appointment",
          niche: "Pre-contract and closing"
        }
      ],
      productRows: [
        {
          supplier: "Foto360 Interiors",
          product: "Apartment package up to 120 m²",
          reference: "F360-P120",
          note: "Includes 25 photos + floor plan"
        },
        {
          supplier: "Portal Urbano Elite",
          product: "30-day featured listing north zone",
          reference: "PUE-ZN-30",
          note: "Automatic renewal"
        },
        {
          supplier: "Notaria asociada López & Ruiz",
          product: "Standard deed signing preparation",
          reference: "NLR-E1",
          note: "Request after signed reservation"
        }
      ],
      incomingDeliveries: [
        {
          supplier: "Foto360 Interiors",
          arrivalWindow: "Thu 8 May · viewing south avenue apartment",
          contents: "HDR session + drone (after commercial key)",
          status: "Confirmed"
        },
        {
          supplier: "Portal Urbano Elite",
          arrivalWindow: "Online · automatic renewal",
          contents: "North zone featured listings — monthly cycle",
          status: "Active"
        }
      ],
      merchandiseAlerts: [
        {
          title: "Featured listings expiring",
          productRef: "PUE-ZN-30",
          condition: "Alert 5 days before featured listing ends",
          severity: "warning"
        },
        {
          title: "Standard photo package",
          productRef: "F360-P120",
          condition: "Follow up if valuation report not received within 48 h",
          severity: "info"
        }
      ]
    }
  }
};
