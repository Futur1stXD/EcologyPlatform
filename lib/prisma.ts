// Allow Supabase's intermediate TLS certificate chain in all environments
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_PRISMA_URL!,
    ssl: { rejectUnauthorized: false },
    max: 1, // serverless: one connection per function instance
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Cache in all environments so warm serverless instances reuse the connection
globalForPrisma.prisma = prisma;
