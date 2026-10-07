# Walkthrough: Scalable External Job Lifecycle Engine

The **Scalable External Job Lifecycle Engine** is implemented, verified, and active in production. It protects API quotas, keeps database searches blazing fast, eliminates stale/expired postings, and prevents dead ends for candidates.

---

## 🏗️ What Was Built

### 1. Controlled Background Cron Ingestion (`node-cron`)
* **File:** [`server/src/modules/job-ingestion/job-ingestion.cron.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/modules/job-ingestion/job-ingestion.cron.ts)
* **Schedule:** Registered in [`server.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/server.ts) to run automatically every 12 hours (`0 */12 * * *`).
* **Credit Control:** Rotates across 5 essential tracks (*Frontend React, Backend Node/Python, Full-Stack TypeScript, DevOps AWS, AI/ML*) with a max ceiling of **~10 API queries per day**.
* **Deduplication:** Automatic upsert on `{ sourceProvider, externalId }`.

---

### 2. Automatic 14-Day TTL & Stale Job Expiration
* **Files:** [`server/src/database/models/Job.model.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/database/models/Job.model.ts), [`server/src/database/repositories/job/JobRepository.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/database/repositories/job/JobRepository.ts)
* **Index:** `{ importedAt: 1 }` TTL index set to `expireAfterSeconds: 1209600` (14 days) filtered on `sourceType: "external"`.
* **Soft-Prune:** `JobRepository.cleanupStaleExternalJobs(14)` marks listings as `status: "closed"` so active searches remain fast (<10ms) and clean.
* **Direct Platform Protection:** Direct employer jobs are permanently exempt from TTL deletion.

---

### 3. Outbound Link Health Check & Auto-Closure (`/api/jobs/:id/redirect`)
* **Files:** [`server/src/modules/jobs/jobs.controller.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/modules/jobs/jobs.controller.ts), [`server/src/modules/jobs/jobs.routes.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/modules/jobs/jobs.routes.ts)
* **Probe:** Performs a fast (1.5s timeout) probe on external listing URLs when clicked.
* **Auto-Close:** If an external posting has 404'd or been deleted on Jooble, the server immediately sets `status: "closed"` in MongoDB so other candidates never see it.
* **Candidate UX:** If valid, immediately issues HTTP 302 redirect to the external board.

---

## 🧪 Verification Results

| Test | Method | Result | Evidence |
| :--- | :--- | :---: | :--- |
| **Server TypeScript Build** | `npm run build` | ✅ **Passed** | 0 errors (`tsc && tsc-alias`). |
| **Client TypeScript Check** | `npx tsc --noEmit` | ✅ **Passed** | 0 errors. |
| **MongoDB TTL Index** | Index sync & inspection | ✅ **Active** | `{"importedAt":1}` (TTL: 1209600s = 14 days). |
| **Redirect Endpoint** | `GET /api/jobs/:id/redirect` | ✅ **Verified** | HTTP 302 with direct destination header. |
| **Tracker Synchronization** | Git repository commit | ✅ **Pushed** | Marked `BE-109` Done in `tracker/BACKEND_TASKS.md` & `COMPLETED_LOG.md`. |
