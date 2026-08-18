# SKILLEZO Backend — Layer Architecture & Responsibilities

This document defines the strict responsibilities and boundaries of each architectural layer in the SKILLEZO backend.

---

## Architectural Layers Breakdown

| Layer | File Pattern | Main Responsibilities | Must NOT Do |
| :--- | :--- | :--- | :--- |
| **Routes** | `*.routes.ts` | Endpoint path mapping, middleware attachment (`requireAuth`, `validate`), route order. | Execute business logic, write database queries. |
| **Middleware** | `src/core/middleware/` | Authentication checks (`requireAuth`), Zod validation (`validate`), global error catching (`error.middleware`). | Mutate business data or return custom non-standard error structures. |
| **DTOs** | `*.dto.ts` | Static TypeScript interface contracts defining accepted request/response bodies. | Contain executable runtime code or validation rules. |
| **Validators** | `*.validator.ts` | Runtime schema validation using Zod (string trimming, URL validation, ObjectId patterns). | Make database queries or inspect Express request session objects. |
| **Controller** | `*.controller.ts` | Read `req.user.id` and `req.body`, invoke Service methods, format HTTP responses with `successResponse()`. | Query database directly, execute business rules or authorization checks. |
| **Service** | `*.service.ts` | Business logic, entity existence checks, domain authorization (`CompanyMemberRepository`), `AppError` throwing. | Inspect Express `req` / `res` objects or return HTTP response codes directly. |
| **Repository** | `*.repository.ts` | Database encapsulation (`findOne`, `findOneAndUpdate`, `create`), inheriting from `BaseRepository<T>`. | Inspect `req.user`, know about Better Auth, or throw HTTP errors. |
| **Model** | `*.model.ts` | Mongoose schema definitions, field defaults, subdocument schemas, and MongoDB collection indexes. | Contain application domain rules or HTTP routing details. |

---

## Layer Coupling Rules

1. **Upper layers can call lower layers; lower layers NEVER call upper layers.**
   - Controllers call Services.
   - Services call Repositories.
   - Repositories call Mongoose Models.
2. **Services never touch Express `req` or `res` objects.**
3. **Controllers never touch Mongoose models or raw MongoDB queries.**
