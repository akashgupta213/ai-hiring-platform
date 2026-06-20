// Loads the ROOT .env (one source of truth for the whole monorepo) and
// validates it with zod so a missing secret fails loudly at boot, not at
// 2am when someone hits the login route in production.
import { config } from "dotenv";
import path from "node:path";
import { z } from "zod";

// `npm run dev -w @ai-hiring/api` runs with cwd = apps/api, so ../../.env -> repo root.
config({ path: path.resolve(process.cwd(), "../../.env") });
config(); // fallback: also pick up a local apps/api/.env if you ever add one

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is missing — check your .env file"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is missing"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is missing"),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),
  PORT: z.string().default("3001"),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  NODE_ENV: z.string().default("development"),
});

export const env = envSchema.parse(process.env);
