import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const normalizeUrl = (defaultVal: string) =>
  z.preprocess((val) => {
    if (!val || typeof val !== "string" || !val.trim()) return defaultVal;
    const trimmed = val.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  }, z.string().url());

const envSchema = z.object({
  PORT: z.string().default("5000"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  CLIENT_URL: normalizeUrl("http://localhost:3000"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required").default("development_secret_key_change_in_production_32chars"),
  BETTER_AUTH_URL: normalizeUrl("http://localhost:5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JOOBLE_API_KEY: z.string().optional().default(""),
  JOOBLE_API_BASE_URL: normalizeUrl("https://in.jooble.org/api"),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Invalid environment variables:", result.error.format());
    throw new Error("Missing or invalid server environment variables.");
  }

  return result.data;
};

export const env = parseEnv();

