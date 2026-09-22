
#### 🔴 B. What NEEDS TO BE WORKED ON in the Recruiter Portal (Point-by-Point)
1. **[CRITICAL - Priority 1] Candidate Data Hydration Deficit in Backend:**
   - **File:** `server/src/modules/recruiter-application/recruiter-application.service.ts` (lines 125 & 208)
   - **Problem:** `getCompanyApplications` and `getCompanyApplicationDetails` return `candidate: { id: app.userId }` without populating candidate details.
   - **Fix Required:** Hydrate candidate data from `UserModel`, `ProfileModel`, and `VerificationModel` to return candidate `name`, `email`, `headline`, `employabilityScore`, and `verifiedSkills`. This eliminates dummy `"Candidate Applicant"` fallbacks and random client math scores.
2. **[CRITICAL - Priority 1] Dynamic Verified Credentials in Review Drawer:**
   - **File:** `client/components/recruiter/CandidateReviewDrawer.tsx` (lines 250–269)
   - **Problem:** Tab 2 ("Verified Credentials") currently hardcodes 3 static skills (`React 19 & Next.js 15`, etc.) for every candidate.
   - **Fix Required:** Replace static array with `details?.candidate?.verifiedSkills` mapping, rendering candidate's actual verified test score, proficiency badge, and SHA-256 certificate hash.
3. **[HIGH - Priority 2] Automated Candidate Notifications & Emails on Status Updates:**
   - **File:** `server/src/modules/recruiter-application/recruiter-application.service.ts` (`updateApplicationStatus`)
   - **Problem:** When a recruiter updates status (e.g. `applied` ➔ `shortlisted` / `interview`), status updates in DB, but candidate is never notified.
   - **Fix Required:** Create an in-app notification in `NotificationModel` and trigger an automated email (SendGrid/Resend) informing candidate that their status has progressed.
4. **[HIGH - Priority 2] Remove Mock Applicants Overwrite in Pipeline UI:**
   - **File:** `client/app/recruiter/applications/page.tsx` (lines 64–171)
   - **Problem:** When a recruiter has 0 applications in DB, it injects 5 hardcoded mock applicants (`Sarah Chen`, etc.).
   - **Fix Required:** Remove mock array fallback and render a clean empty state (`"No applications received for this job requisition yet."`) with a button to copy the job application link.
5. **[MEDIUM - Priority 3] Real Backend Talent Sourcing Endpoint:**
   - **File:** `client/app/recruiter/talent/page.tsx` & `server/src/modules/recruiter-application/`
   - **Problem:** `/recruiter/talent` reads from client mock data `getFallbackTalentPool()`, and "Invite to Apply" is a fake 600ms `setTimeout`.
   - **Fix Required:** Build `GET /api/recruiter/talent` endpoint in backend that queries real candidate profiles with verified skills and minimum scores from MongoDB.
6. **[MEDIUM - Priority 3] Structured Interview Scheduling Fields in Drawer:**
   - **File:** `client/components/recruiter/CandidateReviewDrawer.tsx`
   - **Problem:** Advancing to `interview` stage only accepts a plain text note.
   - **Fix Required:** Add structured fields for interview date/time, timezone, and meeting link (Google Meet / Zoom) that get included in the candidate notification.

---

