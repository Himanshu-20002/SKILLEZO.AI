# 📋 Implementation Plan: Admin Monetization & Dynamic Quota Control Engine

**Document:** `doc/ai-mock-interview-coach/13_ADMIN_MONETIZATION_AND_DYNAMIC_QUOTA_PLAN.md`  
**Date:** Wednesday, November 18, 2026  
**System Stack:** Next.js 16 (App Router) + React 19 + Express 5 + MongoDB Mongoose 9 + Vitest + Tailwind CSS + Better Auth (`requireRole([UserRole.ADMIN])`)  
**Prerequisites:**  
- Strategic framework defined in `doc/SKILLEZO_REVENUE_MONETIZATION_AND_TIER_STRATEGY.md`  
- Candidate Readiness Report dashboard completed and verified in `doc/ai-mock-interview-coach/12_CANDIDATE_READINESS_REPORT_AND_EVALUATION_DASHBOARD_PLAN.md`  
- Existing `Subscription.model.ts` and `billing.service.ts` modules.

---

## 🎯 Executive Overview & Goals

Following client sign-off on the **Skillezo Revenue & Monetization Strategy**, the platform requires an **Admin Monetization & Dynamic Quota Control Engine**.

Currently, pricing plans (e.g. ₹399/mo) and free allowances are hardcoded into server constants (`billing.constants.ts` and `plan.constants.ts`). Modifying subscription prices, adjusting free interview session limits, or toggling paywalls requires developer intervention, code edits, and application redeployment.

### Core Objectives:
1. **Zero-Redeployment Admin Control:** Empower administrators to adjust free tier quotas, package pricing (Sprint Pass ₹199, Pro Monthly ₹499, Pro Annual ₹3,999), and feature paywalls directly from a dedicated `/admin/dashboard?tab=monetization` panel.
2. **Deterministic Fallbacks & High Availability:** Ensure the system boots with robust in-memory defaults if no database config exists, guaranteeing zero downtime or runtime crashes.
3. **High-Converting Candidate Paywall Teasers:** Seamlessly gate premium features—specifically the **AI Senior Engineer Model Answers** on `/dashboard/interview-coach/report/[sessionId]`—with a frosted glass teaser and instant upgrade CTA.
4. **Transparent Candidate Quota Tracking:** Provide candidates with a live, real-time allowance badge on `/dashboard/interview-coach` indicating remaining free sessions for the calendar month.
5. **Zero Breaking Changes:** Maintain 100% test pass rate across existing client suites (214/214 tests passing) and backend suites.

---

## 🏗️ Architectural Blueprint & Data Flow

```
                                  ┌──────────────────────────────┐
                                  │      ADMINISTRATOR           │
                                  │   /admin/dashboard?tab=...   │
                                  └──────────────┬───────────────┘
                                                 │
                                                 ▼
                                     PUT /api/admin/monetization
                                  (Zod Validated, requireRole: ADMIN)
                                                 │
                                                 ▼
                                  ┌──────────────────────────────┐
                                  │   MonetizationConfig.model   │
                                  │    (MongoDB Singleton doc)   │
                                  └──────────────┬───────────────┘
                                                 │
                                        Cached in Server Memory (TTL: 60s)
                                                 │
                    ┌────────────────────────────┴───────────────────────────┐
                    ▼                                                        ▼
    ┌──────────────────────────────┐                         ┌──────────────────────────────┐
    │  CANDIDATE INTERVIEW ENGINE  │                         │   CANDIDATE REPORT DASHBOARD │
    │ POST /api/interviews/sessions│                         │ /report/[id] (Model Answers) │
    ├──────────────────────────────┤                         ├──────────────────────────────┤
    │ - Checks monthly session cnt │                         │ - Checks user.tier === PRO   │
    │ - Free candidate > limit?    │                         │ - Free: Blurs model answer   │
    │ - HTTP 403: QUOTA_EXHAUSTED  │                         │ - Renders "Unlock with Pro"  │
    └──────────────────────────────┘                         └──────────────────────────────┘
```

---

## 📦 Phase-by-Phase Technical Implementation

### Phase 1: Database Model & In-Memory Config Cache
**Goal:** Create a robust, singleton Mongoose model with automatic defaults and safe cached retrieval.

