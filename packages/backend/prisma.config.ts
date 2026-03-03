import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // DATABASE_URL is read directly from process.env here rather than using
  // the env() helper so that `prisma generate` (which doesn't need a DB
  // connection) continues to work in CI without DATABASE_URL being set.
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
});
