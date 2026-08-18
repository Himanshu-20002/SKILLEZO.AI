# SKILLEZO Backend — Resume Processing & Storage API

This document provides full specification for the **Resume Management & Private Storage API** implemented in Phase 16.

---

## 1. Overview & Key Principles

- **Base Route**: `/api/resumes`
- **Authentication**: **Required** (`requireAuth` via Better Auth session). Candidate identity (`userId`) is strictly derived from session.
- **Allowed Formats**: `.pdf`, `.doc`, `.docx` (Max file size: **5MB**, Max upload limit: **10**).
- **Private Storage**: Files are stored in private non-public directory (`storage/resumes/...`), streamed directly via `GET /api/resumes/:resumeId/download`.
- **Default Resume Behavior**:
  - The candidate's first uploaded resume automatically becomes `isDefault: true`.
  - Setting a default resume clears default flags on other resumes via atomic database operations.
  - Deleting a default resume automatically promotes the next newest remaining resume to default.

---

## 2. API Endpoints

### 2.1 Upload Resume (`POST /api/resumes/upload`)
- **Headers**: `Content-Type: multipart/form-data`
- **Body**:
  - `file`: Resume document (`.pdf`, `.doc`, `.docx`)
  - `title`: `string` (Optional label, max 100 chars)
  - `isDefault`: `boolean` / `string` (`"true"` / `"false"`)

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
- Returns array of active resumes belonging to the candidate sorted newest first.

---

### 2.3 Download Resume (`GET /api/resumes/:resumeId/download`)
- Streams stored resume attachment directly with `Content-Disposition: attachment`.

---

### 2.4 Set Default Resume (`PUT /api/resumes/:resumeId/default`)
- Marks target resume as default while clearing default flag on other candidate resumes.

---

### 2.5 Update Resume Metadata (`PATCH /api/resumes/:resumeId`)
- **Body**: `{ "title": "Updated Label", "isDefault": true }`

---

### 2.6 Delete Resume (`DELETE /api/resumes/:resumeId`)
- Deletes resume record and unlinks physical file from private storage. Auto-promotes next newest resume to default if deleted resume was default.

---

## 3. Error Codes

| Code | Status | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing authentication session |
| `RESUME_NOT_FOUND` | 404 | Resume ID does not exist or belongs to another user |
| `INVALID_FILE_TYPE` | 400 | Unsupported file format or MIME type |
| `FILE_TOO_LARGE` | 400 | File exceeds 5MB limit |
| `RESUME_LIMIT_EXCEEDED` | 400 | Candidate reached maximum resume limit (10) |
| `RESUME_STORAGE_ERROR` | 500 | Storage operation failure |
| `RESUME_UPLOAD_FAILED` | 500 | DB creation failed; orphan file cleanly unlinked |
