# Walkthrough — Phase 16: Resume Management & Secure Storage Foundation

## Overview
Phase 16 delivers a complete backend **Resume Management & Storage module** for authenticated candidates on SKILLEZO AI. Candidates can upload multiple resumes (`.pdf`, `.doc`, `.docx`), manage resume metadata, toggle a default resume for future job applications, download resume files, and securely delete resumes (unlinking both DB records and physical disk storage).

---

## 1. Architectural Architecture & Flow

```
                CANDIDATE REQUEST
                       │
                       ▼
        /api/resumes (requireAuth middleware)
                       │
                       ▼
        ┌──────────────┴──────────────┐
        │                             │
  File Upload (`POST /upload`)   JSON Data (GET/PUT/PATCH/DELETE)
        │                             │
        ▼                             │
  Multer Storage (`uploads/resumes/`) │
        │                             │
        └──────────────┬──────────────┘
                       │
                       ▼
             [resume.routes.ts]
                       │
                       ▼
           [resume.controller.ts]
                       │
                       ▼
             [resume.service.ts]
                       │
                       ▼
           [ResumeRepository.ts]
                       │
                       ▼
          MongoDB Collection (`resumes`)
```

---

## 2. Key Components Implemented

### A. Database Model & Repository
- **[Resume.model.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/database/models/Resume.model.ts)**:
  - Extended model with `isDefault: boolean`.
  - Added compound index `{ userId: 1, isDefault: 1 }` and `{ userId: 1, createdAt: -1 }`.
  - Preserved pre-existing `extractedData` structure for future AI resume parsing.

- **[ResumeRepository.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/database/repositories/resume/ResumeRepository.ts)**:
  - `findByUserId(userId)`: Fetches candidate's resumes sorted newest first.
  - `findUserResumeById(userId, resumeId)`: Strictly checks candidate ownership.
  - `setDefaultResume(userId, resumeId)` & `clearDefaultFlag(userId)`: Atomically resets default status across candidate's resumes.
  - `deleteUserResume(userId, resumeId)`: Deletes candidate's database record.

### B. Upload Storage Middleware
- **[upload.middleware.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/core/middleware/upload.middleware.ts)**:
  - Configured `multer` disk storage saving files under `/uploads/resumes/`.
  - Enforces 5MB size limit (`fileSize: 5 * 1024 * 1024`).
  - Restricts MIME types to `.pdf`, `.doc`, `.docx` (returns `INVALID_FILE_TYPE` error on invalid formats).

### C. Resume Module (`src/modules/resume/`)
- 📄 **[resume.dto.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/modules/resume/resume.dto.ts)**: Strong types for updates and responses.
- 📄 **[resume.validator.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/modules/resume/resume.validator.ts)**: Zod schemas for query parameters (`resumeId` format) and update bodies.
- 📄 **[resume.service.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/modules/resume/resume.service.ts)**:
  - Auto-promotes candidate's first uploaded resume to `isDefault: true`.
  - Handles disk cleanup (`fs.unlinkSync`) when a resume is deleted.
  - Promotes next newest resume to default if the default resume was deleted.
- 📄 **[resume.controller.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/modules/resume/resume.controller.ts)**: Handles upload streams, downloads, metadata updates, and JSON responses using `successResponse()`.
- 📄 **[resume.routes.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/modules/resume/resume.routes.ts)**: Enforces `requireAuth` on all operations.
- 📄 **[index.ts](file:///x:/projects/next.js/SKILLEZO.AI/server/src/modules/resume/index.ts)**: Barrel exports.

---

## 3. Implemented API Endpoints Summary

| Method   | Endpoint                          | Auth          | Description                                          |
| -------- | --------------------------------- | ------------- | ---------------------------------------------------- |
| `POST`   | `/api/resumes/upload`             | `requireAuth` | Uploads resume file (PDF/Word, max 5MB).             |
| `GET`    | `/api/resumes`                    | `requireAuth` | Lists candidate's uploaded resumes.                  |
| `GET`    | `/api/resumes/:resumeId`          | `requireAuth` | Gets resume metadata (ownership enforced).           |
| `GET`    | `/api/resumes/:resumeId/download` | `requireAuth` | Downloads resume file from disk.                     |
| `PUT`    | `/api/resumes/:resumeId/default`  | `requireAuth` | Sets specific resume as candidate's default.         |
| `PATCH`  | `/api/resumes/:resumeId`          | `requireAuth` | Updates title / metadata.                            |
| `DELETE` | `/api/resumes/:resumeId`          | `requireAuth` | Deletes DB record & removes physical file from disk. |

---

## 4. Verification & Testing

- ✅ **Build Safety**: Executed `npm run build` — `tsc && tsc-alias` compiled with zero errors.
- ✅ **Type Declarations**: Installed `@types/multer` to guarantee full TypeScript safety.
- ✅ **Documentation**: Complete frontend integration guide documented in [phase16-resume-management.md](file:///x:/projects/next.js/SKILLEZO.AI/server/doc/phase16-resume-management.md).
