import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const fallbackUrl = "postgresql://preproom:preproom@localhost:5432/preproom";
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? fallbackUrl,
});

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
