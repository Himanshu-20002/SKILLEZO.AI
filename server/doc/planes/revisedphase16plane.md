# Implementation Plan — Phase 16: Resume Management, Secure Storage & Application-Ready Resume Foundation

## Objective

Implement and harden the complete backend Resume Management module for authenticated candidates in SKILLEZO AI.

Phase 16 must provide a production-ready foundation for Phase 17 — Candidate Application Management.

Candidates must be able to:

- Upload multiple resumes.
- View and manage their resumes.
- Set exactly one default resume.
- Update resume metadata.
- Download resumes securely.
- Delete resumes safely.
- Have strict candidate-level ownership isolation.
- Maintain resume integrity when a resume is later used by a job application.
- Support future AI resume parsing without redesigning the data model.
- Use a storage abstraction so local filesystem storage can later be replaced by S3/R2/Azure Blob/etc.

Do not break existing authentication, database, API, or resume-related functionality.

---

# 1. Phase 16 Scope

Implement the following:

1. Resume database model.
2. Resume repository.
3. Resume service.
4. Resume controller.
5. Resume routes.
6. Secure upload middleware.
7. Private file storage.
8. Resume CRUD APIs.
9. Default resume management.
10. Strong ownership enforcement.
11. Upload/database consistency handling.
12. Secure authenticated download.
13. Resume deletion and physical-file cleanup.
14. Resume storage abstraction.
15. Resume status lifecycle foundation.
16. Application-compatible resume references.
17. Resume submission snapshot/version foundation.
18. Validation and security hardening.
19. Automated tests.
20. Frontend integration documentation.

---

# 2. Existing Architecture

Follow the existing backend architecture and conventions.

Expected structure:

```text
server/src/
├── database/
│   ├── models/
│   │   └── Resume.model.ts
│   └── repositories/
│       └── resume/
│           └── ResumeRepository.ts
│
├── core/
│   └── middleware/
│       └── upload.middleware.ts
│
└── modules/
    └── resume/
        ├── resume.dto.ts
        ├── resume.validator.ts
        ├── resume.service.ts
        ├── resume.controller.ts
        ├── resume.routes.ts
        └── index.ts
```

If the project already has a storage abstraction, validation utilities, error classes, response helpers, or repository conventions, reuse them rather than creating duplicate infrastructure.

Before modifying anything:

- Inspect the existing backend architecture.
- Inspect the existing `Resume` model.
- Inspect existing authentication middleware.
- Inspect existing repository patterns.
- Inspect existing error handling.
- Inspect existing API response conventions.
- Inspect existing static file configuration.
- Inspect existing tests.
- Inspect existing environment configuration.

Do not blindly overwrite existing implementations.

---

# 3. Authentication & Authorization

Every resume endpoint must require authentication.

Use the existing:

```text
requireAuth
```

middleware.

The authenticated candidate identity must always come from the server-side authenticated session/token.

Never accept `userId` from request body, query parameters, multipart form fields, or route parameters as the source of authorization.

Every resume operation must enforce:

```text
resume.userId === authenticatedUser.id
```

Unauthorized access must not expose whether another user's resume exists.

For another candidate's resume, return the existing standardized:

```text
RESUME_NOT_FOUND
```

behavior where appropriate.

---

# 4. Resume Database Model

Inspect the existing `Resume.model.ts` and extend it without unnecessarily breaking existing fields.

The model must support at least:

```text
_id
userId
title
fileName
originalFileName
storageKey
fileUrl / downloadPath where applicable
mimeType
fileSize
isDefault
status
uploadedAt
createdAt
updatedAt
extractedData
version
```

Recommended semantics:

### `title`

Human-readable candidate-controlled label.

Example:

```text
Frontend Developer Resume
Backend Engineer Resume
General Resume
```

Do not use `title` as the physical filesystem filename.

### `originalFileName`

Original filename supplied by the candidate.

### `fileName`

Server-generated stored filename where required by the current architecture.

