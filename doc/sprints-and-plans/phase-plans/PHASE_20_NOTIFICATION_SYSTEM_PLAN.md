# Phase 20 — Notification System (Soft MVP Implementation Plan)

---

## 1. Executive Summary & Sprint Scope

**Sprint:** 4  
**Phase:** 20  
**Status:** 🟢 COMPLETED  
**Primary Goal:** Build and launch the **Soft MVP Notification System** for SKILLEZO.AI — delivering a dependable, zero-fat, multi-channel notification engine (In-App Feed + Transactional Email) connecting Candidates, Recruiters, and Administrators.

### Strict MVP Boundaries
- **IN SCOPE:**
  - Single MongoDB collection: `NotificationModel` with compound indexing.
  - Direct asynchronous service calls for event triggers (Job ingestion, Recruiter status update, Admin broadcast).
  - Lightweight client-side sync (REST polling on page load, tab focus, and 60-second heartbeat interval).
  - Hydration of existing frontend shells: [NotificationDropdown.tsx](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/components/layout/NotificationDropdown.tsx) and [page.tsx](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/app/dashboard/notifications/page.tsx).
  - Transactional status emails using existing [email.service.ts](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/core/email/email.service.ts) (Resend).
  - Admin in-app broadcast announcement modal in [client/app/admin/dashboard/page.tsx](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/app/admin/dashboard/page.tsx).
- **DEFERRED TO POST-MVP:**
  - Browser Web Push API (Service Worker `sw.js`, VAPID key lifecycle, `PushSubscriptionModel`).
  - Persistent Server-Sent Events (SSE) / WebSocket streams.
  - Granular notification frequency matrices & daily digest cron schedulers.
  - Decoupled Redis Pub/Sub / BullMQ queue workers.

---

## 2. Architecture & Codebase Touchpoints

```
SKILLEZO.AI Codebase
├── server/
│   ├── src/database/
│   │   ├── models/Notification.model.ts                  <-- [NEW] Core Mongoose model
│   │   └── repositories/notification/
│   │       ├── NotificationRepository.ts                <-- [NEW] DB queries, indexes, pagination
│   │       └── index.ts                                 <-- [NEW] Export
│   ├── src/modules/
│   │   ├── notifications/                               <-- [NEW MODULE]
│   │   │   ├── notification.dto.ts                      <-- [NEW] Zod validators
│   │   │   ├── notification.service.ts                  <-- [NEW] Business logic & triggers
│   │   │   ├── notification.controller.ts               <-- [NEW] Request handler
│   │   │   ├── notification.routes.ts                   <-- [NEW] Express router
│   │   │   ├── notification.test.ts                     <-- [NEW] Vitest integration tests
│   │   │   └── index.ts                                 <-- [NEW] Public exports
│   │   ├── recruiter-application/
│   │   │   └── recruiter-application.service.ts         <-- [HOOK] Dispatch alert on status update
│   │   ├── job-ingestion/
│   │   │   └── job-ingestion.service.ts                 <-- [HOOK] Dispatch alert for matching jobs
│   │   ├── jobs/
│   │   │   └── jobs.service.ts                          <-- [HOOK] Dispatch alert on recruiter job post
│   │   └── admin/
│   │       └── admin.routes.ts                          <-- [HOOK] Mount broadcast announcement route
│   └── src/server.ts                                    <-- [REGISTER] Mount /api/notifications
└── client/
    ├── services/
    │   └── notification.service.ts                      <-- [NEW] Client API SDK
    ├── components/layout/
    │   └── NotificationDropdown.tsx                     <-- [HYDRATE] Live unread count & dropdown
    ├── app/dashboard/notifications/
    │   └── page.tsx                                     <-- [HYDRATE] Paginated feed, filter, mark all
    └── app/admin/dashboard/
        └── page.tsx                                     <-- [HYDRATE] Broadcast announcement form
```

---

## 3. Step-by-Step Implementation Breakdown

### Step 1: Database & Repository Layer

