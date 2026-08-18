# Phase 16 — Resume Management & Secure Storage (Implementation Plan)

## 1. Overview
Candidate users require a dedicated resume management system to upload, store, select defaults, and update or delete their resume documents (`.pdf`, `.doc`, `.docx`). This phase establishes secure candidate-level resume storage with file system persistence and database metadata management.

---

## 2. Key Components Implemented

### 2.1 Database Layer (`Resume.model.ts`, `ResumeRepository.ts`)
- Mongoose schema tracking `userId`, `fileUrl`, `fileName`, `mimeType`, `isDefault`, `status`, `uploadedAt`.
- Repository methods providing CRUD operations with candidate scope filtering (`userId`).

### 2.2 Business Logic Layer (`ResumeService.ts`)
- Multi-file handling with single-default flag enforcement.
- Automated fallback promotion when default resume is removed.
- Physical storage file unlinking upon deletion.

### 2.3 API Endpoint Layer (`resume.routes.ts`, `resume.controller.ts`)
- Endpoints guarded by Better Auth `requireAuth` middleware.
- Multer upload integration supporting 5MB size ceiling and document type whitelist.

---

## 3. Verification Plan
- Unit test suite coverage for upload, default toggle, download stream, and delete fallback.
- Integration tests using `supertest` for file uploads and authentication guard rails.