### `storageKey`

Canonical identifier used by the storage abstraction.

Example:

```text
resumes/{userId}/{uuid}.pdf
```

Do not use user-controlled filenames as storage paths.

### `fileUrl`

Do not expose a public URL if the storage is private.

If retained for compatibility, treat it as an internal/reference field rather than assuming the file is publicly accessible.

### `mimeType`

Store validated MIME type.

### `fileSize`

Store actual uploaded file size.

### `isDefault`

Boolean.

### `status`

Use a defined lifecycle.

Minimum:

```text
uploaded
processing
processed
failed
```

If AI parsing is not implemented in Phase 16, the system may initially use:

```text
uploaded
```

but the enum/status architecture must be ready for future parsing.

### `extractedData`

Preserve the existing structure for future AI resume parsing.

Do not remove existing extracted data fields.

### `version`

Use a version number or equivalent mechanism that can support immutable application resume snapshots.

---

# 5. Database Indexes

Create/review indexes for:

```text
{ userId: 1, createdAt: -1 }
{ userId: 1, isDefault: 1 }
```

The system must guarantee that a candidate cannot have more than one default resume.

Prefer a database-level uniqueness guarantee where compatible with the MongoDB/Mongoose architecture.

A partial unique index on:

```text
userId
```

for documents where:

```text
isDefault === true
```

is preferred if compatible with the existing schema.

Do not rely only on application logic to enforce the one-default rule.

---

# 6. Resume Repository

Implement/review repository methods including:

```text
findByUserId(userId)
findUserResumeById(userId, resumeId)
findDefaultResume(userId)
createResume(data)
updateResume(userId, resumeId, data)
setDefaultResume(userId, resumeId)
clearDefaultFlag(userId)
deleteUserResume(userId, resumeId)
countUserResumes(userId)
```

All repository methods dealing with a specific resume must enforce ownership through `userId`.

Do not expose generic:

```text
findById(resumeId)
```

to controllers if it can accidentally bypass ownership.

---

# 7. Storage Abstraction

Do not tightly couple `resume.service.ts` directly to `fs`.

Create or reuse a storage abstraction.

Recommended interface:

```text
ResumeStorageService
```

with operations such as:

```text
save(file)
get(storageKey)
delete(storageKey)
exists(storageKey)
```

The first implementation can use local filesystem storage.

Example:

```text
LocalResumeStorage
```

The architecture must allow future replacement with:

```text
S3ResumeStorage
R2ResumeStorage
AzureBlobResumeStorage
```

without changing application/business logic.

---

# 8. Private Storage Requirement

Resume files contain sensitive candidate information.

They must NOT be publicly downloadable through an unauthenticated static URL.

Do not expose:

```text
/uploads/resumes/file.pdf
```

as an unrestricted public resource.

If the project currently serves `/uploads` statically, change the resume storage configuration so resume files are private.

The correct access flow is:

```text
GET /api/resumes/:resumeId/download
        ↓
requireAuth
        ↓
ownership check
        ↓
storage service
        ↓
stream private file
```

The candidate must never be able to download another candidate's resume by guessing a filename or storage key.

---

# 9. Upload Middleware

Use Multer or the project's existing upload middleware.

Allowed extensions:

```text
.pdf
.doc
.docx
```

Maximum file size:

```text
5 MB
```

Validate:

1. Extension.
2. MIME type.
3. File size.
4. Server-generated storage filename.
5. Safe storage path.
6. File signature/magic bytes where practical, especially for PDF.

Do not trust only the client-provided MIME type.

Never construct a filesystem path directly from the candidate's original filename.

Use a generated identifier such as:

```text
UUID
```

for physical storage naming.

---

# 10. Upload Flow

Endpoint:

```text
POST /api/resumes/upload
```

Authentication:

```text
requireAuth
```

Request:

```text
multipart/form-data
```

Fields:

```text
file
title (optional)
isDefault (optional)
```

