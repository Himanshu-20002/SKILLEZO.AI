import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { toNodeHandler } from "better-auth/node";
import mongoose from "mongoose";
import { env } from "@/core/config/env";
import { UserRole, AccountStatus } from "@/core/constants/enums";
import { connectDatabase } from "@/database/connection/db";

let _auth: any = null;

export function getAuth() {
  if (!_auth) {
    if (!mongoose.connection.db) {
      throw new Error("[Better Auth] Cannot initialize authentication before MongoDB connection is established.");
    }

    _auth = betterAuth({
      database: mongodbAdapter(mongoose.connection.db),
      secret: env.BETTER_AUTH_SECRET,
      baseURL: env.BETTER_AUTH_URL,
      trustedOrigins: [
        env.CLIENT_URL,
        "https://skillezo-ai.vercel.app",
        "http://localhost:3000",
      ].filter(Boolean),
      advanced: {
        disableCSRFCheck: true,
      },
      checkOrigin: () => true,
      emailAndPassword: {
        enabled: true,
      },
      user: {
        additionalFields: {
          role: {
            type: "string",
            required: false,
            defaultValue: UserRole.CANDIDATE,
            input: false,
          },
          accountStatus: {
            type: "string",
            required: false,
            defaultValue: AccountStatus.ACTIVE,
            input: false,
          },
          lastLoginAt: {
            type: "date",
            required: false,
            input: false,
          },
        },
      },
    });
  }

  return _auth;
}

export const auth = new Proxy({} as any, {
  get(_target, prop) {
    const instance = getAuth();
    const value = instance[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export const authHandler = async (req: any, res: any) => {
  try {
    if (!mongoose.connection.db) {
      await connectDatabase();
    }
    if (!req.headers.origin && !req.headers.Origin) {
      req.headers.origin = env.CLIENT_URL || "http://localhost:3000";
    }
    const handler = toNodeHandler(getAuth());
    return await handler(req, res);
  } catch (error: any) {
    console.error("[Better Auth Error]:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Authentication service error",
        },
      });
    }
  }
};

export type Auth = ReturnType<typeof getAuth>;



