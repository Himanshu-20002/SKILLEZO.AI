# SKILLEZO Backend — Company API

The Company module manages employer organization entities, slug generation, public company profiles, and ownership-based authorizations.

---

## Endpoint Summary Table

| Method | Path | Authentication | Authorization | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/companies` | Required | Authenticated User | Create company & assign creator as `OWNER`. |
| `GET` | `/api/companies/me` | Required | Active Member | Retrieve companies user belongs to. |
| `GET` | `/api/companies/:companyId` | Public | None | Retrieve public company profile by ID. |
| `PATCH` | `/api/companies/:companyId` | Required | Owner / Admin | Update company details. |

---

## 1. Create Company (`POST /api/companies`)

* **Purpose**: Creates a new company organization. Automatically creates a `CompanyMember` record for the creator with `role: "owner"` and `status: "active"`.
* **Authentication**: Required (`requireAuth`).

### Request Body (`CreateCompanyDTO`)
```json
{
  "name": "Innovate Tech",
  "slug": "innovate-tech",
  "description": "Building modern AI-driven solutions.",
  "industry": "Artificial Intelligence",
  "website": "https://innovate.example.com",
  "logoUrl": "https://innovate.example.com/logo.png",
  "location": {
    "city": "Austin",
    "state": "TX",
    "country": "USA"
  },
  "companySize": "11-50"
}
```

*Note: `slug` is optional. If omitted, the server automatically generates one from `name`.*

### Success Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "_id": "66b8c1f92e40123456789aaa",
    "name": "Innovate Tech",
    "slug": "innovate-tech",
    "description": "Building modern AI-driven solutions.",
    "industry": "Artificial Intelligence",
    "website": "https://innovate.example.com",
    "logoUrl": "https://innovate.example.com/logo.png",
    "location": {
      "city": "Austin",
      "state": "TX",
      "country": "USA"
    },
    "companySize": "11-50",
    "verificationStatus": "pending",
    "createdBy": "usr_987654321",
    "createdAt": "2026-08-11T07:38:00.000Z",
    "updatedAt": "2026-08-11T07:38:00.000Z"
  }
}
```

### Possible Errors
* `400 Bad Request` (`VALIDATION_ERROR`): Invalid website URL or missing name.
* `401 Unauthorized`: Session cookie missing.
* `409 Conflict` (`CONFLICT`): Company slug already exists in database.

---

## 2. Get My Companies (`GET /api/companies/me`)

* **Purpose**: Retrieves all companies where the authenticated user holds an active membership.
* **Authentication**: Required (`requireAuth`).

### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "_id": "66b8c1f92e40123456789aaa",
      "name": "Innovate Tech",
      "slug": "innovate-tech",
      "verificationStatus": "pending",
      "createdBy": "usr_987654321",
      "createdAt": "2026-08-11T07:38:00.000Z",
      "updatedAt": "2026-08-11T07:38:00.000Z"
    }
  ]
}
```

---

## 3. Get Public Company Profile (`GET /api/companies/:companyId`)

* **Purpose**: Public endpoint to view company details by MongoDB ObjectId.
* **Authentication**: None (Public).

### Success Response (`200 OK`)
Returns company JSON document.

### Possible Errors
* `400 Bad Request`: `companyId` is not a valid 24-character hex ObjectId string.
* `404 Not Found` (`COMPANY_NOT_FOUND`): Company does not exist.

---

## 4. Update Company (`PATCH /api/companies/:companyId`)

* **Purpose**: Updates company details.
* **Authentication**: Required (`requireAuth`).
* **Authorization**: User must have an active `CompanyMember` record with role `OWNER` or `ADMIN`.

### Request Body (`UpdateCompanyDTO`)
All fields except `slug` are editable (slug is treated as a stable identifier).

### Possible Errors
* `403 Forbidden` (`FORBIDDEN`): Requester is non-member, viewer, recruiter, or suspended.
* `404 Not Found` (`COMPANY_NOT_FOUND`): Target company ID does not exist.

---

## Related Documentation
- [Authentication Guide](../../02-auth/AUTHENTICATION.md)
- [Authorization Guide](../../02-auth/AUTHORIZATION.md)
- [Error Handling Guide](../../02-auth/ERROR_HANDLING.md)
- [Frontend Integration Guide](../../04-integration/FRONTEND_INTEGRATION.md)
- [Database Schema Document](../../05-database/DATABASE_SCHEMA.md)