Do not trust a multipart `userId`.

Flow:

```text
Request
  ↓
Authentication
  ↓
Validate candidate
  ↓
Validate file
  ↓
Check candidate resume limits
  ↓
Generate safe storage key
  ↓
Save private file
  ↓
Create MongoDB resume record
  ↓
Set default if required
  ↓
Return response
```

---

# 11. Upload Consistency / Orphan File Protection

Handle failures safely.

If:

```text
file storage succeeds
MongoDB creation fails
```

the service must delete the newly stored file.

Flow:

```text
Save file
   ↓
Create DB record
   ↓
SUCCESS
```

On failure:

```text
DB failure
   ↓
Delete physical/object-storage file
   ↓
Return standardized error
```

Do not leave orphan files.

Likewise, if the DB record is created but subsequent default handling fails, cleanly reconcile the state or rollback where practical.

---

# 12. Resume Count / Storage Limits

Prevent unlimited resume uploads.

Implement a configurable candidate resume limit.

Do not hardcode the limit in multiple files.

Example configuration:

```text
MAX_RESUMES_PER_USER
MAX_RESUME_FILE_SIZE
```

Use the project's existing configuration/environment convention.

The initial default may be reasonable for the MVP, but it must be configurable.

Return a clear standardized error when the limit is exceeded.

---

# 13. Default Resume Behavior

Rules:

### First resume

If the candidate has no resumes:

```text
isDefault = true
```

automatically.

### Subsequent resume

If the candidate already has a default:

```text
isDefault = false
```

unless the candidate explicitly requests the new resume as default.

### Set default

Endpoint:

```text
PUT /api/resumes/:resumeId/default
```

Must:

1. Authenticate candidate.
2. Verify ownership.
3. Clear existing default.
4. Set selected resume as default.
5. Guarantee exactly one default.

### Delete default

If the default resume is deleted:

```text
delete default
     ↓
find newest remaining resume
     ↓
promote to default
```

If no resumes remain:

```text
no default
```

---

# 14. Default Resume Concurrency

The default-resume operation must be safe under concurrent requests.

Avoid a design where two concurrent requests can permanently result in:

```text
Resume A → isDefault: true
Resume B → isDefault: true
```

Use an appropriate MongoDB update strategy and database constraint.

Test concurrent/default switching behavior where practical.

---

# 15. Resume Metadata Update

Endpoint:

```text
PATCH /api/resumes/:resumeId
```

Allow only safe metadata fields.

Recommended:

```json
{
  "title": "Frontend Developer Resume"
}
```

Optionally:

```json
{
  "isDefault": true
}
```

Do NOT allow clients to modify:

```text
userId
storageKey
file path
createdAt
uploadedAt
version
fileSize
mimeType
status
```

Do not let `fileName` updates alter the physical stored filename.

If backward compatibility requires `fileName`, treat it as display metadata only.

Validate title length and trim whitespace.

---

# 16. Resume Download

Endpoint:

```text
GET /api/resumes/:resumeId/download
```

Authentication required.

Flow:

```text
authenticate
    ↓
find resume by userId + resumeId
    ↓
check storageKey
    ↓
check file exists
    ↓
stream file
```

Set appropriate headers:

```text
Content-Type
Content-Disposition
Content-Length where available
```

Use:

```text
attachment
```

for normal resume download behavior.

Do not load very large files into memory unnecessarily.

Use streaming.

---

# 17. Resume Deletion

Endpoint:

```text
DELETE /api/resumes/:resumeId
```

Authentication required.

Flow:

```text
Authenticate
   ↓
Find owned resume
   ↓
Check application references
   ↓
Delete DB record
   ↓
Delete physical/object-storage file
   ↓
Promote next default if necessary
```

However, application references must be handled carefully.

A resume that has already been used for an application must not cause historical application data to become invalid.

Therefore:

