# 🚨 SKILLEZO AI — Blocker Log & Resolution Tracker

> **Rule:** Log any blocker immediately. Do not wait.  
> **Severity Levels:**  
> - 🔴 **P0 (Critical / Blocker):** Completely stops development or testing.  
> - 🟡 **P1 (High / Risk):** Slows down a major feature; workaround exists temporarily.  
> - 🟢 **P2 (Medium / Low):** Non-blocking technical debt.  

---

## 📋 Active Blockers (Open)

| Blocker ID | Date Raised | Sev | Description | Affected Dev | Affected Tasks | Owner to Resolve | Action / Recommended Resolution | Status |
| :-: | :---: | :---: | :--- | :---: | :---: | :---: | :--- | :---: |
| **BLK-001** | 31-Aug | 🔴 P0 | Local Next.js rewrite proxy defaults to remote Railway URL because `BACKEND_INTERNAL_URL` is missing in `.env.local` | Dev 2 | `FE-201`, `FE-203` | Dev 2 | Add `BACKEND_INTERNAL_URL=http://localhost:5000` to `client/.env.local` and `.env.example`. | 🟡 Open |
| **BLK-002** | 31-Aug | 🟡 P1 | Job Center & Resume pages render static mock data instead of calling finished backend APIs | Dev 2 | `FE-202`–`FE-207` | Dev 2 | Create `job.service.ts`, `resume.service.ts`, `application.service.ts` in `client/services/`. | 🟡 Open |
| **BLK-003** | 31-Aug | 🟡 P1 | No automated `npm test` script in server `package.json` to verify API stability on commits | Dev 1 | `BE-101` | Dev 1 | Install Vitest + Supertest, configure `vitest.config.ts`, and add `npm test` script. | 🟡 Open |

---

## ✅ Resolved Blockers (Archive)

| Blocker ID | Date Resolved | Sev | Description | Resolved By | Notes / Commit Hash |
| :-: | :---: | :---: | :--- | :---: | :--- |
| *Example* | *29-Aug* | *P0* | *MongoDB SRV DNS resolution failure (querySrv ECONNREFUSED)* | *Dev 1* | *Configured public DNS resolvers (8.8.8.8) in `database/connection/db.ts` (Commit `deed491`)* |
| *Example* | *29-Aug* | *P0* | *Cross-origin cookie drop between Vercel and Railway* | *Dev 2* | *Configured Next.js rewrite proxy + Better Auth bearer plugin (Commit `d77d098`)* |