#### 1.1 Create `Notification.model.ts`
- File: `server/src/database/models/Notification.model.ts`
- Fields:
  - `_id`: String (UUID or ObjectId)
  - `userId`: String (Target user ID or `"all"` for global announcements, indexed)
  - `category`: Enum (`job_alert`, `application`, `verification`, `system`)
  - `priority`: Enum (`normal`, `high`, `urgent`, default: `normal`)
  - `title`: String (required, trimmed)
  - `message`: String (required, trimmed)
  - `actionUrl`: String (optional, e.g. `/dashboard/job-center?jobId=123`)
  - `actionLabel`: String (optional, e.g. "View Job Match")
  - `metadata`: Mixed object (e.g. `{ jobId, applicationId, matchScore }`)
  - `read`: Boolean (default: `false`, indexed)
  - `readAt`: Date (optional)
  - `emailSent`: Boolean (default: `false`)
  - `timestamps`: `createdAt`, `updatedAt`
- Compound Indexes:
  - `{ userId: 1, read: 1, createdAt: -1 }` (for high-speed unread badge & user feed)
  - `{ createdAt: -1 }`

#### 1.2 Create `NotificationRepository.ts`
- File: `server/src/database/repositories/notification/NotificationRepository.ts`
- Methods:
  - `create(data: Partial<INotification>): Promise<INotification>`
  - `createMany(dataList: Partial<INotification>[]): Promise<number>`
  - `findByUserId(userId: string, options: { page: number; limit: number; category?: string; unreadOnly?: boolean }): Promise<{ notifications: INotification[]; total: number; unreadCount: number }>`
  - `getUnreadCount(userId: string): Promise<number>`
  - `markAsRead(id: string, userId: string): Promise<INotification | null>`
  - `markAllAsRead(userId: string): Promise<number>`

---

### Step 2: Service & Business Logic Layer

#### 2.1 Create `NotificationService.ts`
- File: `server/src/modules/notifications/notification.service.ts`
- Core Capabilities:
  - **User Feed Operations**:
    - `getUserNotifications(userId, query)`: Handles pagination, optional category filter, and returns paginated list + unread count.
    - `getUnreadCount(userId)`: Fast query returning `{ unreadCount: number }`.
    - `markAsRead(id, userId)`: Verifies ownership and updates `read: true`, `readAt: new Date()`.
    - `markAllAsRead(userId)`: Batch updates all unread notifications for `userId`.
  - **Automated Trigger: Application Status Changed**:
    - `notifyApplicationStatusChange(candidateUserId, jobTitle, companyName, newStatus, applicationId)`:
      - Inserts in-app notification with `category: "application"`, `actionUrl: "/dashboard/applications"`.
      - Dispatches branded transactional email to candidate using existing [email.service.ts](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/core/email/email.service.ts).
  - **Automated Trigger: Job Match Alert**:
    - `notifyJobMatches(jobId, jobTitle, companyName, requiredSkills)`:
      - Queries candidates whose `ProfileModel` skills match the required skills ($\ge 70\%$ overlap) or whose target role matches the job title.
      - Enforces an anti-spam throttle (maximum 3 job match notifications per candidate per 24 hours).
      - Inserts in-app notification with `category: "job_alert"`, `actionUrl: "/dashboard/job-center?jobId=..."`.
  - **Admin Trigger: Broadcast Announcement**:
    - `broadcastAnnouncement(adminUserId, title, message, targetRole, actionUrl)`:
      - Finds target user IDs based on role (`all`, `candidate`, `recruiter`).
      - Bulk inserts `Notification` documents for all target recipients.

---

### Step 3: Controller, DTOs & API Routes

#### 3.1 Create DTOs & Validation
- File: `server/src/modules/notifications/notification.dto.ts`
- Zod schemas:
  - `GetNotificationsQuerySchema`: `page` (default 1), `limit` (default 10, max 50), `category` (optional enum), `unreadOnly` (boolean).
  - `BroadcastNotificationSchema`: `title` (min 3, max 100), `message` (min 5, max 500), `targetRole` (enum: `all`, `candidate`, `recruiter`), `actionUrl` (optional string).

#### 3.2 Create Controller & Router
- Controller: `server/src/modules/notifications/notification.controller.ts`
- Router: `server/src/modules/notifications/notification.routes.ts`
- Routes:
  - `GET /api/notifications` (Protected: session user)
  - `GET /api/notifications/unread-count` (Protected: session user)
  - `PATCH /api/notifications/:id/read` (Protected: session user)
  - `PATCH /api/notifications/read-all` (Protected: session user)
  - `POST /api/admin/notifications/broadcast` (Protected: admin role)
- Mount in `server/src/server.ts`:
  ```typescript
  import { notificationRouter } from "@/modules/notifications";
  app.use("/api/notifications", notificationRouter);
  ```

---