- Do not allow deletion to destroy historical application resume information.
- Phase 17 must store an immutable resume submission snapshot.
- If the current architecture requires keeping the physical file, define a retention/reference policy.
- If the resume is deleted from the candidate's active resume library, the historical application snapshot must remain available according to the application retention policy.

Do not silently delete historical application data.

---

# 18. Application-Compatible Resume Contract

Phase 16 must explicitly define the contract used by Phase 17.

When a candidate applies for a job, Phase 17 may select:

```text
resumeId
```

or, when no resume is supplied:

```text
candidate's default resume
```

Phase 17 must verify:

```text
resume.userId === authenticatedCandidate.id
```

before using it.

Never allow:

```text
candidate A → application → resume belonging to candidate B
```

---

# 19. Resume Snapshot Requirement

A resume used in a job application must be historically stable.

Do NOT rely only on:

```text
application.resumeId
```

because the candidate may later:

- Edit the resume metadata.
- Upload a replacement.
- Delete the resume.
- Change their default resume.
- Upload another version.

Phase 17 must store a resume submission snapshot.

Recommended application structure:

```text
Application
├── resumeId
└── resumeSnapshot
    ├── originalFileName
    ├── title
    ├── storageKey
    ├── mimeType
    ├── fileSize
    ├── version
    └── submittedAt
```

The snapshot must represent the exact resume selected at application time.

Do not dynamically resolve an application's resume using the candidate's current default resume.

Example:

```text
Day 1:
Resume A selected
Application created
Snapshot = Resume A v1

Day 10:
Candidate uploads Resume B
Candidate sets Resume B as default

Day 20:
Resume A deleted

Application from Day 1 must still refer to Resume A v1.
```

This contract is mandatory for Phase 17 compatibility.

---

# 20. Resume Versioning

Prepare the model for resume versions.

At minimum:

```text
version: number
```

should exist.

If the current implementation treats every uploaded file as a separate resume, do not force complex versioning unnecessarily.

However, when a resume is copied into an application snapshot, store the version/value that identifies the exact uploaded artifact.

---

# 21. Resume Status

Define status values consistently.

Recommended:

```text
uploaded
processing
processed
failed
```

Phase 16 does not need to implement AI parsing unless already part of the existing project.

For now:

```text
uploaded
```

is sufficient for newly uploaded resumes.

Do not invent fake parsing results.

Keep:

```text
extractedData
```

ready for the future AI parsing phase.

---

# 22. API Endpoints

Implement/review:

| Method | Endpoint                          | Auth     | Purpose                  |
| ------ | --------------------------------- | -------- | ------------------------ |
| POST   | `/api/resumes/upload`             | Required | Upload resume            |
| GET    | `/api/resumes`                    | Required | List candidate resumes   |
| GET    | `/api/resumes/:resumeId`          | Required | Get resume metadata      |
| GET    | `/api/resumes/:resumeId/download` | Required | Securely download resume |
| PUT    | `/api/resumes/:resumeId/default`  | Required | Set default              |
| PATCH  | `/api/resumes/:resumeId`          | Required | Update metadata          |
| DELETE | `/api/resumes/:resumeId`          | Required | Delete resume            |

Do not introduce unnecessary endpoints.

---

# 23. API Response Format

Use the project's existing:

```text
successResponse()
```

or equivalent response utility.

Do not create a new response format if one already exists.

