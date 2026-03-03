import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING!,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const email = "admin@eco.kz";
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`✓ Admin already exists: ${email}`);
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      lastName: "EcoMarket",
      email,
      password: hashedPassword,
      role: "ADMIN",
      subscription: { create: { plan: "PREMIUM" } },
    },
  });

  console.log(`✓ Admin created: ${admin.email}`);
  console.log(`  Login: ${email} / admin123`);
  console.log(`  ID: ${admin.id}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