### Step 4: Automated Trigger Hooks

#### 4.1 Application Status Update Hook
- File: `server/src/modules/recruiter-application/recruiter-application.service.ts`
- In `updateApplicationStatus(...)`:
  - After successfully saving the status transition, invoke:
    ```typescript
    await notificationService.notifyApplicationStatusChange({
      candidateUserId: application.userId,
      jobTitle: job.title,
      companyName: company.name,
      newStatus: dto.status,
      applicationId: application._id.toString(),
    }).catch(err => console.error("[Notification] Failed to send status notification:", err));
    ```

#### 4.2 Job Ingestion & Creation Hook
- Files:
  - `server/src/modules/job-ingestion/job-ingestion.service.ts` (when `isNew: true`)
  - `server/src/modules/jobs/jobs.service.ts` (when recruiter creates a job)
- Invoke:
  ```typescript
  notificationService.notifyJobMatches({
    jobId: job._id.toString(),
    jobTitle: job.title,
    companyName: job.companyName,
    requiredSkills: job.skills || [],
  }).catch(err => console.error("[Notification] Job match notification failed:", err));
  ```

---

### Step 5: Frontend Hydration (Zero New Mock UI)

#### 5.1 Client API Service
- File: `client/services/notification.service.ts`
- Methods:
  - `getNotifications(params)` -> calls `GET /api/notifications`
  - `getUnreadCount()` -> calls `GET /api/notifications/unread-count`
  - `markAsRead(id)` -> calls `PATCH /api/notifications/${id}/read`
  - `markAllAsRead()` -> calls `PATCH /api/notifications/read-all`
  - `broadcastAnnouncement(payload)` -> calls `POST /api/admin/notifications/broadcast`

#### 5.2 Hydrate Topbar Dropdown
- File: [client/components/layout/NotificationDropdown.tsx](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/components/layout/NotificationDropdown.tsx)
- Replaces static items state with live API calls:
  - Fetches unread badge count on mount and on window focus.
  - Fetches latest 5 notifications when bell is clicked.
  - Clicking item updates read status and opens target URL.
  - "Mark all as read" button clears unread badge instantly.

#### 5.3 Hydrate Notification Center Page
- File: [client/app/dashboard/notifications/page.tsx](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/app/dashboard/notifications/page.tsx)
- Connects search query and category filters to server-side or local filtered state.
- Wire "Mark all as read" button to `notificationService.markAllAsRead()` with Sonner toast feedback.

#### 5.4 Admin Broadcast Modal
- File: [client/app/admin/dashboard/page.tsx](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/app/admin/dashboard/page.tsx)
- Adds a clean **"Send Announcement"** action button in the Admin Header.
- Opens a modal to input Title, Message, and Target Audience (`All`, `Candidates`, `Recruiters`).
- Calls `notificationService.broadcastAnnouncement()`.

---

### Step 6: Automated Testing & Verification

1. **Backend Integration Tests**:
   - File: `server/src/modules/notifications/notification.test.ts`
   - Test Cases:
     - `GET /api/notifications` returns 200 with paginated user notifications.
     - `GET /api/notifications/unread-count` returns accurate count.
     - `PATCH /api/notifications/:id/read` marks specific notification as read.
     - `PATCH /api/notifications/read-all` resets unread count to 0.
     - Recruiter status transition dispatches notification and email.
     - Admin broadcast dispatches notifications to target audience.
2. **Client Validation**:
   - Run `npm run type-check` (or `vitest run`) across client and server to verify zero TypeScript errors.

---

## 4. Acceptance Criteria & Definition of Done
 
- [x] **Data Model:** `NotificationModel` created with indexed queries.
- [x] **Endpoints Live:** `/api/notifications`, `/api/notifications/unread-count`, `/api/notifications/:id/read`, `/api/notifications/read-all` all respond with standard `{ success: true, data: ... }` payloads.
- [x] **Live Bell Badge:** Topbar bell displays accurate unread badge count for authenticated candidates and recruiters.
- [x] **Dropdown & Center Hydrated:** Clicking notifications marks them as read and navigates to the target page.
- [x] **Automated Triggers:**
  - Status change by recruiter triggers in-app notification + Resend email to candidate.
  - New job triggers in-app notification for matching candidates.
- [x] **Admin Broadcast:** Admin can broadcast platform announcements to all candidates or recruiters.
- [x] **Zero Regressions:** All existing Vitest test suites remain green.
