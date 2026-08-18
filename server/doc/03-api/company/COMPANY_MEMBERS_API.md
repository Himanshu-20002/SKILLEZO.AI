# SKILLEZO Backend — Company Members API Specification

> [!NOTE]
> **Status: IMPLEMENTED (Phase 13)**

## Overview
This API provides full management of company members, role assignments (`OWNER`, `ADMIN`, `RECRUITER`, `VIEWER`), status tracking (`ACTIVE`, `INVITED`, `SUSPENDED`, `REMOVED`), member listing, and member removal.

---

## Endpoints

### 1. Get My Company Memberships
- **METHOD**: `GET`
- **URL**: `/api/company-members/me`
- **Authentication**: Required (`Better Auth` session cookie/header)
- **Authorization**: Any authenticated user
- **Request Params**: None
- **Request Body**: None
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "66b1a23456789abcdef01234",
        "userId": "user_better_auth_123",
        "companyId": "66a1a23456789abcdef01234",
        "role": "owner",
        "status": "active",
        "invitedBy": null,
        "joinedAt": "2026-08-12T10:00:00.000Z",
        "createdAt": "2026-08-12T10:00:00.000Z",
        "updatedAt": "2026-08-12T10:00:00.000Z"
      }
    ]
  }
  ```

---

### 2. List Company Members
- **METHOD**: `GET`
- **URL**: `/api/companies/:companyId/members`
- **Authentication**: Required
- **Authorization**: Must be an active member of the specified company (`OWNER`, `ADMIN`, `RECRUITER`, or `VIEWER`)
- **Request Params**:
  - `companyId`: MongoDB ObjectId string
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "66b1a23456789abcdef01234",
        "userId": "user_better_auth_123",
        "companyId": "66a1a23456789abcdef01234",
        "role": "owner",
        "status": "active",
        "invitedBy": null,
        "joinedAt": "2026-08-12T10:00:00.000Z"
      }
    ]
  }
  ```
- **Error Responses**:
  - `403 Forbidden` (`COMPANY_MEMBERSHIP_REQUIRED`): User is not an active member of the company.
  - `404 Not Found` (`COMPANY_NOT_FOUND`): Company does not exist.

---

### 3. Get Company Member Detail
- **METHOD**: `GET`
- **URL**: `/api/companies/:companyId/members/:memberId`
- **Authentication**: Required
- **Authorization**: Active member of company
- **Request Params**:
  - `companyId`: MongoDB ObjectId
  - `memberId`: MongoDB ObjectId (CompanyMember `_id`)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "66b1a23456789abcdef01234",
      "userId": "user_better_auth_123",
      "companyId": "66a1a23456789abcdef01234",
      "role": "owner",
      "status": "active",
      "invitedBy": null,
      "joinedAt": "2026-08-12T10:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `404 Not Found` (`COMPANY_MEMBER_NOT_FOUND`)

---

### 4. Add / Invite Company Member
- **METHOD**: `POST`
- **URL**: `/api/companies/:companyId/members`
- **Authentication**: Required
- **Authorization**: `OWNER` or `ADMIN` of company
- **Request Body**:
  ```json
  {
    "userId": "user_target_456",
    "role": "recruiter",
    "status": "active"
  }
  ```
- **Validation Rules**:
  - `userId`: Non-empty string
  - `role`: One of `"owner"`, `"admin"`, `"recruiter"`, `"viewer"` (Default: `"recruiter"`)
  - `status`: One of `"invited"`, `"active"`, `"suspended"`, `"removed"` (Default: `"active"`)
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "66b1a987654321fedcba9876",
      "userId": "user_target_456",
      "companyId": "66a1a23456789abcdef01234",
      "role": "recruiter",
      "status": "active",
      "invitedBy": "user_better_auth_123",
      "joinedAt": "2026-08-12T11:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `403 Forbidden` (`COMPANY_PERMISSION_DENIED`): Caller is not `OWNER` or `ADMIN`, or non-owner tried to grant `owner` role.
  - `409 Conflict` (`DUPLICATE_COMPANY_MEMBERSHIP`): User is already a member of this company.

---

### 5. Update Member Role
- **METHOD**: `PATCH`
- **URL**: `/api/companies/:companyId/members/:memberId/role`
- **Authentication**: Required
- **Authorization**: `OWNER` only
- **Request Body**:
  ```json
  {
    "role": "admin"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "66b1a987654321fedcba9876",
      "role": "admin"
    }
  }
  ```
- **Error Responses**:
  - `403 Forbidden` (`COMPANY_PERMISSION_DENIED`): Non-owner attempted role update.
  - `403 Forbidden` (`CANNOT_MODIFY_OWNER`): Attempted to alter an `owner` role.

---

### 6. Update Member Status
- **METHOD**: `PATCH`
- **URL**: `/api/companies/:companyId/members/:memberId/status`
- **Authentication**: Required
- **Authorization**: `OWNER` or `ADMIN`
- **Request Body**:
  ```json
  {
    "status": "suspended"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "66b1a987654321fedcba9876",
      "status": "suspended"
    }
  }
  ```
- **Error Responses**:
  - `403 Forbidden` (`CANNOT_MODIFY_OWNER`): Attempted status update on an `owner`.
  - `403 Forbidden` (`COMPANY_PERMISSION_DENIED`): `ADMIN` attempted status update on another `ADMIN`.

---

### 7. Remove Member
- **METHOD**: `DELETE`
- **URL**: `/api/companies/:companyId/members/:memberId`
- **Authentication**: Required
- **Authorization**: `OWNER` or `ADMIN`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Company member removed successfully"
    }
  }
  ```
- **Error Responses**:
  - `403 Forbidden` (`CANNOT_MODIFY_OWNER`): Cannot remove company `owner`.
  - `404 Not Found` (`COMPANY_MEMBER_NOT_FOUND`)