Upload response should include safe metadata:

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "userId": "...",
    "title": "Frontend Developer Resume",
    "originalFileName": "resume.pdf",
    "fileName": "generated-file.pdf",
    "mimeType": "application/pdf",
    "fileSize": 245678,
    "isDefault": true,
    "status": "uploaded",
    "version": 1,
    "uploadedAt": "2026-08-17T00:00:00.000Z",
    "createdAt": "2026-08-17T00:00:00.000Z",
    "updatedAt": "2026-08-17T00:00:00.000Z"
  }
}
```

Do not expose sensitive internal filesystem paths.

Do not expose storage credentials.

---

# 24. Error Codes

Use the project's existing error architecture.

Minimum resume errors:

| Code                      |    HTTP | Description                                      |
| ------------------------- | ------: | ------------------------------------------------ |
| `UNAUTHORIZED`            |     401 | Missing/invalid authentication                   |
| `RESUME_NOT_FOUND`        |     404 | Resume does not exist or belongs to another user |
| `INVALID_FILE_TYPE`       |     400 | Unsupported file format                          |
| `FILE_TOO_LARGE`          |     400 | File exceeds maximum size                        |
| `RESUME_LIMIT_EXCEEDED`   | 400/409 | Candidate exceeded resume limit                  |
| `RESUME_STORAGE_ERROR`    |     500 | Storage failure                                  |
| `RESUME_UPLOAD_FAILED`    |     500 | Upload could not be completed                    |
| `RESUME_FILE_NOT_FOUND`   |     404 | DB record exists but stored file is missing      |
| `INVALID_RESUME_METADATA` |     400 | Invalid metadata                                 |
| `DEFAULT_RESUME_ERROR`    | 409/500 | Default resume state could not be maintained     |

Use existing error codes if the project already has equivalent names.

---

# 25. Validation

Use Zod or the existing validation framework.

Validate:

### Route parameters

```text
resumeId
```

### Query parameters

Only if the endpoint supports them.

### PATCH body

Example:

```json
{
  "title": "Frontend Developer Resume"
}
```

Constraints:

- String.
- Trimmed.
- Reasonable maximum length.
- Reject unknown protected fields.
- Validate `isDefault` if supported.

Do not trust client-provided:

```text
userId
storageKey
fileSize
mimeType
```

---

# 26. Security Requirements

The implementation must protect against:

- Cross-user resume access.
- Cross-user resume deletion.
- Cross-user downloads.
- Path traversal.
- Malicious filenames.
- Spoofed MIME types.
- Oversized files.
- Public resume exposure.
- Unauthorized metadata modification.
- Unauthorized default-resume changes.
- Storage-key manipulation.
- Orphaned files.
- Sensitive path leakage.

Never return physical server paths such as:

```text
C:\projects\...
```

in API responses.

---

# 27. Candidate Ownership Rule

Every operation must be scoped using authenticated identity.

Correct:

```text
findOne({
  _id: resumeId,
  userId: authenticatedUserId
})
```

Incorrect:

```text
findById(resumeId)
```

followed by trusting client data.

This is a mandatory security invariant.

---

# 28. Testing Requirements

Add automated tests covering at least:

## Authentication

- Unauthenticated upload rejected.
- Unauthenticated list rejected.
- Unauthenticated download rejected.
- Unauthenticated delete rejected.

## Ownership

- Candidate can access own resume.
- Candidate cannot access another candidate's resume.
- Candidate cannot download another candidate's resume.
- Candidate cannot delete another candidate's resume.
- Candidate cannot set another candidate's resume as default.

## Upload

- PDF accepted.
- DOC accepted.
- DOCX accepted.
- Unsupported extension rejected.
- Invalid MIME rejected.
- Oversized file rejected.
- Safe generated filename used.
- Candidate resume limit enforced.

## Default

- First resume becomes default.
- Second resume does not replace default automatically.
- Explicit default switch works.
- Previous default is cleared.
- Deleting default promotes newest remaining resume.
- Deleting last resume leaves no default.
- Concurrent default operations do not leave multiple defaults.

## Metadata

- Candidate can update title.
- Protected fields cannot be changed.
- Invalid metadata rejected.

## Download

- Owned resume downloads successfully.
- Missing physical file returns correct error.
- Other candidate cannot download file.
- Physical path is not exposed.

## Delete

- DB record deleted.
- Physical file deleted.
- Storage failure handled safely.
- Historical application snapshot is not destroyed.

## Consistency

- DB failure after file save removes orphan file.
- Storage failure does not silently report success.

---

# 29. Storage Failure Strategy

Handle these cases explicitly.

### Case 1

```text
Storage succeeds
DB fails
```

Action:

```text
Delete stored file
Return error
```

### Case 2

```text
DB exists
Storage file missing
```

Download should return:

```text
RESUME_FILE_NOT_FOUND
```

and should not expose server internals.

### Case 3

```text
DB deletion succeeds
Storage deletion fails
```

Do not pretend storage deletion succeeded.

Implement a safe cleanup/reconciliation mechanism appropriate to the existing architecture.

At minimum, log the failure with a correlation/error identifier.

---

# 30. Logging

Use the existing project logger.

Log important operational failures:

- Upload failure.
- Storage failure.
- Resume deletion failure.
- Missing storage file.
- DB/storage consistency failure.

Do NOT log:

- Resume contents.
- Candidate private document contents.
- Authentication tokens.
- Sensitive credentials.

---

# 31. API Documentation

Update/create:

```text
server/doc/phase16-resume-management.md
```

Document:

1. Overview.
2. Authentication.
3. Upload.
4. List.
5. Get metadata.
6. Secure download.
7. Set default.
8. Update metadata.
9. Delete.
10. Error codes.
11. File restrictions.
12. Default behavior.
13. Security model.
14. Storage architecture.
15. Application compatibility.
16. Resume snapshot contract.
17. Example requests/responses.

Include frontend integration examples where appropriate.

---

# 32. Frontend Integration Contract

The backend documentation must clearly explain that the frontend should:

### Upload

Use:

```text
multipart/form-data
```

with:

```text
file
title
isDefault
```

### List

Use:

```text
GET /api/resumes
```

### Select resume for application

Phase 17 frontend should submit:

```text
resumeId
```

when the candidate chooses a specific resume.

If no resume is explicitly selected and product requirements allow it:

```text
use default resume
```

must happen server-side.

The frontend must never submit another candidate's resume ID successfully.

---

# 33. Phase 17 Compatibility Contract

Phase 16 is complete only when this contract is clear:

```text
Candidate
   │
   ├── Resume A
   ├── Resume B
   └── Resume C
          │
          │ Candidate selects Resume B
          ▼
       Application
          │
          ├── candidateId
          ├── jobId
          ├── resumeId
          └── resumeSnapshot
