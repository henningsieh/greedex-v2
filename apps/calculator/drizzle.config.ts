import { defineConfig } from "drizzle-kit";

import { env } from "@/env";

export default defineConfig({
  schema: "./src/lib/drizzle/schema.ts",
  out: "./src/lib/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
