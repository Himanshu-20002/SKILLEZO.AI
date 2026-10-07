# Application Management API Specifications

Complete documentation for the **Candidate Application Management & Application Workflow API**.

---

## Overview & Authentication

- **Base Route**: `/api/applications`
- **Authentication**: Required (`requireAuth` session token). Candidate identity is strictly derived server-side (`req.user.id`).

---

## Endpoints

### 1. Apply to Job (`POST /api/applications`)
Apply to a job listing.

#### Request Body
```json
{
  "jobId": "66bcd123456789abcdef0123",
  "resumeId": "66bcd999999999abcdef0999"
}
```
*Note: `resumeId` is optional. If omitted, candidate's default resume is automatically selected.*

#### Response — Native Platform Job (`201 Created`)
```json
{
  "success": true,
  "data": {
    "_id": "66bce000000000abcdef0001",
    "userId": "usr_candidate_123",
    "jobId": "66bcd123456789abcdef0123",
    "resumeId": "66bcd999999999abcdef0999",
    "status": "applied",
    "appliedAt": "2026-08-17T14:30:00.000Z",
    "statusHistory": [
      {
        "status": "applied",
        "changedAt": "2026-08-17T14:30:00.000Z",
        "changedBy": "usr_candidate_123",
        "reason": "Initial job application submitted"
      }
    ]
  }
}
```

#### Response — External Ingested Job (`200 OK`)
```json
{
  "success": true,
  "data": {
    "type": "external_application",
    "sourceType": "external",
    "sourceProvider": "jooble",
    "externalId": "ext_998877",
    "sourceUrl": "https://jooble.org/job/998877",
    "message": "Continue the application on the original job source."
  }
}
```

---

### 2. List My Applications (`GET /api/applications`)
Retrieve paginated candidate applications.

#### Query Parameters
- `page`: `number` (default `1`)
- `limit`: `number` (default `20`, max `50`)
- `status`: `string` (`applied`, `shortlisted`, `interview`, `withdrawn`, etc.)

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "66bce000000000abcdef0001",
        "userId": "usr_candidate_123",
        "jobId": "66bcd123456789abcdef0123",
        "resumeId": "66bcd999999999abcdef0999",
        "status": "applied",
        "job": {
          "id": "66bcd123456789abcdef0123",
          "title": "Full Stack Engineer",
          "companyName": "TechCorp Inc.",
          "location": "San Francisco, CA",
          "workplaceType": "remote",
          "employmentType": "full_time"
        },
        "resume": {
          "id": "66bcd999999999abcdef0999",
          "title": "Fullstack_Developer_Resume.pdf",
          "isDefault": true
        },
        "resumeSnapshot": {
          "resumeId": "66bcd999999999abcdef0999",
          "title": "Fullstack_Developer_Resume.pdf",
          "originalFileName": "Fullstack_Developer_Resume.pdf",
          "storageKey": "resumes/usr_candidate_123/uuid.pdf",
          "mimeType": "application/pdf",
          "fileSize": 245678,
          "version": 1,
          "submittedAt": "2026-08-17T14:30:00.000Z"
        },
        "statusHistory": [
          {
            "status": "applied",
            "changedAt": "2026-08-17T14:30:00.000Z",
            "changedBy": "usr_candidate_123",
            "reason": "Initial job application submitted"
          }
        ],
        "appliedAt": "2026-08-17T14:30:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
}
```

---

### 3. Application Details (`GET /api/applications/:applicationId`)
Get single application details.

---

### 4. Status History (`GET /api/applications/:applicationId/status-history`)
Get chronological status transition history.

---

### 5. Withdraw Application (`PATCH /api/applications/:applicationId/withdraw`)
Withdraw an active application.

#### Request Body
```json
{
  "reason": "Accepted another position"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "66bce000000000abcdef0001",
    "status": "withdrawn"
  }
}
```

---

## Error Codes

| Code | Status | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing authentication session |
| `APPLICATION_NOT_FOUND` | 404 | Application does not exist or belong to user |
| `APPLICATION_ALREADY_EXISTS` | 409 | Candidate has already applied for this job |
| `APPLICATION_JOB_NOT_FOUND` | 404 | Target job does not exist |
| `APPLICATION_JOB_NOT_ACTIVE` | 400 | Job is not ACTIVE (e.g. DRAFT or CLOSED) |
| `APPLICATION_RESUME_NOT_OWNED` | 400 | Target resume does not belong to candidate |
| `APPLICATION_RESUME_NOT_FOUND` | 400 | Candidate has no resumes available |
| `APPLICATION_ALREADY_WITHDRAWN` | 409 | Application is already in WITHDRAWN state |
| `APPLICATION_CANNOT_WITHDRAW` | 400 | Current application status cannot be withdrawn |
