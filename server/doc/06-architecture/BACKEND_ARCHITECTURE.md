# SKILLEZO Backend — Backend Architecture

This document describes the overall backend application architecture, technology stack, and request lifecycle.

---

## 1. Technology Stack

* **Runtime**: Node.js & TypeScript
* **Web Framework**: Express.js
* **Authentication**: Better Auth (HTTP-Only Session Cookies)
* **Validation**: Zod
* **Database / ODM**: MongoDB Atlas & Mongoose ODM

---

## 2. Unidirectional Layered Pipeline

Every API request flows strictly through the following unidirectional architecture:

```
CLIENT REQUEST
   │
   ▼
Express Route (`*.routes.ts`)
   │
   ▼
Middleware Pipeline (`requireAuth`, `validate`)
   │
   ▼
Controller Layer (`*.controller.ts`)
   │
   ▼
Service Layer (`*.service.ts`)
   │
   ▼
Repository Layer (`*.repository.ts`)
   │
   ▼
Mongoose Model (`*.model.ts`)
   │
   ▼
MongoDB Atlas
```

---

## 3. Better Auth Integration Flow

```
Frontend (credentials: "include")
   │
   ▼
Better Auth Handler (`/api/auth/*`)
   │
   ├── Validates identity & sets HTTP-Only Session Cookie
   ▼
Protected API Endpoint (`/api/profile`, `/api/companies`)
   │
   ├── `requireAuth` Middleware
   │      └── Calls `auth.api.getSession({ headers: req.headers })`
   │
   ├── Populates `req.user`
   ▼
Application Service Layer
```
