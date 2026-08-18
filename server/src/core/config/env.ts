import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  CLIENT_URL: z.string().url().default("http://localhost:3000"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required").default("development_secret_key_change_in_production_32chars"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JOOBLE_API_KEY: z.string().optional().default(""),
  JOOBLE_API_BASE_URL: z.string().url().default("https://in.jooble.org/api"),
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
