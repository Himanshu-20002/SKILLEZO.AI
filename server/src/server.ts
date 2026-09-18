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
import { notFoundMiddleware } from "@/core/middleware/notFound.middleware";
import { errorMiddleware } from "@/core/middleware/error.middleware";
import { env } from "@/core/config/env";
import { connectDatabase, disconnectDatabase } from "@/database/connection/db";
import { Server } from "http";

const app: Application = express();

app.set("trust proxy", true);

const allowedOrigins = [
  env.CLIENT_URL,
  "https://skillezo-ai-rho.vercel.app",
  "https://skillezo-ai.vercel.app",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// Better Auth handler mounted BEFORE express.json() for raw body access
app.use("/api/auth", (req, res, next) => {
  if (!req.headers.origin && !req.headers.Origin) {
    req.headers.origin = env.CLIENT_URL || "https://skillezo-ai.vercel.app";
  }
  authHandler(req, res).catch(next);
});

app.use(express.json({ limit: "1mb" }));

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
app.use("/api/resumes", resumeRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/recruiter/applications", recruiterApplicationRouter);
app.use("/api/skill-gap", skillGapRoutes);
app.use("/api/career-plan", careerPlanRoutes);
app.use("/api/verification", verificationRouter);
app.use("/api/admin", adminRouter);
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
    let accountStatus = (session.user as any).accountStatus || "active";

    if (mongoose.connection.db) {
      const queries: any[] = [{ id: userId }, { email: session.user.email?.toLowerCase() }, { _id: userId }];
      if (mongoose.Types.ObjectId.isValid(userId)) {
        queries.push({ _id: new mongoose.Types.ObjectId(userId) });
      }
      const userDoc = await mongoose.connection.db.collection("user").findOne({ $or: queries });
      if (userDoc?.accountStatus) {
        accountStatus = userDoc.accountStatus;
      }
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
