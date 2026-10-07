# 🎨 SKILLEZO AI — Frontend Implementation Status & UI Page Inventory

> **Path:** `client/`  
> **Framework:** Next.js 15.2 (App Router) + React 19 + TypeScript + Tailwind CSS + Lucide Icons  
> **Authentication:** Better Auth React Client with Auto-Bearer Injection  

---

## 📱 1. Application Pages & Real vs. Mock Status

```text
client/app/
├── (auth)/
│   ├── login/page.tsx                     🟢 100% Live (Better Auth Session + Cookie)
│   ├── register/page.tsx                  🟢 100% Live (Candidate & Recruiter Role Select)
│   └── forgot-password/page.tsx           🟢 Live Form Flow
│
├── dashboard/
│   ├── page.tsx                           🟢 Main Dashboard Overview
│   ├── job-center/page.tsx                🟢 100% Live (Connected to GET /api/jobs)
│   ├── resume-intelligence/page.tsx       🟢 100% Live (PDF Upload & Skill Viewer)
│   ├── profile/page.tsx                   🟢 100% Live (Candidate Profile & Better Auth User)
│   ├── settings/page.tsx                  🟢 100% Live (Account settings & Security)
│   ├── notifications/page.tsx             🟡 Interactive UI (Static alerts)
│   ├── career-gps/page.tsx                ⚪ Mock Data (Planned Sprint 3)
│   ├── skill-gap-analysis/page.tsx        ⚪ Mock Data (Planned Sprint 3)
│   ├── employability-index/page.tsx       ⚪ Mock Data (Planned Sprint 3)
│   ├── ai-career-coach/page.tsx           ⚪ Mock Data (Planned Sprint 4)
│   ├── career-profile/page.tsx            ⚪ Mock Data
│   ├── learning-hub/page.tsx              ⚪ Mock Data
│   ├── assessments/page.tsx               ⚪ Mock Data
│   ├── projects/page.tsx                  ⚪ Mock Data
│   ├── skill-verification/page.tsx        ⚪ Mock Data
│   ├── student-portal/page.tsx            ⚪ Mock Data
│   └── wallet/page.tsx                    ⚪ Mock Data
│
└── layout.tsx & page.tsx                  🟢 Root Landing Page & Responsive Navbar
```

---

## 🔌 2. Client Services & API Connectivity

Located in [`client/services/`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/client/services/):

### 1. `job.service.ts` (🟢 100% Live)
- **`searchJobs(params)`**: Queries `/api/v1/jobs` with search text, experience level, remote/onsite, salary, and page.
- **`getJobById(id)`**: Fetches complete job description and requirements.
- **`getJobStats()`**: Fetches total live jobs, companies, and categories.

### 2. `resume.service.ts` (🟢 100% Live)
- **`uploadResume(file)`**: Uploads PDF directly to `/api/v1/resumes/upload` using FormData and Bearer token.
- **`getMyResume()`**: Fetches the active candidate's parsed skills, education, and experience.

### 3. `profile.service.ts` (🟢 100% Live)
- **`getMyProfile()`**: Fetches profile data from `/api/v1/profile/me`.
- **`updateProfile(payload)`**: Updates headline, bio, skills, and social links.

### 4. `application.service.ts` (🟢 Ready for UI Modals)
- **`applyToJob(payload)`**: Submits candidate application to `/api/v1/applications`.
- **`getMyApplications()`**: Fetches application status history.

---

## 🔒 3. Authentication & Session Flow (`client/lib/auth-client.ts`)

```typescript
// Auto-attaches Bearer token from localStorage & handles cross-origin credentials
export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  fetchOptions: {
    credentials: "include",
    onRequest(context) {
      const token = localStorage.getItem("skillezo_token");
      if (token) context.headers.set("Authorization", `Bearer ${token}`);
    },
    onResponse(context) {
      // Automatically synchronizes session tokens
    }
  }
});
```

---

## 🚀 4. Immediate Next Steps on Frontend (Sprint 2 & 3)

1. **Job Application One-Click Modal** (`FE-206`):
   - Wire `application.service.ts` to Job Center cards so clicking "Apply Now" submits using the uploaded resume.
2. **AI Autopilot Widget** (`FE-301`):
   - Add the automatic application bot toggle and match percentage slider on `/dashboard/job-center`.
3. **Connect AI Skill Gap & Employability Dashboards** (`FE-401` to `FE-403`):
   - Replace mock radar charts with live calculations based on the candidate's uploaded resume skills.
