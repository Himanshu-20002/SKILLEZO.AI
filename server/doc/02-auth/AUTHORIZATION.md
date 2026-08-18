# SKILLEZO Backend — Authorization Guide

This document defines the domain authorization model, membership roles, and security boundaries.

---

## 1. Authentication vs Authorization

* **Authentication ("Who are you?")**: Handled by Better Auth and `requireAuth` middleware. Ensures the requester has a valid active session.
* **Authorization ("What are you allowed to do?")**: Handled inside domain service layers (e.g., `CompanyService`) by inspecting user membership records (`CompanyMemberRepository`).

---

## 2. Company Member Authorization Model

When a user performs management operations on a company (e.g. `PATCH /api/companies/:companyId`), the service evaluates active memberships:

```
Incoming Request (PATCH /api/companies/:companyId)
   │
   ▼
requireAuth Middleware
   │ ──▶ Verifies req.user.id (String)
   ▼
CompanyService.updateCompany()
   │
   ├── Look up active membership in `company_members` collection
   │   `findActiveMembership(userId, companyId)`
   │
   ├── Verify Member Status == "active"
   │   (If missing or status != "active" ──▶ Throw 403 Forbidden)
   │
   └── Verify Member Role in ["owner", "admin"]
       (If role == "recruiter" or "viewer" ──▶ Throw 403 Forbidden)
```

---

## 3. Membership Roles & Permission Matrix

| Role (`CompanyMemberRole`) | View Public Profile | View Member Portal (`/me`) | Update Company Details | Manage Members (Phase 13) |
| :--- | :---: | :---: | :---: | :---: |
| **`OWNER`** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **`ADMIN`** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **`RECRUITER`** | ✅ Allowed | ✅ Allowed | ❌ Denied (`403`) | ❌ Denied (`403`) |
| **`VIEWER`** | ✅ Allowed | ✅ Allowed | ❌ Denied (`403`) | ❌ Denied (`403`) |
| **Non-Member / Suspended** | ✅ Allowed | ❌ Denied | ❌ Denied (`403`) | ❌ Denied (`403`) |

---

## 4. Forbidden Error Response (`403 Forbidden`)

When authorization fails, the backend returns:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Only company owners and admins are authorized to update company details",
    "details": null
  }
}
```

---

## 5. Security Responsibility Separation

* **Frontend UI Logic**: Used purely for UX conditional rendering (e.g., hiding an "Edit Company" button if the user is a `VIEWER`).
* **Backend Enforcement**: Evaluates authorization independently on every incoming API call. Never rely on frontend UI restrictions for security.
