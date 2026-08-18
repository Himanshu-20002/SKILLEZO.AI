# Phase 11 — Candidate Profile Module Documentation

## 1. Purpose
The **Candidate Profile Module** provides the complete backend business implementation for managing candidate profile data. It enables authenticated candidates to create, retrieve, and granularly update their technical profiles (bio, target role, skills, education, experience, links, and location) while strictly enforcing single-profile ownership per user and authoritative Better Auth identity isolation.

---

## 2. Architecture

```text
HTTP Request
    │
    ▼
Profile Route (/api/profile)
    │
    ▼
requireAuth (Better Auth Session Verification -> req.user.id)
    │
    ▼
validate(Zod Schemas)
    │
    ▼
ProfileController (Thin HTTP Handler, returns successResponse)
    │
    ▼
ProfileService (Business rules, existence & duplicate checks, AppError)
    │
    ▼
ProfileRepository (Encapsulated Mongoose queries extending BaseRepository)
    │
    ▼
ProfileModel (Mongoose Model & Schema)
    │
    ▼
MongoDB Atlas (Collection: `profiles`)
```

---

## 3. Folder Structure

```text
server/
├── src/
│   ├── modules/
│   │   └── profile/
│   │       ├── profile.dto.ts         # API Input DTO Interfaces
│   │       ├── profile.validator.ts   # Zod Validation Schemas
│   │       ├── profile.service.ts     # Profile Domain Service & Business Logic
│   │       ├── profile.controller.ts  # Express Controller Handlers
│   │       ├── profile.routes.ts      # Router Definition & Middleware Mapping
│   │       └── index.ts               # Module Exports
│   ├── database/
│   │   ├── models/
│   │   │   └── Profile.model.ts       # Mongoose Schema & Document Contract
│   │   └── repositories/
│   │       └── profile/
│   │           └── ProfileRepository.ts # MongoDB Data Access Layer
```

---

## 4. Profile Data Flow

1. **Client Request**: Client sends an HTTP request to `/api/profile/*` with Better Auth session headers/cookies.
2. **Session Verification**: `requireAuth` verifies the session and sets `req.user = { id, email, role, ... }`.
3. **Validation**: `validate` middleware parses `req.body` against Zod schemas (`createProfileSchema`, `updateProfileSchema`, etc.).
4. **Controller**: `ProfileController` extracts `userId = req.user.id` and delegates to `ProfileService`.
5. **Service**: `ProfileService` enforces ownership and business rules (e.g. duplicate profile check), then calls `ProfileRepository`.
6. **Repository**: `ProfileRepository` performs `findOne`, `create`, or `findOneAndUpdate` using `ProfileModel`.
7. **Response**: Success payloads are wrapped in `successResponse(data)` (HTTP 200 / 201). Errors throw `AppError` caught by `errorMiddleware`.

---

## 5. Authentication Flow
Authentication is handled by Better Auth via `requireAuth`:
- Unauthenticated requests → `401 Unauthorized` (`UNAUTHORIZED`).
- Suspended accounts → `403 Forbidden` (`ACCOUNT_SUSPENDED`).
- Deactivated accounts → `403 Forbidden` (`ACCOUNT_DEACTIVATED`).
- Active sessions → Passes `req.user.id` to controller handlers.

---

## 6. Controller Responsibilities
- Extracts `req.user.id` from the authenticated request context.
- Passes validated DTO data to `ProfileService`.
- Formats HTTP responses using `successResponse(data)` with appropriate status codes (`201 Created` for profile creation, `200 OK` for reads/updates).
- Free of direct database queries or business rules.

---

## 7. Service Responsibilities
- Enforces single-profile rule per candidate (`409 Conflict` with `PROFILE_ALREADY_EXISTS` if a candidate attempts to create a second profile).
- Enforces profile existence (`404 Not Found` with `PROFILE_NOT_FOUND` on read/update for missing profiles).
- Enforces strict identity isolation (uses `req.user.id` as the sole authority for profile ownership).
- Converts string IDs to MongoDB `Types.ObjectId` for `targetRoleId`.

---

## 8. Repository Responsibilities
- Provides data access methods: `findByUserId`, `existsByUserId`, `updateByUserId`, `updateSkills`, `updateEducation`, `updateExperience`, `updateLinks`, `updateTargetRole`.
- Wraps Mongoose database operations inside `BaseRepository` error handling (`DuplicateEntityError`, `DatabaseOperationError`).
- Encapsulates Mongoose queries and model methods.

---

## 9. DTO Design
- **`CreateProfileDTO`**: `targetRoleId`, `bio`, `skills`, `education`, `experience`, `links`, `location`.
- **`UpdateProfileDTO`**: Partial of `CreateProfileDTO`.
- **`UpdateSkillsDTO`**: `{ skills: ProfileSkillDTO[] }`.
- **`UpdateEducationDTO`**: `{ education: ProfileEducationDTO[] }`.
- **`UpdateExperienceDTO`**: `{ experience: ProfileExperienceDTO[] }`.
- **`UpdateLinksDTO`**: `{ links: ProfileLinksDTO }`.
- **`UpdateTargetRoleDTO`**: `{ targetRoleId: string | null }`.

---

## 10. Validation Rules
- `userId`: **Never** accepted from client payloads. Extracted strictly from `req.user.id`.
- `targetRoleId`: Validated using `objectIdSchema` (valid 24-character hexadecimal MongoDB ObjectId).
- `skills.level`: Integer between `1` and `5`.
- `skills.source`: Enum of `SkillSource` (`"profile"`, `"resume"`, `"assessment"`, `"admin"`).
- `education.startYear` / `endYear`: Integer between `1900` and `2100`.
- `experience.startDate` / `endDate`: Coerced to valid Date.
- `links`: Valid URLs for `github`, `linkedin`, `portfolio`.

