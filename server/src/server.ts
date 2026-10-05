import express, { Application, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { fromNodeHeaders } from "better-auth/node";
import { authHandler, auth } from "@/core/auth";
import healthRouter from "@/routes/health.routes";
import testAuthRouter from "@/routes/testAuth.routes";
import { profileRouter } from "@/modules/profile";
import { companyRouter } from "@/modules/company";
import { companyMemberRouter } from "@/modules/company-member";
import { jobIngestionRouter, initJobIngestionCron } from "@/modules/job-ingestion";
import { jobsRouter } from "@/modules/jobs";
import { resumeRouter } from "@/modules/resume";
import applicationRouter from "@/modules/application";
import recruiterApplicationRouter from "@/modules/recruiter-application";
import { skillGapRoutes } from "@/modules/career-plan/skill-gap.routes";
import { careerPlanRoutes } from "@/modules/career-plan/employability.routes";
import { verificationRouter } from "@/modules/verification";
import { adminRouter } from "@/modules/admin";
import { careerCoachRouter } from "@/core/ai/api";
import { actionRouter } from "@/core/ai/actions/api/action.routes";
import { jobProfileRouter } from "@/modules/job-profile/job-profile.routes";
import { notFoundMiddleware } from "@/core/middleware/notFound.middleware";
import { errorMiddleware } from "@/core/middleware/error.middleware";
import { env } from "@/core/config/env";
import { connectDatabase, disconnectDatabase } from "@/database/connection/db";
import { globalRateLimiter, authRateLimiter, heavyOpsRateLimiter } from "@/core/middleware/rate-limit.middleware";
import { cacheService } from "@/core/cache";
import { Server } from "http";

const app: Application = express();

app.set("trust proxy", true);

const allowedOrigins = [
  env.CLIENT_URL,
  "https://skillezo-ai-rho.vercel.app",
  "https://skillezo-ai.vercel.app",
  "http://localhost:3000",
].filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With", "Origin", "Accept"],
  exposedHeaders: ["Set-Cookie", "set-auth-token", "x-auth-session-token"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Better Auth handler mounted BEFORE express.json() for raw body access
app.use("/api/auth", authRateLimiter, (req, res, next) => {
  if (!req.headers.origin && !req.headers.Origin) {
    req.headers.origin = env.CLIENT_URL || "https://skillezo-ai.vercel.app";
  }

  // Cross-Domain OAuth Token Bridge:
  // When an OAuth callback finishes, Better Auth issues a 302 redirect back to the client URL
  // (e.g. https://skillezo-ai.vercel.app/dashboard). Because frontend (Vercel) and backend (Railway)
  // are on different top-level domains, browsers (especially Safari and Chrome with 3rd-party cookie blocking)
  // block cross-site cookies, causing the client to lose the session and redirect back to /login.
  // We extract the session token and safely append ?bearer_token=<token>&skillezo_token=<token> to the redirect Location.
  const isCallback = (req.originalUrl || req.url || "").includes("/callback/");
  if (isCallback) {
    const originalSetHeader = res.setHeader.bind(res);
    const originalWriteHead = res.writeHead.bind(res);

    let extractedToken: string | null = null;

    const findToken = (cookieVal: any) => {
      if (extractedToken || !cookieVal) return;
      const list = Array.isArray(cookieVal) ? cookieVal : [cookieVal];
      for (const item of list) {
        if (typeof item === "string") {
          const match = item.match(/(?:(?:__Secure-)?better-auth\.session_token)=([^;]+)/);
          if (match && match[1]) {
            extractedToken = decodeURIComponent(match[1]);
            break;
          }
        }
      }
    };

    const attachTokenToLocation = (loc: string): string => {
      const token = extractedToken || (res.getHeader("x-auth-session-token") as string);
      if (!loc || !token) return loc;
      try {
        const isAbsolute = loc.startsWith("http://") || loc.startsWith("https://");
        const base = isAbsolute ? undefined : (env.CLIENT_URL || "http://localhost:3000");
        const parsed = new URL(loc, base);
        if (!parsed.searchParams.has("bearer_token") && !parsed.searchParams.has("skillezo_token")) {
          parsed.searchParams.set("bearer_token", token);
          parsed.searchParams.set("skillezo_token", token);
          return isAbsolute ? parsed.toString() : `${parsed.pathname}${parsed.search}${parsed.hash}`;
        }
      } catch (e) {
        console.error("[OAuth Token Bridge] Failed to parse redirect location:", e);
      }
      return loc;
    };

    res.setHeader = function (name: string, value: any) {
      if (name.toLowerCase() === "set-cookie") {
        findToken(value);
        const existingLoc = res.getHeader("location");
        if (existingLoc && typeof existingLoc === "string") {
          originalSetHeader("location", attachTokenToLocation(existingLoc));
        }
      } else if (name.toLowerCase() === "x-auth-session-token" && typeof value === "string") {
        extractedToken = value;
        const existingLoc = res.getHeader("location");
        if (existingLoc && typeof existingLoc === "string") {
          originalSetHeader("location", attachTokenToLocation(existingLoc));
        }
      } else if (name.toLowerCase() === "location" && typeof value === "string") {
        findToken(res.getHeader("set-cookie"));
        value = attachTokenToLocation(value);
      }
      return originalSetHeader(name, value);
    };

    res.writeHead = function (statusCode: number, ...args: any[]) {
      for (const arg of args) {
        if (arg && typeof arg === "object" && !Array.isArray(arg)) {
          if (arg["set-cookie"] || arg["Set-Cookie"]) {
            findToken(arg["set-cookie"] || arg["Set-Cookie"]);
          }
          if (arg["x-auth-session-token"]) {
            extractedToken = arg["x-auth-session-token"];
          }
        }
      }
      findToken(res.getHeader("set-cookie"));

      const locHeader = res.getHeader("location");
      if (locHeader && typeof locHeader === "string") {
        originalSetHeader("location", attachTokenToLocation(locHeader));
      }

      for (const arg of args) {
        if (arg && typeof arg === "object" && !Array.isArray(arg)) {
          if (arg.location) arg.location = attachTokenToLocation(arg.location);
          if (arg.Location) arg.Location = attachTokenToLocation(arg.Location);
        }
      }

      return (originalWriteHead as any)(statusCode, ...args);
    };
  }

  authHandler(req, res).catch(next);
});

app.use(express.json({ limit: "1mb" }));

// Tier 1: Global API rate limiting protection (protects against traffic bursts and scraping)
app.use("/api", globalRateLimiter);

// Routes
app.use("/api", healthRouter);
if (env.NODE_ENV !== "production") {
  app.use("/api", testAuthRouter);
}
app.use("/api/profile", profileRouter);
app.use("/api/companies", companyRouter);
app.use("/api/company-members", companyMemberRouter);
app.use("/api/job-ingestion", jobIngestionRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/job-profiles", jobProfileRouter);
app.use("/api/resumes", resumeRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/recruiter/applications", recruiterApplicationRouter);
app.use("/api/skill-gap", skillGapRoutes);
app.use("/api/career-plan", careerPlanRoutes);
app.use("/api/verification", verificationRouter);
app.use("/api/admin", adminRouter);
app.use("/api/ai", heavyOpsRateLimiter);
app.use("/api/ai/coach", careerCoachRouter);
app.use("/api/ai/actions", actionRouter);

// Global user real-time status & suspension health check
app.get("/api/user/status", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      return res.status(200).json({
        success: true,
        data: { authenticated: false, isSuspended: false, accountStatus: "none" },
      });
    }

    const userId = session.user.id;
    const cacheKey = `auth:status:${userId}`;
    let accountStatus = (session.user as any).accountStatus || "active";

    // Check fast cache first (<0.1ms)
    const cachedStatus = await cacheService.get<string>(cacheKey);
    if (cachedStatus) {
      accountStatus = cachedStatus;
    } else if (mongoose.connection.db) {
      const queries: any[] = [{ id: userId }, { email: session.user.email?.toLowerCase() }, { _id: userId }];
      if (mongoose.Types.ObjectId.isValid(userId)) {
        queries.push({ _id: new mongoose.Types.ObjectId(userId) });
      }
      const userDoc = await mongoose.connection.db.collection("user").findOne({ $or: queries });
      if (userDoc?.accountStatus) {
        accountStatus = userDoc.accountStatus;
      }
      await cacheService.set(cacheKey, accountStatus, 60);
    }

    const isSuspended = accountStatus === "suspended";

    if (isSuspended && mongoose.connection.db) {
      const delQueries: any[] = [{ userId }];
      if (mongoose.Types.ObjectId.isValid(userId)) {
        delQueries.push({ userId: new mongoose.Types.ObjectId(userId) });
      }
      await mongoose.connection.db.collection("session").deleteMany({ $or: delQueries }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      data: {
        authenticated: true,
        id: userId,
        email: session.user.email,
        name: session.user.name,
        role: session.user.email?.toLowerCase() === "admin@gmail.com" ? "admin" : (session.user as any).role || "candidate",
        accountStatus,
        isSuspended,
      },
    });
  } catch (error: any) {
    return res.status(200).json({
      success: true,
      data: { authenticated: false, isSuspended: false, accountStatus: "none" },
    });
  }
});


app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "🚀 Welcome to SKILLEZO AI API",
  });
});

// Gracefully forward client dashboard routes to frontend if hit on backend server
app.use("/dashboard", (req: Request, res: Response) => {
  const clientBase = env.CLIENT_URL || "http://localhost:3000";
  res.redirect(`${clientBase}${req.originalUrl}`);
});

// Middleware pipeline order: Not Found -> Global Error
app.use(notFoundMiddleware);
app.use(errorMiddleware);

let server: Server;

async function bootstrap() {
  try {
    await connectDatabase();
    // Initialize background external job lifecycle cron
    if (process.env.NODE_ENV !== "test") {
      initJobIngestionCron();
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Database connection failed";
    console.error(`[Server] Warning: Database connection failed on startup: ${message}`);
  }

  const PORT = parseInt(env.PORT, 10) || 5000;
  server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

async function gracefulShutdown(signal: string) {
  console.log(`[Server] Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log("[Server] HTTP server closed.");
      await disconnectDatabase();
      console.log("[Server] Graceful shutdown complete.");
      process.exit(0);
    });
  } else {
    await disconnectDatabase();
    process.exit(0);
  }
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

if (process.env.NODE_ENV !== "test") {
  bootstrap();
}

export default app;
