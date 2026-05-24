import bcrypt from "bcryptjs";
import { dakinisSqlInsertIgnore } from "./dialect.js";
import { dakinisQueryOne, dakinisRun } from "./query.js";

const DAKINIS_DEMO_PASSWORD = "demo123";

const DAKINIS_DEMO_BUSINESSES = [
  {
    id: "biz_platform_0001",
    slug: "dakinis-platform",
    name: "Dakinis (plataforma)",
    type: "platform",
    plan: "platform"
  },
  {
    id: "biz_00000000_0001",
    slug: "clinica-demo",
    name: "Clínica Demo (tenant)",
    type: "clinica",
    plan: "starter"
  },
  {
    id: "biz_00000000_0002",
    slug: "peluqueria-demo",
    name: "Peluquería Demo (tenant)",
    type: "peluqueria",
    plan: "starter"
  },
  {
    id: "biz_00000000_0003",
    slug: "inmobiliaria-demo",
    name: "Inmobiliaria Demo (tenant)",
    type: "inmobiliaria",
    plan: "starter"
  },
  {
    id: "biz_00000000_0004",
    slug: "restaurante-demo",
    name: "Restaurante Premium Demo (tenant)",
    type: "restaurante",
    plan: "starter"
  }
];

/** Seed mínimo para PostgreSQL (demo tenants + platform admin). */
export async function dakinisSeedMinimalPostgres() {
  const existing = await dakinisQueryOne("SELECT id FROM business LIMIT 1");
  if (existing) return;

  const insertBusiness = dakinisSqlInsertIgnore(
    "business",
    ["id", "slug", "name", "type", "plan", "config_json"]
  );
  for (const b of DAKINIS_DEMO_BUSINESSES) {
    await dakinisRun(insertBusiness, [b.id, b.slug, b.name, b.type, b.plan, null]);
  }

  const passwordHash = bcrypt.hashSync(DAKINIS_DEMO_PASSWORD, 10);
  const platformTotpSecret = process.env.DAKINIS_PLATFORM_TOTP_SECRET?.trim() || null;
  const insertUser = dakinisSqlInsertIgnore("users", [
    "id",
    "business_id",
    "email",
    "password_hash",
    "role",
    "totp_secret",
    "totp_enabled"
  ]);

  const users = [
    {
      id: "usr_platform_1",
      business_id: DAKINIS_DEMO_BUSINESSES[0].id,
      email: "admin@dakinis-platform.local",
      role: "platform_admin",
      totp_secret: platformTotpSecret,
      totp_enabled: platformTotpSecret ? true : false
    },
    { id: "usr_0001", business_id: DAKINIS_DEMO_BUSINESSES[1].id, email: "admin@clinica-demo.local", role: "admin" },
    { id: "usr_0002", business_id: DAKINIS_DEMO_BUSINESSES[2].id, email: "admin@peluqueria-demo.local", role: "admin" },
    { id: "usr_0003", business_id: DAKINIS_DEMO_BUSINESSES[3].id, email: "admin@inmobiliaria-demo.local", role: "admin" },
    { id: "usr_0004", business_id: DAKINIS_DEMO_BUSINESSES[4].id, email: "admin@restaurante-demo.local", role: "admin" }
  ];

  for (const u of users) {
    await dakinisRun(insertUser, [
      u.id,
      u.business_id,
      u.email,
      passwordHash,
      u.role,
      u.totp_secret ?? null,
      u.totp_enabled ?? false
    ]);
  }
}
