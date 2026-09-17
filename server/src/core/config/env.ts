import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const normalizeUrl = (defaultVal: string) =>
  z.preprocess((val) => {
    if (!val || typeof val !== "string" || !val.trim()) return defaultVal;
    let trimmed = val.trim().replace(/\/+$/, "");
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  }, z.string().url());

const envSchema = z.object({
  PORT: z.string().default("5000"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_DIRECT_HOSTS: z.string().optional().default(""),
  MONGODB_REPLICA_SET: z.string().optional().default(""),
  CLIENT_URL: normalizeUrl("http://localhost:3000"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required").default("development_secret_key_change_in_production_32chars"),
  BETTER_AUTH_URL: normalizeUrl("http://localhost:5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JOOBLE_API_KEY: z.string().optional().default(""),
  JOOBLE_API_BASE_URL: normalizeUrl("https://in.jooble.org/api"),
  AI_PROVIDER: z.enum(["gemini", "openai", "auto"]).default("gemini"),
  GEMINI_API_KEY: z.string().optional().default(""),
  OPENAI_API_KEY: z.string().optional().default(""),
  AI_MODEL: z.string().optional().default("gemini-3.6-flash"),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  RESEND_API_KEY: z.string().optional().default(""),
  EMAIL_FROM: z.string().default("SKILLEZO <onboarding@resend.dev>"),
  AI_CONTEXT_CACHE_TTL_SECONDS: z.string().optional().default("600"),
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
