# Phase 16 — Resume Management & Secure Storage (Complete Specification)

This document provides full specification for the hardened **Phase 16 — Resume Management & Storage API**, supporting private storage, ownership enforcement, default switching, and Phase 17 application snapshot compatibility.

---

## 1. Overview & Key Principles

- **Base Route**: `/api/resumes`
- **Authentication**: **Required** (`requireAuth` via Better Auth session/token). All operations enforce candidate-level ownership (`userId`).
- **Allowed Formats**: `.pdf`, `.doc`, `.docx` (Max file size: **5MB**, Max uploads per candidate: **10**).
- **Private Storage**: Resume files are stored in non-public private storage (`storage/resumes/...`). They are accessible strictly via authenticated download stream endpoints (`GET /api/resumes/:resumeId/download`).
- **Default Resume Rules**:
  - First upload automatically becomes `isDefault: true`.
  - Setting a default resume clears default flags on other resumes via atomic partial indexes and update operations.
  - Deleting a default resume automatically promotes the next newest remaining resume to default.

---

## 2. API Endpoints

### 2.1 Upload Resume (`POST /api/resumes/upload`)
- **Headers**: `Content-Type: multipart/form-data`
- **Body**:
  - `file`: Resume file (`.pdf`, `.doc`, `.docx`, Max 5MB)
  - `title`: `string` (Optional human label, max 100 chars)
  - `isDefault`: `boolean` string (`"true"` / `"false"`, optional)

#### Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "_id": "66bcd123456789abcdef0123",
    "userId": "usr_9988776655",
    "title": "Senior Frontend Developer Resume",
    "originalFileName": "john_doe_resume.pdf",
    "fileName": "1723635800000-123456789.pdf",
    "storageKey": "resumes/usr_9988776655/1723635800000-123456789.pdf",
    "fileUrl": "/api/resumes/download-ref/1723635800000-123456789.pdf",
    "mimeType": "application/pdf",
    "fileSize": 245678,
    "isDefault": true,
    "status": "uploaded",
    "version": 1,
    "uploadedAt": "2026-08-17T12:00:00.000Z",
    "createdAt": "2026-08-17T12:00:00.000Z",
    "updatedAt": "2026-08-17T12:00:00.000Z"
  }
}
```

---

### 2.2 List User Resumes (`GET /api/resumes`)
- Returns array of active resumes belonging to the authenticated candidate sorted newest first.

---

### 2.3 Download Resume File (`GET /api/resumes/:resumeId/download`)
- Streams private stored resume file directly with `Content-Disposition: attachment`.

---

### 2.4 Set Resume as Default (`PUT /api/resumes/:resumeId/default`)
- Marks target resume as default and resets other candidate default flags.

---

### 2.5 Update Resume Metadata (`PATCH /api/resumes/:resumeId`)
- **Body**: `{ "title": "Updated Label", "isDefault": true }` (Protected system fields `userId`, `storageKey`, `fileSize` are rejected).

---

### 2.6 Delete Resume (`DELETE /api/resumes/:resumeId`)
- Deletes record, unlinks physical file from private storage, and auto-promotes newest remaining resume to default if needed.

---

## 3. Phase 17 Application Snapshot Contract

When Phase 17 creates a job application, it **MUST NOT** store only a dynamic reference to `isDefault`. Instead, Phase 17 must capture an **immutable `resumeSnapshot`**:

```json
{
  "applicationId": "app_9911223344",
  "jobId": "job_55667788",
  "candidateId": "usr_9988776655",
  "resumeId": "66bcd123456789abcdef0123",
  "resumeSnapshot": {
    "title": "Senior Frontend Developer Resume",
    "originalFileName": "john_doe_resume.pdf",
    "storageKey": "resumes/usr_9988776655/1723635800000-123456789.pdf",
    "mimeType": "application/pdf",
    "fileSize": 245678,
    "version": 1,
    "submittedAt": "2026-08-17T12:00:00.000Z"
  }
}
```

---

## 4. Error Codes

| Code | Status | Description |
|---|---|---|
| `UNAUTHORIZED` | `401` | Missing or invalid auth session |
| `RESUME_NOT_FOUND` | `404` | Resume ID does not exist or belongs to another user |
| `INVALID_FILE_TYPE` | `400` | Unsupported file extension or MIME type |
| `FILE_TOO_LARGE` | `400` | Uploaded file exceeds 5MB size limit |
| `RESUME_LIMIT_EXCEEDED` | `400` | Candidate reached max resume limit (10) |
| `RESUME_STORAGE_ERROR` | `500` | Private storage file system operation failed |
| `RESUME_UPLOAD_FAILED` | `500` | DB creation failed; file cleanly unlinked |
| `RESUME_FILE_NOT_FOUND` | `404` | DB record exists but storage file is missing |
| `INVALID_RESUME_METADATA` | `400` | Invalid request body or payload |
| `DEFAULT_RESUME_ERROR` | `500` | Unable to set default resume |