1. **File:** `server/src/database/models/MonetizationConfig.model.ts`
   - **Schema Definition:**
     ```typescript
     interface IMonetizationConfig {
       isSingleton: boolean; // Enforce single document (unique constraint)
       
       // B2C Candidate Pricing (in Rupees and Paise)
       pricing: {
         sprintPass7Day: {
           amountInRupees: number;    // Default: 199
           amountInPaise: number;     // 19900
           isActive: boolean;         // Default: true
         };
         proMonthly: {
           amountInRupees: number;    // Default: 499
           amountInPaise: number;     // 49900
           isActive: boolean;         // Default: true
         };
         proYearly: {
           amountInRupees: number;    // Default: 3999
           amountInPaise: number;     // 399900
           isActive: boolean;         // Default: true
         };
       };

       // Mock Interview Engine Quotas
       interviewQuotas: {
         freeMonthlySessions: number;     // Default: 1
         freeMaxQuestionsPerSession: number; // Default: 5
         freeMaxAnswerSeconds: number;    // Default: 180 (3 min)
         lockModelAnswersForFree: boolean;// Default: true
         enableVoiceForFree: boolean;     // Default: true
         enableVideoForFree: boolean;     // Default: true
       };

       // Resume Studio & ATS Quotas
       resumeQuotas: {
         freeMaxResumes: number;          // Default: 1
         freeMonthlyAtsScans: number;     // Default: 2
         lockDocxExportForFree: boolean;  // Default: true
         lockCoverLetterAiForFree: boolean;// Default: true
       };

       // Global Controls & Alerts
       globalSettings: {
         promoBannerActive: boolean;      // Default: false
         promoBannerText: string;         // e.g. "🎉 Placement Sprint: Get 7 Days Pro for ₹199"
         updatedByAdminEmail?: string;
       };
     }
     ```
   - **Singleton Helper Function (`getMonetizationConfig()`):**
     - Queries `MonetizationConfigModel.findOne({ isSingleton: true })`.
     - If null, seeds and returns the default configuration document.
     - Caches result in Node.js memory for 60 seconds to prevent DB saturation.

---

### Phase 2: Admin REST Endpoints & Validation
**Goal:** Expose secure, validated administrative APIs to read and update monetization configurations.

1. **Validation Schema:** `server/src/modules/admin/validation/monetization.schemas.ts`
   - Validates incoming `PUT` payloads using Zod:
     - Numerical checks (positive integers, reasonable minimums and maximums).
     - Text sanitization for promotional banners.
2. **Controller:** `server/src/modules/admin/controllers/admin.monetization.controller.ts`
   - `getMonetizationConfig`: Returns the complete admin configuration.
   - `updateMonetizationConfig`: Validates and atomically updates the singleton document, purging the in-memory cache.
   - `resetMonetizationConfig`: Restores default strategy values (₹199 sprint, ₹499 pro, 1 free interview).
3. **Public Client Endpoint:** `server/src/modules/interview-coach/controllers/interview.controller.ts`
   - `GET /api/interviews/config` (or `/api/monetization/public-config`)
   - Returns public quota allowances, pricing, and feature flags without exposing internal admin metadata.
4. **Route Registration:**
   - Mount routes in `server/src/modules/admin/admin.routes.ts`:
     - `router.get("/monetization-config", asyncHandler(AdminMonetizationController.getConfig));`
     - `router.put("/monetization-config", asyncHandler(AdminMonetizationController.updateConfig));`
     - `router.post("/monetization-config/reset", asyncHandler(AdminMonetizationController.resetConfig));`

---

### Phase 3: Backend Quota Enforcer & Candidate Paywall Teaser
**Goal:** Enforce monthly mock interview limits during session creation and introduce the frosted glass paywall teaser in the readiness report.

1. **Backend Quota Enforcement:** `server/src/modules/interview-coach/services/interview-session.service.ts`
   - In `createSession(userId, input)`:
     - Query user's current subscription tier from `SubscriptionModel`.
     - If user tier is `FREE`:
       - Count completed/active sessions created by `userId` within the current calendar month (`createdAt >= startOfMonth`).
       - Compare against `config.interviewQuotas.freeMonthlySessions`.
       - If user has reached or exceeded the quota:
         - Throw `AppError("Monthly free interview quota reached. Upgrade to Pro or activate a 7-Day Sprint Pass for unlimited practice.", HTTP_STATUS.FORBIDDEN, ERROR_CODES.QUOTA_EXHAUSTED)`.
       - Enforce `input.totalQuestions = Math.min(input.totalQuestions, config.interviewQuotas.freeMaxQuestionsPerSession)`.
2. **Candidate Paywall Teaser:** `client/components/dashboard/interview-coach/report/QuestionBreakdownAccordion.tsx`
   - In the accordion view:
     - Inspect candidate's tier (`isPro`).
     - If `lockModelAnswersForFree === true` and candidate is `FREE`:
       - Render the "Senior Engineer Model Answer" box with CSS frosted blur (`backdrop-blur-md select-none pointer-events-none`).
       - Display a high-conversion overlay card:
         - 💎 **"Senior Model Answer Locked"**
         - *"See how Staff/Principal Engineers answer this question with battle-tested architectural trade-offs."*
         - Primary CTA Button: **"Unlock with Pro (₹499/mo)"** or **"Get 7-Day Sprint Pass (₹199)"**.
         - Navigates seamlessly to `/dashboard/billing` or opens the pricing modal.

---

