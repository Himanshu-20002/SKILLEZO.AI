# Phase 3 Documentation — Shared Backend Infrastructure

## Objective
Establish shared, reusable backend infrastructure for the SKILLEZO platform within `/server` to ensure all future modules use standardized response formats, error handling, validation pipelines, and domain constants.

---

## Architecture Introduced

```text
Request
  ↓
CORS Middleware
  ↓
JSON Body Parser (1mb limit)
  ↓
Routes
  ↓
Validation Middleware (Zod)
  ↓
Controllers (AsyncHandler wrapper)
  ↓
Services & Repositories (future)
  ↓
Catch-all 404 (notFoundMiddleware)
  ↓
Global Error Handler (errorMiddleware)
```

---

## Files Created / Modified

### Constants (`src/constants/`)
- `enums.ts`: Exported domain enums (`UserRole`, `AccountStatus`, `SkillSource`, `EmploymentType`, `JobEmploymentType`, `RoleStatus`, `CompetencyImportance`, `CareerPlanStatus`, `GapPriority`, `CompanySize`, `CompanyVerificationStatus`, `CompanyMemberRole`, `CompanyMemberStatus`, `JobStatus`, `WorkplaceType`, `ApplicationStatus`, `ResumeStatus`).
- `error-codes.ts`: Exported error codes (`VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, etc.).
- `http-status.ts`: Exported numeric HTTP status constants (`OK = 200`, `BAD_REQUEST = 400`, `NOT_FOUND = 404`, `INTERNAL_SERVER_ERROR = 500`, etc.).
- `index.ts`: Re-exported constants.

### Utilities (`src/utils/`)
- `AppError.ts`: Operational error class extending `Error` with `statusCode`, `code`, and `details`.
- `apiResponse.ts`: Standardized response helpers `successResponse<T>(data)` and `errorResponse(code, message, details?)`.
- `asyncHandler.ts`: Typed Express async handler wrapper ensuring rejected promises are passed to `next(err)`.

### Types (`src/types/`)
- `pagination.types.ts`: `PaginationParams` and `PaginatedResult<T>` interfaces.

### Validators (`src/validators/`)
- `common.validators.ts`: `objectIdSchema` and `paginationQuerySchema`.

### Middleware (`src/middleware/`)
- `validate.middleware.ts`: Express Zod validation pipeline for `body`, `params`, `query`.
- `notFound.middleware.ts`: Standardized 404 handler for unknown routes.
- `error.middleware.ts`: Centralized Express error handler mapping `AppError`, Mongoose `CastError`, duplicate key `11000`, `ValidationError`, and unknown errors.

### App Setup (`src/server.ts`)
- Registered `notFoundMiddleware` and `errorMiddleware` in the Express pipeline after all routes.

---

## Response Contracts

### Success Response
```json
{
  "success": true,
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "fields": [
        {
          "field": "email",
          "message": "Invalid email format"
        }
      ]
    }
  }
}
```

---

## Verification
- **TypeScript**: `npm run type-check` passed with 0 errors.
- **Build**: `npm run build` compiled successfully to `./dist/`.
- **Health Checks**: `/api/health` and `/api/health/ready` remain fully operational.
- **Architecture**: No Mongoose models, repositories, business services, or controllers were created.