```

Phase 17 must:

1. Authenticate candidate.
2. Validate job.
3. Check duplicate application.
4. Resolve selected/default resume.
5. Verify resume ownership.
6. Capture immutable resume snapshot.
7. Create application.
8. Never rely on the candidate's current default resume after application creation.

Do not implement the application module inside Phase 16 unless required by the existing architecture.

Phase 16 only needs to provide the contract and resume data necessary for Phase 17.

---

# 34. Backward Compatibility

Before changing the model:

- Inspect existing resume documents.
- Preserve existing fields.
- Provide safe defaults for new fields.
- Do not break existing resume records.
- Do not delete existing `extractedData`.
- Do not invalidate existing APIs unless necessary.

If migrations are required, implement them safely.

Do not assume the database is empty.

---

# 35. Build & Verification

Run:

```bash
npm run build
```

and ensure:

```text
TypeScript compilation passes.
```

Run all relevant tests.

Also verify:

```text
npm test
```

or the project's actual test command.

If linting exists:

```text
npm run lint
```

Run it as well.

Do not declare Phase 16 complete if the build fails.

---

# 36. Manual Verification Checklist

Verify the following end-to-end:

```text
[ ] Candidate authenticates
[ ] Candidate uploads PDF
[ ] Candidate uploads DOC
[ ] Candidate uploads DOCX
[ ] First resume becomes default
[ ] Second resume remains non-default
[ ] Candidate changes default
[ ] Previous default is cleared
[ ] Candidate updates title
[ ] Candidate lists resumes
[ ] Candidate gets resume metadata
[ ] Candidate downloads own resume
[ ] Candidate cannot download another user's resume
[ ] Candidate cannot modify another user's resume
[ ] Candidate cannot delete another user's resume
[ ] Candidate deletes default
[ ] Newest remaining resume becomes default
[ ] Candidate deletes all resumes
[ ] Invalid file rejected
[ ] Oversized file rejected
[ ] Storage remains private
[ ] Upload failure does not leave orphan file
[ ] Missing storage file handled correctly
[ ] Resume limit enforced
[ ] Application resume snapshot contract documented
[ ] Build passes
[ ] Tests pass
```

---

# 37. Definition of Done

Phase 16 is complete only when all of the following are true:

### Backend

- Resume model implemented.
- Repository implemented.
- Service implemented.
- Controller implemented.
- Routes implemented.
- Upload middleware implemented.
- Authentication enforced.
- Ownership enforced.
- Validation implemented.
- Secure private storage implemented.
- Storage abstraction implemented.
- Default resume logic implemented.
- One-default invariant enforced.
- Metadata update implemented.
- Secure download implemented.
- Delete implemented.
- Orphan-file protection implemented.
- Storage failure handling implemented.
- Resume limits implemented.
- Status lifecycle foundation implemented.
- Application compatibility contract implemented.
- Resume snapshot/version strategy documented.

### Security

- No public resume URLs.
- No cross-user access.
- No path traversal.
- No client-controlled storage paths.
- File type validation implemented.
- File size validation implemented.
- Sensitive server paths not exposed.

### Data Integrity

- DB/storage consistency handled.
- Default resume invariant maintained.
- Historical application resume information protected.
- Existing resume data remains compatible.

### Testing

- Unit/integration tests added.
- Ownership tests pass.
- Upload tests pass.
- Default-resume tests pass.
- Delete tests pass.
- Secure download tests pass.
- Storage failure tests pass.
- Build passes.

### Documentation

- `phase16-resume-management.md` updated.
- API endpoints documented.
- Error codes documented.
- Security behavior documented.
- Phase 17 integration contract documented.
- Resume snapshot behavior documented.

---

# 38. Final Expected Architecture

The completed Phase 16 architecture should look like:

```text
                    CANDIDATE
                        │
                        ▼
               requireAuth middleware
                        │
                        ▼
                 Resume Routes
                        │
                        ▼
               Resume Controller
                        │
                        ▼
                 Resume Service
                   /        \
                  /          \
                 ▼            ▼
       Resume Repository   Storage Service
                 │            │
                 ▼            ▼
              MongoDB     Private Storage
                 │
                 ▼
          Resume Metadata
                 │
                 │
                 ▼
       Phase 17 Application
                 │
                 ├── resumeId
                 │
                 └── resumeSnapshot
```

The critical invariant is:

```text
A candidate can only operate on their own resumes.
```

And the critical Phase 17 invariant is:

```text
An application must preserve the exact resume artifact
that was submitted at application time.
```

---

# 39. Implementation Instructions for Antigravity

Before coding:

1. Inspect the complete existing backend.
2. Inspect the current Phase 16 implementation.
3. Identify what already exists.
4. Do not recreate existing working components unnecessarily.
5. Preserve project conventions.
6. Implement missing Phase 16 requirements.
7. Fix security/data-integrity issues.
8. Add tests.
9. Update documentation.
10. Run build/tests.
11. Review Phase 17 compatibility before declaring completion.

Do not implement Phase 17 application-management functionality yet.

Do not add unrelated features.

Do not redesign unrelated modules.

Focus exclusively on making Phase 16 a complete, secure, application-ready Resume Management foundation.

At the end, provide a concise implementation report containing:

```text
1. Files changed
2. Files created
3. Database changes
4. API changes
5. Security changes
6. Storage changes
7. Application compatibility changes
8. Tests added
9. Build/test results
10. Remaining limitations, if any
```

The final Phase 16 implementation must be ready for Phase 17 to consume without requiring a later redesign of the resume architecture.
