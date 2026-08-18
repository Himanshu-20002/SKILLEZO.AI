# SKILLEZO Backend — Job Ingestion API Specification

> [!NOTE]
> **Status: IMPLEMENTED (Phase 14)**
> **Usage Notice**: INTERNAL / ADMIN INGESTION ENDPOINT. This endpoint is used for administrative job acquisition and is NOT a candidate-facing job search API.

## Overview
This API allows authorized administrators or internal services to acquire job listings from external providers (such as Jooble) and ingest them into SKILLEZO's MongoDB repository with automatic normalization and deduplication.

---

## Endpoints

### Ingest Jobs from External Provider
- **METHOD**: `POST`
- **URL**: `/api/job-ingestion/search`
- **Authentication**: Required (`Better Auth` session)
- **Authorization**: Admin / Authorized user
- **Request Body**:
  ```json
  {
    "provider": "jooble",
    "keywords": "software engineer",
    "location": "Delhi",
    "radius": "40",
    "page": 1,
    "limit": 20
  }
  ```
- **Validation Rules**:
  - `provider`: String, optional (Default: `"jooble"`)
  - `keywords`: String, optional (Default: `"software engineer"`)
  - `location`: String, optional (Default: `"Delhi"`)
  - `radius`: String, optional (Default: `"40"`)
  - `page`: Integer >= 1, optional (Default: `1`)
  - `limit`: Integer 1–100, optional (Default: `20`)

- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "provider": "jooble",
      "requested": 20,
      "received": 20,
      "created": 14,
      "updated": 6,
      "skipped": 0,
      "failed": 0
    }
  }
  ```

- **Error Responses**:
  - `400 Bad Request` (`INVALID_JOB_PROVIDER`): Provider not registered.
  - `401 Unauthorized` (`UNAUTHORIZED`): Missing or invalid session.
  - `403 Forbidden` (`JOOBLE_API_KEY_INVALID`): Jooble API key is missing or invalid on server.
  - `500 Internal Server Error` (`JOB_SOURCE_INVALID_RESPONSE`): External payload failed runtime validation.
  - `503 Service Unavailable` (`JOB_SOURCE_UNAVAILABLE`): Network or upstream provider error.
  - `504 Gateway Timeout` (`JOB_SOURCE_TIMEOUT`): Upstream provider request exceeded 10-second timeout.
