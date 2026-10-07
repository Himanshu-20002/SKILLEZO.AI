# PHASE 12 — COMPANY MODULE + COMPANY OWNERSHIP FOUNDATION DOCUMENTATION

## 1. Purpose
Phase 12 implements the complete **Company Module** and **Company Ownership Foundation** in the SKILLEZO backend. It allows authenticated users to create companies, view their companies, retrieve public company details, and perform company updates strictly when authorized as a company Owner or Admin.

---

## 2. Company Architecture
The Company module follows the project's canonical Clean / Layered Architecture:

```
CLIENT
   │
   ▼
Company Routes (`/api/companies`)
   │
   ├── requireAuth Middleware
   └── validate Middleware (Zod)
   │
   ▼
Company Controller (`company.controller.ts`)
   │
   ▼
Company Service (`company.service.ts`)
   ├── CompanyRepository (`CompanyRepository.ts`)
   └── CompanyMemberRepository (`CompanyMemberRepository.ts`)
   │
   ▼
Mongoose Models (`CompanyModel`, `CompanyMemberModel`)
   │
   ▼
MongoDB (`companies`, `company_members` collections)
```

---

## 3. Company Model Relationship
* **CreatedBy Link**: `Company.createdBy` stores the Better Auth string user ID of the creator.
* **Domain Entity ID**: `Company._id` is a MongoDB `ObjectId`.
* **Indexes**: Unique index on `slug`, index on `name`, `industry`, `verificationStatus`, and `location.city`.

---

## 4. CompanyMember Relationship
* **Association**: Links a Better Auth string `userId` to a MongoDB `companyId` (`ObjectId`).
* **Roles**: `CompanyMemberRole` enum (`OWNER`, `ADMIN`, `RECRUITER`, `VIEWER`).
* **Statuses**: `CompanyMemberStatus` enum (`ACTIVE`, `INVITED`, `SUSPENDED`, `REMOVED`).
* **Constraint**: Compound unique index `{ userId: 1, companyId: 1 }` prevents duplicate membership records.

---

## 5. Authentication vs Authorization
* **Authentication**: Handled via Better Auth (`requireAuth` middleware). Answers *"Who is the user?"* (`req.user.id` string).
* **Authorization**: Handled via `CompanyMemberRepository` lookup in `CompanyService`. Answers *"Can this user perform this operation on this company?"* based on active membership (`status: ACTIVE`) and role (`OWNER` or `ADMIN`).

---

## 6. Company Creation Flow
1. Client sends `POST /api/companies` with `CreateCompanyDTO`.
2. `requireAuth` verifies token and populates `req.user.id`.
3. `validate` middleware parses and validates body using `createCompanyValidator`.
4. `CompanyService.createCompany`:
   - Generates or normalizes the `slug` (lowercase, alphanumeric with hyphens).
   - Checks slug uniqueness via `CompanyRepository.findBySlug(slug)`. If found, throws 409 Conflict (`ERROR_CODES.CONFLICT`).
   - Inserts company record (`createdBy = req.user.id`, `verificationStatus = PENDING`).
   - Automatically invokes `CompanyMemberRepository.createMembership` to create an `OWNER` record.
5. Returns 201 Created with the new Company document wrapped in `successResponse`.

---

## 7. Owner Membership Creation Flow
When a company is created:
```typescript
await this.companyMemberRepository.createMembership({
  userId,
  companyId: company._id,
  role: CompanyMemberRole.OWNER,
  status: CompanyMemberStatus.ACTIVE,
  invitedBy: null,
  joinedAt: new Date(),
});
```
This ensures every created company has a designated `OWNER` from moment of creation.

---