---

## 11. API Endpoints

| Method | Endpoint | Auth Required | Description |
|:---|:---|:---:|:---|
| `POST` | `/api/profile` | ✅ Yes | Create candidate profile |
| `GET` | `/api/profile/me` | ✅ Yes | Get authenticated user's profile |
| `PATCH` | `/api/profile/me` | ✅ Yes | Update general profile fields |
| `PATCH` | `/api/profile/me/skills` | ✅ Yes | Update profile skills array |
| `PATCH` | `/api/profile/me/education` | ✅ Yes | Update profile education array |
| `PATCH` | `/api/profile/me/experience` | ✅ Yes | Update profile experience array |
| `PATCH` | `/api/profile/me/links` | ✅ Yes | Update profile social/portfolio links |
| `PATCH` | `/api/profile/me/target-role` | ✅ Yes | Update target role ID |

---

## 12. Request & Response Examples

### POST `/api/profile` (Create Profile)

**Request Body:**
```json
{
  "targetRoleId": "65b2f1c8e4b0123456789abc",
  "bio": "Full Stack Engineer specializing in React & Node.js",
  "skills": [
    { "name": "TypeScript", "level": 5, "source": "profile", "verified": true }
  ],
  "education": [
    { "institution": "Stanford University", "degree": "B.S.", "fieldOfStudy": "Computer Science", "startYear": 2020, "endYear": 2024 }
  ],
  "experience": [
    { "companyName": "Tech Corp", "jobTitle": "Software Engineer", "isCurrent": true }
  ],
  "links": {
    "github": "https://github.com/developer",
    "linkedin": "https://linkedin.com/in/developer"
  },
  "location": { "city": "San Francisco", "state": "CA", "country": "USA" }
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "67a1b2c3d4e5f67890123456",
    "userId": "user_better_auth_id_123",
    "targetRoleId": "65b2f1c8e4b0123456789abc",
    "bio": "Full Stack Engineer specializing in React & Node.js",
    "skills": [
      { "name": "TypeScript", "level": 5, "source": "profile", "verified": true }
    ],
    "education": [
      { "institution": "Stanford University", "degree": "B.S.", "fieldOfStudy": "Computer Science", "startYear": 2020, "endYear": 2024 }
    ],
    "experience": [
      { "companyName": "Tech Corp", "jobTitle": "Software Engineer", "isCurrent": true, "description": null, "employmentType": null, "endDate": null, "startDate": null }
    ],
    "links": { "github": "https://github.com/developer", "linkedin": "https://linkedin.com/in/developer", "portfolio": null },
    "location": { "city": "San Francisco", "state": "CA", "country": "USA" },
    "createdAt": "2026-08-10T12:00:00.000Z",
    "updatedAt": "2026-08-10T12:00:00.000Z"
  }
}
```

---

## 13. Ownership & Security Model
- Identity is non-transferable and authoritative.
- The client cannot supply a `userId` parameter to alter ownership.
- Attempting to pass `userId` in `POST /api/profile` or `PATCH /api/profile/me` is ignored because `req.user.id` is enforced by `ProfileController` and `ProfileService`.

---

## 14. Error Handling

| Scenario | HTTP Status | Code | Message |
|:---|:---:|:---|:---|
| Unauthenticated request | `401` | `UNAUTHORIZED` | Authentication required to access this resource |
| Suspended account | `403` | `ACCOUNT_SUSPENDED` | Your account has been suspended |
| Create duplicate profile | `409` | `PROFILE_ALREADY_EXISTS` | Candidate profile already exists for this account |
| Get / Update missing profile | `404` | `PROFILE_NOT_FOUND` | Candidate profile not found |
| Invalid `targetRoleId` ObjectId | `400` | `VALIDATION_ERROR` | Request validation failed (Invalid ObjectId format) |

---

## 15. Database Interaction
Uses existing Mongoose `ProfileModel` mapping to `profiles` collection:
- `userId` (indexed, unique string).
- `targetRoleId` (indexed ObjectId ref to Role).
- `skills.name` (indexed for skill searches).

---

## 16. Testing Results
- **Unauthenticated Check**: Verified `401 Unauthorized` response on `/api/profile/*`.
- **Profile Creation**: Verified profile successfully created with 201 Created.
- **Duplicate Prevention**: Verified second `POST /api/profile` attempt yields `409 Conflict` (`PROFILE_ALREADY_EXISTS`).
- **Profile Retrieval**: Verified `GET /api/profile/me` returns authentic user profile.
- **Profile Updates**: Verified `PATCH /api/profile/me/*` updates skills, education, experience, links, and target roles cleanly.
- **Ownership Isolation**: Verified passing external `userId` in client request payloads is rejected/ignored.

---

## 17. Type-Check & Build Results
- `npm run type-check`: `✓ Passed (0 errors)`
- `npm run build`: `✓ Passed (tsc && tsc-alias executed successfully)`

---

## 18. Health & Regression Results
- `GET /api/health`: `200 OK` (`status: "ok"`)
- `GET /api/health/ready`: `200 OK` (`status: "ready", database: "connected"`)
- Better Auth authentication handlers (`/api/auth/*`): Preserved and fully functional.

---

## 19. What is Intentionally NOT Implemented
- AI skill gap calculation (Belongs to Phase 21).
- ATS Resume parsing & extraction (Belongs to Phase 20).
- Job match percentage calculation (Belongs to Phase 28).
- Admin / Recruiter profile override authorization.

---

✅ **PHASE 11 — CANDIDATE PROFILE MODULE COMPLETE**

Ready for: **PHASE 12 — COMPANY MODULE**
