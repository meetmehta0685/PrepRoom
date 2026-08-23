import "dotenv/config";

import { defineConfig } from "prisma/config";

const fallbackUrl = "postgresql://preproom:preproom@localhost:5432/preproom";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? fallbackUrl,
  },
});
