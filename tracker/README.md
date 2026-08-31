# 🧭 SKILLEZO AI — In-Codebase Development Tracking Hub

> **Single Source of Truth for Sprint Execution, Task Management & Delivery**  
> **Workspace:** `SKILLEZO.AI/tracker`  
> **Active Milestone:** `M1 — Core Integration & Testing`  
> **Execution Window:** September 01, 2026 → September 25, 2026  

---

## 📂 Quick Navigation Directory

| Document | Purpose | Primary Audience |
| :--- | :--- | :---: |
| **[STATUS_DASHBOARD.md](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/tracker/STATUS_DASHBOARD.md)** | High-level project health, completion metrics & milestone burn-down. | Project Owner / Lead |
| **[SPRINT_1_ACTIVE.md](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/tracker/SPRINT_1_ACTIVE.md)** | **Daily active execution plan** — exact step-by-step tasks to do **NEXT**. | All Developers |
| **[BACKEND_TASKS.md](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/tracker/BACKEND_TASKS.md)** | Developer 1 Backlog: AI services, ATS scoring, career plans, and security. | Developer 1 (Backend) |
| **[FRONTEND_TASKS.md](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/tracker/FRONTEND_TASKS.md)** | Developer 2 Backlog: Live API client services, UI wiring, and recruiter portal. | Developer 2 (Frontend) |
| **[BLOCKERS.md](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/tracker/BLOCKERS.md)** | Real-time blocker log, root causes, severity, and resolution actions. | All Developers |
| **[COMPLETED_LOG.md](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/tracker/COMPLETED_LOG.md)** | Verified completion archive with commit hashes and acceptance evidence. | All Developers |
| **[NOT_NOW_BACKLOG.md](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/tracker/NOT_NOW_BACKLOG.md)** | Parked post-MVP items to prevent scope creep during active sprints. | Product / Lead |

---

## 🛠️ How to Use This Tracking Hub

### 1. The Daily Developer Routine (3 Steps)
1. **Start of Day:** Open **[SPRINT_1_ACTIVE.md](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/tracker/SPRINT_1_ACTIVE.md)** to see your daily assigned task and target files.
2. **During Development:**
   - Mark your task status in your assigned file ([BACKEND_TASKS.md](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/tracker/BACKEND_TASKS.md) or [FRONTEND_TASKS.md](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/tracker/FRONTEND_TASKS.md)) as `[In Progress]`.
   - If blocked, log the blocker immediately in **[BLOCKERS.md](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/tracker/BLOCKERS.md)**.
3. **When Task is Finished:**
   - Run type checks (`npm run type-check` in `/server` and `npx tsc --noEmit` in `/client`).
   - Check off the task box (`- [x]`) in your task file.
   - Add a 1-line completion entry in **[COMPLETED_LOG.md](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/tracker/COMPLETED_LOG.md)** with the Git commit hash and tested endpoints.

---

## 🔒 Definition of Done (DoD)

A task is **NOT Done** merely because code was typed. A task is only marked `[x] Done` when:
1. **TypeScript Clean:** Zero compile errors (`tsc --noEmit`).
2. **End-to-End Verified:** Live data flows from UI → API Client → Controller → Service → MongoDB → UI State.
3. **No Mock Data Fallbacks in Production Paths:** The component renders real API responses.
4. **Error & Loading Handled:** Loading spinners, disable states, and toast failure notifications exist.
5. **Git Committed:** Clean commit pushed with descriptive message.

---

## 🚫 The "No Half-Complete Tasks" Rule

```text
Allowed Task States:
├── [ ] Todo          (Not yet started)
├── [🔄] In Progress  (Actively being coded today)
├── [x] Done          (100% complete, verified end-to-end, committed)
└── [⚠️] Blocked      (Cannot proceed; logged in BLOCKERS.md)
```

Never mark a partially connected UI or incomplete backend endpoint as `Done`. If only the backend is done, mark the backend sub-task done, but keep the integration task in progress until the UI renders live data.