## 8. DTO Structure
Located in [`company.dto.ts`](file:///x:/projects/next.js/SKILLEZO.AI/server/src/modules/company/company.dto.ts):
* `CreateCompanyDTO`: `name`, `slug?`, `description?`, `industry?`, `website?`, `logoUrl?`, `location?`, `companySize?`.
* `UpdateCompanyDTO`: `name?`, `description?`, `industry?`, `website?`, `logoUrl?`, `location?`, `companySize?`.

*Note: Server controls `createdBy`, `verificationStatus`, and timestamps. Client inputs for these fields are ignored/omitted.*

---

## 9. Validation Rules
Located in [`company.validator.ts`](file:///x:/projects/next.js/SKILLEZO.AI/server/src/modules/company/company.validator.ts):
* `name`: Required, max 150 characters, trimmed.
* `slug`: Optional, min 2, max 100, pattern `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`.
* `website` / `logoUrl`: Must be valid URLs if provided.
* `companySize`: Validated against `CompanySize` enum.
* `companyId`: Validated using `objectIdSchema`.

---

## 10. Repository Responsibilities
* **CompanyRepository** ([`CompanyRepository.ts`](file:///x:/projects/next.js/SKILLEZO.AI/server/src/database/repositories/company/CompanyRepository.ts)): Database queries (`findBySlug`, `findVerifiedCompanies`, `findCompaniesByIndustry`, `findCreatedBy`, `updateById`).
* **CompanyMemberRepository** ([`CompanyMemberRepository.ts`](file:///x:/projects/next.js/SKILLEZO.AI/server/src/database/repositories/companyMember/CompanyMemberRepository.ts)): Membership persistence (`findByUserAndCompany`, `findActiveMembership`, `findMembershipsByUser`, `createMembership`, `updateMembershipRole`, `updateMembershipStatus`).

---

## 11. Service Responsibilities
Located in [`company.service.ts`](file:///x:/projects/next.js/SKILLEZO.AI/server/src/modules/company/company.service.ts):
* Enforces domain logic, slug uniqueness, and automatic owner membership creation.
* Enforces membership & role checks (`OWNER` or `ADMIN` required for updates).
* Throws domain errors using `AppError`.

---

## 12. Controller Responsibilities
Located in [`company.controller.ts`](file:///x:/projects/next.js/SKILLEZO.AI/server/src/modules/company/company.controller.ts):
* Thin controller layer extracting `req.user.id` and `req.params`.
* Returns standardized `successResponse` payloads.

---

## 13. API Routes

| Method | Endpoint | Auth | Middleware | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/companies` | Required | `createCompanyValidator` | Creates a new company and assigns creator as OWNER. |
| `GET` | `/api/companies/me` | Required | None | Retrieves all companies where user has active membership. |
| `GET` | `/api/companies/:companyId` | Public | `companyIdParamsSchema` | Retrieves public company profile by ID. |
| `PATCH` | `/api/companies/:companyId` | Required | `companyIdParamsSchema`, `updateCompanyValidator` | Updates company details (Requires OWNER/ADMIN role). |

*Note: `/me` is registered BEFORE `/:companyId` to prevent route collision.*

---

## 14. Authorization Rules
* **Create Company**: Allowed for any authenticated user.
* **View Company (`/:companyId`)**: Publicly accessible.
* **Get My Companies (`/me`)**: Returns companies associated with authenticated user's active memberships.
* **Update Company (`/:companyId`)**: Requires user to have an active `CompanyMember` record with `role` equal to `OWNER` or `ADMIN`. Viewers, recruiters, non-members, and suspended members receive 403 Forbidden.

---

## 15. Ownership Rules
* Creator automatically becomes `OWNER` with `status: ACTIVE`.
* `createdBy` field stores creator's Better Auth string ID.
* Slug is treated as a stable identifier and is not mutated on company name updates.

---

## 16. Error Handling
* `400 Bad Request`: Validation failure or invalid ObjectId format.
* `401 Unauthorized`: Unauthenticated request to protected endpoints.
* `403 Forbidden`: Authenticated user lacking active OWNER/ADMIN membership.
* `404 Not Found`: Company not found (`COMPANY_NOT_FOUND`).
* `409 Conflict`: Duplicate company slug (`CONFLICT`).

---

## 17. Database & Index Behavior
* `Company`: Unique index on `slug` prevents duplicate slugs at the database level.
* `CompanyMember`: Compound unique index `{ userId: 1, companyId: 1 }` prevents duplicate user membership in the same company.

---

## 18. Example Request & Response Flows

### Create Company Request
`POST /api/companies`
```json
{
  "name": "Acme Software Corp",
  "industry": "Software Engineering",
  "website": "https://acme.example.com",
  "companySize": "51-200"
}
```

### Create Company Response (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "66b8c1f92e40123456789abc",
    "name": "Acme Software Corp",
    "slug": "acme-software-corp",
    "industry": "Software Engineering",
    "website": "https://acme.example.com",
    "companySize": "51-200",
    "verificationStatus": "pending",
    "createdBy": "usr_9988776655",
    "createdAt": "2026-08-11T07:38:00.000Z",
    "updatedAt": "2026-08-11T07:38:00.000Z"
  }
}
```

---

## 19. Security Test Results
- ✅ User A creates Company X $\rightarrow$ User A set as `createdBy` and `OWNER`.
- ✅ User A updates Company X $\rightarrow$ 200 OK.
- ✅ User B (non-member) attempts update on Company X $\rightarrow$ 403 Forbidden.
- ✅ User B (VIEWER role) attempts update on Company X $\rightarrow$ 403 Forbidden.
- ✅ Unauthenticated user attempts creation $\rightarrow$ 401 Unauthorized.
- ✅ Duplicate slug creation $\rightarrow$ 409 Conflict.
- ✅ Invalid ObjectId format $\rightarrow$ 400 Bad Request.

---

## 20. Phase 11 Regression Results
- ✅ `GET /api/profile/me` and candidate profile operations continue functioning cleanly.

---

## 21. Better Auth Regression Results
- ✅ `/api/auth/*` authentication endpoints remain untouched and 100% operational.
- ✅ `requireAuth` resolves `req.user.id` string properly.

---

## 22. Type-Check & Build Results
- ✅ `npm run type-check` passed with 0 errors.
- ✅ `npm run build` completed successfully.

---

## 23. Health Endpoint Results
- ✅ `/api/health` and `/api/health/ready` remain fully functional.

---

## 24. Known Limitations
- Member management API endpoints (e.g. inviting recruiters, changing member roles via HTTP API) are reserved for Phase 13.

---

## 25. Next Recommended Phase
- **PHASE 13 — COMPANY MEMBER MANAGEMENT / RECRUITER ACCESS**
