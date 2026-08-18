SKILLEZO AI — Phase 4 (Remaining Auth Routes & Dashboard Placeholder) Plan
This implementation plan details Phase 4, completing all remaining authentication module pages (forgot-password, reset-password, verify-email, account-suspended) and the Dashboard Placeholder (dashboard). All routes reuse the Module 1 design system (AuthLayout, BrandSection, AuthCard, AuthHeader, PasswordInput, LoadingSpinner, GlassCard, BrandLogo) with React Hook Form + Zod client-side validation.

User Review Required
IMPORTANT

Step-by-step Approval Protocol: We will implement and verify Phase 4 step-by-step with user confirmation between modules:

Module 4: Forgot Password Page (app/forgot-password/)
Module 5: Reset Password Page (app/reset-password/)
Module 6: Verify Email Page (app/verify-email/)
Module 7: Account Suspended Page (app/account-suspended/)
Module 8: Dashboard Placeholder (app/dashboard/)
Proposed File Breakdown
Module 4: Forgot Password Page (app/forgot-password/)
[NEW] 
page.tsx
Email input with Zod validation. Submit triggers LoadingSpinner state and toggles to an inline success state card confirming password reset email dispatch with a "Back to Login" action button.
Module 5: Reset Password Page (app/reset-password/)
[NEW] 
page.tsx
New Password and Confirm Password fields reusing PasswordInput with Zod password strength validation. Displays inline success state card on submit with action button navigating back to /login.
Module 6: Verify Email Page (app/verify-email/)
[NEW] 
page.tsx
Email verification screen displaying confirmation notice, animated mail badge, simulated 60s resend timer option, and "Continue to Login" button.
Module 7: Account Suspended Page (app/account-suspended/)
[NEW] 
page.tsx
Security notice card informing suspended account status with "Contact Support" button (triggers Sonner support toast).
Module 8: Dashboard Placeholder (app/dashboard/)
[NEW] 
page.tsx
Modern enterprise dashboard layout shell featuring left navigation Sidebar (Skill Verification, Assessments, Career Pathways, Settings), Topbar with search bar, notifications & user profile badge, Welcome Banner Card, and 4 metric statistic cards.
Verification Plan
Automated Checks
npx tsc --noEmit inside client/ to verify zero TypeScript errors across all routes.
Manual Verification
Verify /forgot-password email validation & success state transition.
Verify /reset-password strength validation & success state transition.
Verify /verify-email layout & navigation action.
Verify /account-suspended support action.
Verify /dashboard responsive layout, sidebar toggle, and stat cards.
