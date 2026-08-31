import { describe, it, expect, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "@/core/middleware/validate.middleware";
import { HTTP_STATUS } from "@/core/constants/http-status";

describe("Validate Middleware", () => {
  const schema = z.object({
    email: z.string().email(),
    age: z.number().min(18),
  });

  it("should call next() when request body satisfies schema", async () => {
    const middleware = validate({ body: schema });
    const req = {
      body: { email: "test@skillezo.ai", age: 25 },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should return 400 with validation error details on invalid input", async () => {
    const middleware = validate({ body: schema });
    const req = {
      body: { email: "invalid-email", age: 15 },
    } as unknown as Request;

    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    const res = { status: statusMock } as unknown as Response;
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: "VALIDATION_ERROR",
        }),
      })
    );
  });
});
