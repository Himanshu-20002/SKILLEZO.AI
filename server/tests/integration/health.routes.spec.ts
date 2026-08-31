import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import healthRouter from "@/routes/health.routes";

describe("Health Check API Routes", () => {
  const app = express();
  app.use(express.json());
  app.use("/api", healthRouter);

  it("GET /api/health should return 200 with status ok", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: {
        status: "ok",
      },
    });
  });
});