### Phase 4: Admin Control Dashboard UI & Candidate Quota Widget
**Goal:** Build a responsive, user-friendly control dashboard for administrators and a transparent quota status indicator for candidates.

1. **Admin Monetization Panel Component:**
   - File: `client/components/dashboard/admin/AdminMonetizationPanel.tsx`
   - **UI Sections:**
     - 💳 **Pricing & Plans Configuration:**
       - Sprint Pass (7 Days): Number input in ₹ (default 199) + Active toggle.
       - Pro Monthly: Number input in ₹ (default 499) + Active toggle.
       - Pro Annual: Number input in ₹ (default 3,999) + Active toggle.
     - 🎙️ **Mock Interview Coach Limits:**
       - Free Sessions per Month: Stepper/Slider (0 to 10, default 1).
       - Max Questions per Free Session: Stepper/Slider (3 to 10, default 5).
       - Lock Senior Model Answers: Switch toggle (Enabled/Disabled).
       - Audio/Video Access: Switch toggles for Free tier.
     - 📄 **Resume Studio & ATS Limits:**
       - Free Resumes Allowed: Stepper (1 to 5, default 1).
       - Free Monthly ATS Scans: Stepper (1 to 10, default 2).
       - Lock Word/DOCX Export: Switch toggle.
     - 📢 **Promotional Banner:**
       - Show top banner toggle + custom banner text input.
     - ⚡ **Action Bar:**
       - "Save Configuration" button with loading spinner and instant success toast.
       - "Reset to Strategic Defaults" button with confirmation modal.
2. **Admin Dashboard Integration:**
   - File: `client/app/admin/dashboard/page.tsx`
   - Add `'monetization'` to `AdminTab` type:
     ```typescript
     type AdminTab = 'overview' | 'users' | 'jobs' | 'resumes' | 'learning-hub' | 'roles' | 'monetization';
     ```
   - Add navigation tab with `CreditCard` icon.
   - Render `<AdminMonetizationPanel />` when `activeTab === 'monetization'`.
3. **Candidate Quota Allowance Pill:**
   - File: `client/app/dashboard/interview-coach/page.tsx`
   - Add an allowance pill beside the "New Interview" header button:
     - 🟢 Free Tier: *"1 of 1 Free Practice Session Remaining this Month • Upgrade"*
     - 🔴 Quota Exhausted: *"Free monthly practice limit reached • Upgrade to Pro"*
     - 👑 Pro Tier: *"👑 Pro Member: Unlimited AI Practice Sessions"*

---

## 🧪 Testing & Verification Matrix

| Area | Test File / Suite | Validation Criteria |
| :--- | :--- | :--- |
| **Monetization Model** | `server/src/tests/monetization-config.spec.ts` | Verify singleton constraint, default seeding, and in-memory cache invalidation. |
| **Admin API Routes** | `server/src/tests/admin-monetization.routes.spec.ts` | Verify `GET`, `PUT`, and `POST /reset` require `ADMIN` role; verify Zod rejects negative prices or invalid quotas. |
| **Quota Enforcement** | `server/src/tests/interview-session.quota.spec.ts` | Verify `createSession` allows free user up to limit, rejects with `403` on exceeding limit, and exempts `PRO` users. |
| **Report Paywall Teaser** | `client/tests/interview-coach-report.spec.tsx` | Verify free users see blurred model answer with upgrade CTA; verify Pro users see plain unobstructed model answer text. |
| **Admin Panel UI** | `client/tests/admin-monetization-panel.spec.tsx` | Verify inputs render correct initial values, sliders update state, and save button triggers API with proper payload. |

---

## 📅 Execution Roadmap

- [ ] **Phase 1: DB Schema & Service Cache**
  - Create `server/src/database/models/MonetizationConfig.model.ts`
  - Implement default config seeder and 60-second in-memory cache
- [ ] **Phase 2: Admin Controller & REST Endpoints**
  - Create Zod validation schema `monetization.schemas.ts`
  - Implement `admin.monetization.controller.ts`
  - Mount routes in `admin.routes.ts`
  - Add public config read endpoint `GET /api/interviews/config`
- [ ] **Phase 3: Backend Quota Enforcer & Paywall Teaser**
  - Inject monthly quota check into `interview-session.service.ts`
  - Implement frosted glass paywall teaser in `QuestionBreakdownAccordion.tsx`
- [ ] **Phase 4: Admin UI Panel & Candidate Quota Widget**
  - Build `AdminMonetizationPanel.tsx`
  - Integrate tab into `client/app/admin/dashboard/page.tsx`
  - Add candidate quota allowance indicator to `client/app/dashboard/interview-coach/page.tsx`
- [ ] **Phase 5: Automated Testing & Verification**
  - Run server unit & integration tests
  - Run client Vitest suite (`pnpm test` in `client/`)
  - Verify zero regressions across all 214 existing tests
