# Recruiter Application Management API Specifications

Complete OpenAPI reference documentation for the **Recruiter / Employer Application Management & Hiring Pipeline API**.

---

## Overview & Authentication

- **Base Route**: `/api/recruiter/applications`
- **Authentication**: Required (`requireAuth` session token).
- **Authorization Chain**:
  `req.user.id` ➔ `CompanyMember` (active `owner` / `admin` / `recruiter`) ➔ `Company` ➔ `Job.companyId` ➔ `Application.jobId`.

---

## Endpoints

### 1. List Company Applications (`GET /api/recruiter/applications`)
Retrieve paginated job applications submitted to jobs owned by the recruiter's company.

#### Query Parameters
- `page`: `number` (default `1`)
- `limit`: `number` (default `20`, max `50`)
- `jobId`: `string` (Optional ObjectId filter)
- `status`: `string` (Optional status filter: `applied`, `under_review`, `shortlisted`, `interview`, `offered`, `hired`, `rejected`, `withdrawn`)

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "66bce000000000abcdef0001",
        "status": "applied",
        "job": {
          "id": "66bcd123456789abcdef0123",
          "title": "Senior Backend Engineer",
          "companyName": "Acme Corp"
        },
        "candidate": {
          "id": "usr_candidate_123"
        },
        "resume": {
          "id": "66bcd999999999abcdef0999",
          "title": "Backend_Engineer_Resume.pdf",
          "originalFileName": "Backend_Engineer_Resume.pdf",
          "version": 1
        },
        "appliedAt": "2026-08-17T14:30:00.000Z",
        "updatedAt": "2026-08-17T14:30:00.000Z"
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

### 2. Application Details (`GET /api/recruiter/applications/:applicationId`)
Get full details of a specific application including candidate information, `resumeSnapshot`, and status history timeline.

---

### 3. Application Timeline History (`GET /api/recruiter/applications/:applicationId/status-history`)
Get chronological append-only status transition history.

---

### 4. Stream Submitted Resume (`GET /api/recruiter/applications/:applicationId/resume`)
Stream the private submitted resume artifact file associated with `resumeSnapshot.storageKey`.

- **Headers Set**:
  - `Content-Type`: `application/pdf` (or original MIME type)
  - `Content-Disposition`: `attachment; filename="..."`

---

### 5. Update Recruiter Application Status (`PATCH /api/recruiter/applications/:applicationId/status`)
Advance an application through recruiter pipeline states.

#### Request Body
```json
{
  "status": "SHORTLISTED",
  "reason": "Passed initial screening evaluation"
}
```

#### Allowed State Machine Transitions
- `applied` ➔ `under_review`, `shortlisted`, `rejected`
- `under_review` ➔ `shortlisted`, `rejected`
- `shortlisted` ➔ `interview`, `rejected`
- `interview` ➔ `offered`, `rejected`
- `offered` ➔ `hired`, `rejected`

*Note: Candidate terminal status `withdrawn` cannot be modified by recruiters.*

---

## Error Codes

| Code | Status | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing authentication session |
| `RECRUITER_COMPANY_MEMBERSHIP_NOT_FOUND` | 403 | User has no active recruiter/admin company membership |
| `APPLICATION_NOT_FOUND` | 404 | Application does not exist or belong to user's company |
| `APPLICATION_INVALID_STATUS_TRANSITION` | 400 | Invalid state transition or attempt to modify `withdrawn` status |
| `APPLICATION_RESUME_FILE_NOT_FOUND` | 404 | Stored resume file artifact is missing |
