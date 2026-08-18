# SKILLEZO AI — Phase 2 (Login Page Implementation)

## ROLE

You are the Lead Frontend Engineer and Principal UI Architect for SKILLEZO AI.

Module 1 has already been completed.

DO NOT recreate or modify Module 1 unless absolutely required.

Reuse all existing shared components.

Your responsibility is to build ONLY the Login Page.

Wait for approval before implementing any other page.

---

# CURRENT PROJECT STATUS

Completed

✅ Landing Page

✅ Design System

✅ Authentication Layout

✅ Brand Section

✅ Auth Card

✅ Auth Header

✅ Password Input

✅ Remember Me

✅ Social Button

✅ Divider

✅ Loading Spinner

✅ Brand Logo

✅ Glass Card

✅ Utility Components

Do NOT recreate these components.

Reuse them.

---

# OBJECTIVE

Build a production-ready Login Page.

The page should integrate all shared authentication components built in Module 1.

The design should look like a premium SaaS application similar to:

• Clerk

• Linear

• Stripe

• Vercel

• OpenAI

---

# FILES TO CREATE

Create ONLY these files.

app/

login/

page.tsx

loading.tsx

components/

LoginCard.tsx

LoginForm.tsx

Do NOT create any additional pages.

Do NOT work on Register.

Do NOT work on Forgot Password.

Do NOT work on Dashboard.

Only Login.

---

# FILES TO REUSE

Reuse

AuthLayout

BrandSection

AuthCard

AuthHeader

PasswordInput

RememberMe

Divider

SocialButton

BrandLogo

LoadingSpinner

GlassCard

No duplicate components.

---

# LOGIN PAGE LAYOUT

Desktop

------------------------------------------------

Brand Section

|

Login Card

------------------------------------------------

Mobile

Logo

↓

Login Card

Brand section hidden.

---

# LOGIN CARD

The Login Card should contain

Welcome Back 👋

Sign in to continue your AI career journey.

Email Address

Password

Remember Me

Forgot Password

Continue Button

Divider

Continue with Google

Continue with LinkedIn

Don't have an account?

Sign Up

---

# LOGIN FORM

Build using

React Hook Form

+

Zod

Validation

Email

Required

Valid Email

Password

Required

Minimum 8 characters

Display inline validation messages.

Do NOT call any backend.

---

# PASSWORD INPUT

Reuse PasswordInput component.

Support

Show Password

Hide Password

Keyboard Accessibility

Focus Ring

Error State

---

# REMEMBER ME

Reuse RememberMe component.

Forgot Password should navigate to

/forgot-password

---

# CONTINUE BUTTON

Initially disabled while submitting.

Show LoadingSpinner during submit.

After successful validation

Mock redirect to

/dashboard

using Next.js router.

No API requests.

---

# SOCIAL LOGIN

Reuse SocialButton.

Buttons

Continue with Google

Continue with LinkedIn

On click

Show Sonner Toast

"Coming Soon"

Do NOT integrate OAuth.

---

# LOADING PAGE

Create

loading.tsx

Use

LoadingSpinner

Glass Card

Brand Logo

Matching authentication theme.

---

# RESPONSIVE

Desktop

Two-column layout

Brand section visible

Tablet

Centered login card

Mobile

Hide Brand Section

Centered card

Proper spacing

---

# ACCESSIBILITY

Keyboard Navigation

Tab Order

ARIA Labels

Focus States

Accessible Error Messages

---

# ANIMATIONS

Use Framer Motion.

Include

Fade In

Card Slide

Input Focus Animation

Button Hover Glow

Subtle Motion Only

---

# MOCK FLOW

Landing Page

↓

Login

↓

Click Continue

↓

Validate Form

↓

Router Push

/dashboard

Google

↓

Toast

Coming Soon

LinkedIn

↓

Toast

Coming Soon

Forgot Password

↓

/forgot-password

Sign Up

↓

/register

---

# IMPLEMENTATION RULES

Do NOT generate everything at once.

Work step by step.

Step 1

Explain implementation.

Step 2

List files being created.

Step 3

Generate complete code.

Step 4

Wait for approval.

Do not continue automatically.

Every step must be testable before moving to the next step.

---

# CODE QUALITY

Use

TypeScript

Functional Components

React Hook Form

Zod

Strict Typing

Reusable Components

Clean Code

SOLID Principles

No duplicated code.

---

# SUCCESS CRITERIA

The Login Page should

✅ Reuse Module 1 components

✅ Match Landing Page Design

✅ Be Fully Responsive

✅ Include Client-side Validation

✅ Include Loading State

✅ Include Mock Navigation

✅ Include Social Login Buttons

✅ Be Ready for Better Auth Integration

Begin with the implementation plan for the Login Page only. List the files that will be created or modified, explain the purpose of each file, then generate the code one file at a time and wait for approval after each file.