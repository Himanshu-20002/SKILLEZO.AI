import { betterAuth, APIError, BetterAuthPlugin } from "better-auth";
import { bearer } from "better-auth/plugins";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { toNodeHandler } from "better-auth/node";
import { createAuthMiddleware } from "@better-auth/core/api";
import mongoose from "mongoose";
import { env } from "@/core/config/env";
import { UserRole, AccountStatus } from "@/core/constants/enums";
import { connectDatabase } from "@/database/connection/db";

let _auth: any = null;

// Suspension Guard Plugin: Prevents suspended users from authenticating or establishing active sessions
const suspensionGuardPlugin: BetterAuthPlugin = {
  id: "suspension-guard",
  hooks: {
    after: [
      {
        matcher: () => true,
        handler: createAuthMiddleware(async (ctx: any) => {
          const user = ctx.context.newSession?.user || ctx.context.session?.user;
          if (!user?.id && !user?.email) return;

          let isSuspended = false;
          if (mongoose.connection.db) {
            const queries: any[] = [];
            if (user.id) {
              queries.push({ id: user.id }, { _id: user.id });
              if (mongoose.Types.ObjectId.isValid(user.id)) {
                queries.push({ _id: new mongoose.Types.ObjectId(user.id) });
              }
            }
            if (user.email) {
              queries.push({ email: user.email.toLowerCase() });
            }

            if (queries.length > 0) {
              const userDoc = await mongoose.connection.db.collection("user").findOne({ $or: queries });
              if (userDoc?.accountStatus === AccountStatus.SUSPENDED) {
                isSuspended = true;
              }
            }
          }

          if (isSuspended) {
            const sessionId = ctx.context.newSession?.session?.id || ctx.context.session?.session?.id;
            if (sessionId && mongoose.connection.db) {
              const sessionQueries: any[] = [{ id: sessionId }, { _id: sessionId }];
              if (mongoose.Types.ObjectId.isValid(sessionId)) {
                sessionQueries.push({ _id: new mongoose.Types.ObjectId(sessionId) });
              }
              await mongoose.connection.db.collection("session").deleteOne({ $or: sessionQueries });
            }

            const redirectTarget = `${env.CLIENT_URL || "http://localhost:3000"}/account-suspended`;
            if (typeof ctx?.setHeader === "function") {
              ctx.setHeader("Location", redirectTarget);
            }

            throw new APIError("FORBIDDEN", {
              message: "Your account has been suspended. Please contact support.",
            });
          }
        }),
      },
    ],
  },
};

// Browsers reject Secure cookies on http://localhost. Keep the production
// cross-site cookie policy, but use a local-development cookie that can be sent
// between the Next.js app (localhost:3000) and API (localhost:5000).
const isProduction = env.NODE_ENV === "production";

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
        "https://skillezo-ai-rho.vercel.app",
        "https://skillezo-ai.vercel.app",
        "https://skillezoai-production.up.railway.app",
        "http://localhost:3000",
        "http://localhost:5000",
      ].filter(Boolean),
      advanced: {
        disableCSRFCheck: true,
        useSecureCookies: isProduction,
        defaultCookieAttributes: {
          sameSite: isProduction ? "none" : "lax",
          secure: isProduction,
        },
        ipAddress: {
          ipAddressHeaders: ["x-forwarded-for", "cf-connecting-ip", "x-real-ip"],
          trustedProxies: ["127.0.0.1", "::1", "0.0.0.0/0", "::/0"],
        },
      },
      databaseHooks: {
        session: {
          create: {
            before: async (session: any) => {
              if (mongoose.connection.db && session?.userId) {
                const user = await mongoose.connection.db.collection("user").findOne(
                  {
                    $or: [
                      { id: session.userId },
                      { _id: session.userId },
                      ...(mongoose.Types.ObjectId.isValid(session.userId)
                        ? [{ _id: new mongoose.Types.ObjectId(session.userId) }]
                        : []),
                    ],
                  },
                  { projection: { accountStatus: 1 } }
                );
                if (user?.accountStatus === AccountStatus.SUSPENDED) {
                  throw new APIError("FORBIDDEN", {
                    message: "Your account has been suspended. Please contact support.",
                  });
                }
              }
            },
          },
        },
        user: {
          update: {
            before: async (updateData: any, context: any) => {
              const userId = context?.params?.id || context?.body?.userId;
              if (mongoose.connection.db && userId) {
                const existing = await mongoose.connection.db.collection("user").findOne(
                  {
                    $or: [
                      { id: userId },
                      { _id: userId },
                      ...(mongoose.Types.ObjectId.isValid(userId)
                        ? [{ _id: new mongoose.Types.ObjectId(userId) }]
                        : []),
                    ],
                  },
                  { projection: { accountStatus: 1 } }
                );
                if (existing?.accountStatus === AccountStatus.SUSPENDED) {
                  delete updateData.accountStatus;
                }
              }
            },
          },
        },
      },
      plugins: [bearer(), suspensionGuardPlugin],
      checkOrigin: () => true,
      emailAndPassword: {
        enabled: true,
      },
      socialProviders: {
        google: {
          clientId: env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "",
          clientSecret: env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
        },
      },
      user: {
        additionalFields: {
          role: {
            type: "string",
            required: false,
            defaultValue: UserRole.CANDIDATE,
            input: true,
          },
          companyName: {
            type: "string",
            required: false,
            input: true,
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
    console.error("[Better Auth Fatal Error]:", error?.stack || error);
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
