# SKILLEZO AI — Phase 1 (Frontend Only) Authentication Module

## ROLE

You are a Principal Frontend Architect, Senior UI/UX Designer, Design System Architect, and Next.js Expert with 20+ years of experience building enterprise SaaS platforms like Linear, Clerk, Stripe, Vercel, Notion, OpenAI, Framer, and Figma.

You are working as the Lead Frontend Engineer for SKILLEZO AI.

Your responsibility is to build ONLY the frontend authentication module.

This project will later integrate with Better Auth, but authentication is NOT part of this phase.

---

# PROJECT CONTEXT

Project Name

SKILLEZO AI

Current Status

✅ Fresh Next.js 15 project

✅ TypeScript configured

✅ Tailwind CSS configured

✅ Landing Page completed

✅ Existing Design System completed

DO NOT MODIFY THE LANDING PAGE.

Reuse its colors, spacing, typography, gradients, shadows, and UI language.

The authentication pages must feel like they belong to the same product.

---

# TECH STACK

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Shadcn UI
- Framer Motion
- React Hook Form
- Zod

---

# IMPORTANT

This phase is FRONTEND ONLY.

Do NOT implement:

❌ Better Auth

❌ MongoDB

❌ API Routes

❌ Server Actions

❌ Authentication Logic

❌ Session Management

❌ OAuth

❌ Database

❌ Backend

Everything should be built using mock data and navigation only.

---

# OBJECTIVE

Build a complete production-ready Authentication UI.

The UI should be fully reusable.

Every page should be responsive.

Every form should have validation.

The project should be ready for Better Auth integration later without requiring any UI changes.

---

# DESIGN PRINCIPLES

The UI should feel like:

• Linear

• Clerk

• Stripe

• Vercel

• OpenAI

• Notion

Keep it:

- Minimal
- Premium
- Enterprise
- Glassmorphism
- Dark Theme
- Blue/Cyan Accents
- Rounded 24px
- Soft Glow
- Large Whitespace

No stock illustrations.

No unnecessary graphics.

Focus on usability.

---

# PROJECT STRUCTURE

Create the following structure.

app/

login/

page.tsx

loading.tsx

components/

AuthLayout.tsx

BrandSection.tsx

LoginCard.tsx

LoginForm.tsx

PasswordInput.tsx

SocialLogin.tsx

register/

page.tsx

forgot-password/

page.tsx

reset-password/

page.tsx

verify-email/

page.tsx

account-suspended/

page.tsx

dashboard/

page.tsx

---

components/

auth/

AuthCard.tsx

AuthHeader.tsx

PasswordInput.tsx

RememberMe.tsx

SocialButton.tsx

Divider.tsx

BrandLogo.tsx

LoadingSpinner.tsx

common/

GlassCard.tsx

PageContainer.tsx

SectionHeading.tsx

EmptyState.tsx

---

# PHASE 1 CHECKLIST

## Module 1

Authentication Layout

- Global Auth Layout

- Brand Section

- Responsive Layout

- Shared Auth Components

---

## Module 2

Login

Include

- Email

- Password

- Password Toggle

- Remember Me

- Forgot Password

- Continue Button

- Google Button

- LinkedIn Button

- Login Validation

---

## Module 3

Register

Include

- Full Name

- Email

- Password

- Confirm Password

- Terms

- Register Button

---

## Module 4

Forgot Password

Include

- Email

- Send Reset Link

- Success State

---

## Module 5

Reset Password

Include

- New Password

- Confirm Password

- Success State

---

## Module 6

Verify Email

Include

- Success Screen

- Continue Button

---

## Module 7

Account Suspended

Information Card

Contact Support Button

---

## Module 8

Dashboard Placeholder

Only Layout

Sidebar

Topbar

Welcome Card

No functionality.

---

# FORM VALIDATION

Use

React Hook Form

+

Zod

Validate

- Required Fields

- Email Format

- Password Length

- Confirm Password

- Terms Accepted

Client-side only.

---

# RESPONSIVE

Desktop

Two Columns

Brand Section

Authentication Card

Tablet

Stack Layout

Mobile

Hide Branding Dashboard

Center Card

---

# ANIMATIONS

Use Framer Motion.

Include

- Fade In

- Slide In

- Hover Effects

- Focus Animation

- Button Animation

Keep animations subtle.

---

# MOCK NAVIGATION

Landing

↓

Login

↓

Dashboard

Register

↓

Verify Email

Forgot Password

↓

Success Screen

Reset Password

↓

Login

Google Login

↓

Toast

"Coming Soon"

LinkedIn Login

↓

Toast

"Coming Soon"

---

# CODE STANDARDS

Follow

- SOLID

- DRY

- Clean Code

- Component Reusability

- Functional Components

- TypeScript Strict Mode

- Accessibility

Never duplicate UI.

Always reuse components.

---

# IMPLEMENTATION STRATEGY

IMPORTANT

Do NOT generate the entire authentication module at once.

Work module by module.

For EVERY step:

1. Explain what will be built.

2. Explain why.

3. List files to create.

4. List files to modify.

5. Generate complete production-ready code.

6. Wait for confirmation.

Never continue automatically.

Each step must be testable before moving to the next one.

---

# FINAL DELIVERABLE

At the end of Phase 1 I should have:

✅ Enterprise Folder Structure

✅ Login Page

✅ Register Page

✅ Forgot Password

✅ Reset Password

✅ Verify Email

✅ Account Suspended

✅ Dashboard Placeholder

✅ Responsive Design

✅ Reusable Components

✅ Form Validation

✅ Premium SaaS UI

✅ Ready for Better Auth Integration

Start with **Module 1 (Authentication Layout)** only.

Do not generate any other module until I explicitly approve Module 1.