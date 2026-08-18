# Phase 15 — Job Discovery & Search API (Frontend Integration Guide)

This document provides complete specification and integration instructions for frontend engineers connecting to the **Phase 15 — Job Discovery & Search API** on SKILLEZO AI.

---

## 1. Overview & Key Principles

- **Backend Route**: `/api/jobs`
- **Authentication**: **Public** (No `Authorization` header required for discovery endpoints).
- **Job Status Scope**: Automatically filtered to return **only active jobs** (`status: "active"`). Non-active jobs (`draft`, `closed`, `archived`) are hidden.
- **Data Model Unified Support**: Returns both **native platform jobs** (`sourceType: "platform"`) and **ingested external jobs** (`sourceType: "external"` e.g. Jooble).

---

## 2. API Endpoints

### 2.1 Search & Discover Jobs (`GET /api/jobs`)

Retrieves a paginated list of jobs based on filters, location, and keywords.

#### Query Parameters

| Parameter | Type | Required | Description / Allowed Values | Default |
|---|---|---|---|---|
| `keyword` | `string` | No | Search string across title, description, companyName, and rawLocation using MongoDB text search | - |
| `location` | `string` | No | Filter location (matches `location.city`, `state`, `country`, or `rawLocation`) | - |
| `sourceType` | `string` | No | `"platform"` \| `"external"` | - |
| `sourceProvider` | `string` | No | `"jooble"` \| `"adzuna"` \| `"greenhouse"` \| `"lever"` | - |
| `employmentType` | `string` | No | `"full_time"` \| `"part_time"` \| `"internship"` \| `"contract"` \| `"freelance"` | - |
| `workplaceType` | `string` | No | `"onsite"` \| `"hybrid"` \| `"remote"` | - |
| `companyId` | `string` | No | Valid MongoDB ObjectId string | - |
| `roleId` | `string` | No | Valid MongoDB ObjectId string | - |
| `page` | `number` | No | 1-indexed page number | `1` |
| `limit` | `number` | No | Number of records per page (Min: 1, Max: 50) | `20` |
| `sort` | `string` | No | `"newest"` \| `"oldest"` | `"newest"` |

#### Request Examples
```http
GET /api/jobs?keyword=Software%20Engineer&location=Delhi&page=1&limit=20
GET /api/jobs?employmentType=full_time&workplaceType=remote
GET /api/jobs?sourceType=external&sourceProvider=jooble
```

#### Response Payload (`200 OK`)
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "66bcbf99f123456789abcdef",
        "sourceType": "external",
        "sourceProvider": "jooble",
        "externalId": "jooble_123456",
        "sourceUrl": "https://in.jooble.org/desc/123456",
        "companyName": "Tech Solutions Inc.",
        "rawLocation": "Delhi, India",
        "rawSalary": "$80,000 - $100,000 / year",
        "sourceUpdatedAt": "2026-08-14T10:00:00.000Z",
        "importedAt": "2026-08-14T11:00:00.000Z",
        "companyId": null,
        "roleId": null,
        "createdBy": null,
        "title": "Senior Frontend Developer",
        "description": "<p>Looking for a React & Next.js engineer...</p>",
        "employmentType": "full_time",
        "workplaceType": "remote",
        "location": {
          "city": "Delhi",
          "state": "Delhi",
          "country": "India",
          "raw": "Delhi, India"
        },
        "requiredSkills": [
          {
            "name": "React",
            "requiredLevel": 4,
            "importance": "high",
            "minYearsOfExperience": 3
          }
        ],
        "minExperienceYears": 3,
        "salary": null,
        "status": "active",
        "createdAt": "2026-08-14T11:00:00.000Z",
        "updatedAt": "2026-08-14T11:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

---

### 2.2 Get Job Details (`GET /api/jobs/:jobId`)

Fetches detailed information for a single job posting by ID.

#### Request Example
```http
GET /api/jobs/66bcbf99f123456789abcdef
```

#### Response Payload (`200 OK`)
```json
{
  "success": true,
  "data": {
    "_id": "66bcbf99f123456789abcdef",
    "sourceType": "external",
    "sourceProvider": "jooble",
    "externalId": "jooble_123456",
    "sourceUrl": "https://in.jooble.org/desc/123456",
    "companyName": "Tech Solutions Inc.",
    "rawLocation": "Delhi, India",
    "rawSalary": "$80,000 - $100,000 / year",
    "title": "Senior Frontend Developer",
    "description": "Full job description text...",
    "employmentType": "full_time",
    "workplaceType": "remote",
    "status": "active",
    "createdAt": "2026-08-14T11:00:00.000Z",
    "updatedAt": "2026-08-14T11:00:00.000Z"
  }
}
```

---

## 3. Error Codes & Handling

All error responses strictly follow standard JSON payload structure:

```json
{
  "success": false,
  "error": {
    "code": "JOB_NOT_FOUND",
    "message": "Job not found or is currently unavailable"
  }
}
```

| HTTP Status | Error Code | Cause / Description |
|---|---|---|
| `400 Bad Request` | `VALIDATION_ERROR` | Invalid query param values, out-of-range pagination limit (>50), or malformed `jobId` parameter. |
| `404 Not Found` | `JOB_NOT_FOUND` | Specified `jobId` does not exist OR job status is not `active` (e.g. `draft`, `closed`). |
| `500 Internal Error` | `INTERNAL_SERVER_ERROR` | Unexpected backend database failure. |

---

## 4. Frontend TypeScript Types (Reference)

```typescript
export type JobSourceType = 'platform' | 'external';
export type JobSourceProvider = 'jooble' | 'adzuna' | 'greenhouse' | 'lever';
export type JobEmploymentType = 'full_time' | 'part_time' | 'internship' | 'contract' | 'freelance';
export type WorkplaceType = 'onsite' | 'hybrid' | 'remote';

export interface JobLocation {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  raw?: string | null;
}

export interface JobRequiredSkill {
  name: string;
  requiredLevel: number;
  importance: 'low' | 'medium' | 'high' | 'critical';
  minYearsOfExperience?: number | null;
}

export interface JobItem {
  _id: string;
  sourceType: JobSourceType;
  sourceProvider?: JobSourceProvider | null;
  externalId?: string | null;
  sourceUrl?: string | null;
  companyName?: string | null;
  rawLocation?: string | null;
  rawSalary?: string | null;
  sourceUpdatedAt?: string | null;
  importedAt?: string | null;
  companyId?: string | null;
  roleId?: string | null;
  createdBy?: string | null;
  title: string;
  description: string;
  employmentType?: JobEmploymentType | null;
  workplaceType?: WorkplaceType | null;
  location?: JobLocation | null;
  requiredSkills: JobRequiredSkill[];
  minExperienceYears: number;
  status: 'active';
  createdAt: string;
  updatedAt: string;
}

export interface JobPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedJobsResponse {
  success: boolean;
  data: {
    items: JobItem[];
    pagination: JobPaginationMeta;
  };
}
```
