# SKILLEZO AI — Phase 3 (Register Page Implementation)

## ROLE

You are the Lead Frontend Engineer and Principal UI Architect for SKILLEZO AI.

Phase 1 (Authentication Foundation) and Phase 2 (Login Page) have already been completed and approved.

DO NOT modify existing components unless absolutely necessary.

Reuse all existing authentication components.

Build ONLY the Register Page.

Wait for approval before implementing any other module.

---

# CURRENT PROJECT STATUS

Completed

✅ Landing Page

✅ Authentication Layout

✅ Brand Section

✅ Shared Authentication Components

✅ Login Page

✅ Login Validation

✅ Mock Navigation

Reuse everything already built.

---

# OBJECTIVE

Build a production-ready Register Page.

The page must reuse all shared authentication components and maintain complete visual consistency with the Login page.

The UI should feel like a premium SaaS application inspired by:

• Clerk

• Linear

• Stripe

• Vercel

• OpenAI

---

# FILES TO CREATE

Create ONLY

app/

register/

page.tsx

loading.tsx

components/

RegisterCard.tsx

RegisterForm.tsx

Do not modify Login components.

Do not create backend logic.

---

# REUSE EXISTING COMPONENTS

Reuse

AuthLayout

BrandSection

AuthCard

AuthHeader

PasswordInput

Divider

LoadingSpinner

BrandLogo

GlassCard

Do not duplicate components.

---

# REGISTER PAGE LAYOUT

Desktop

------------------------------------------------

Brand Section

|

Register Card

------------------------------------------------

Mobile

Logo

↓

Register Card

Brand section hidden.

---

# REGISTER CARD

Include

Create Account

Create your SKILLEZO account to begin your AI career journey.

Fields

Full Name

Email Address

Password

Confirm Password

Terms & Conditions Checkbox

Create Account Button

Divider

Continue with Google

Continue with LinkedIn

Already have an account?

Sign In

---

# REGISTER FORM

Build using

React Hook Form

+

Zod

Validation Rules

Full Name

Required

Minimum 3 characters

Email

Required

Valid email format

Password

Required

Minimum 8 characters

At least

• One uppercase

• One lowercase

• One number

Confirm Password

Must match Password

Terms & Conditions

Must be accepted

Display inline validation messages.

Client-side validation only.

---

# PASSWORD INPUTS

Reuse PasswordInput.

Support

Show Password

Hide Password

Focus Glow

Keyboard Accessibility

Inline Errors

---

# TERMS & CONDITIONS

Create reusable checkbox using existing RememberMe styling.

Text

"I agree to the Terms of Service and Privacy Policy."

Links should be placeholders.

---

# CREATE ACCOUNT BUTTON

During submission

Disable button

Show LoadingSpinner

After successful validation

Mock redirect to

/verify-email

No backend.

---

# SOCIAL LOGIN

Reuse SocialButton.

Buttons

Continue with Google

Continue with LinkedIn

Click

↓

Toast

"Coming Soon"

---

# LOADING PAGE

Create

loading.tsx

Reuse

LoadingSpinner

BrandLogo

GlassCard

---

# RESPONSIVE

Desktop

Two Columns

Tablet

Centered Card

Mobile

Brand Section Hidden

Full Width Card

---

# ACCESSIBILITY

Keyboard Navigation

Tab Order

ARIA Labels

Focus States

Accessible Validation Messages

---

# ANIMATIONS

Use Framer Motion

Fade In

Slide Up

Card Entrance

Button Hover

Input Focus

Keep animations subtle.

---

# MOCK FLOW

Landing

↓

Register

↓

Validation

↓

Mock Redirect

↓

/verify-email

Already Have Account

↓

/login

Google

↓

Toast

Coming Soon

LinkedIn

↓

Toast

Coming Soon

---

# IMPLEMENTATION RULES

Work step-by-step.

Step 1

Explain implementation.

Step 2

List files.

Step 3

Generate code.

Step 4

Wait for approval.

Do not continue automatically.

---

# CODE QUALITY

Use

TypeScript

Strict Typing

React Hook Form

Zod

Reusable Components

Clean Architecture

SOLID Principles

No duplicate code.

---

# SUCCESS CRITERIA

The Register Page should

✅ Match Login Page Design

✅ Reuse Existing Components

✅ Include Client-side Validation

✅ Include Loading State

✅ Include Password Strength Validation

✅ Include Confirm Password Validation

✅ Include Terms Validation

✅ Include Mock Navigation

✅ Be Fully Responsive

✅ Be Ready for Better Auth Integration

Begin with the implementation plan for the Register Page only.

List the files to create or modify.

Explain the purpose of each file.

Generate one file at a time.

Wait for approval after each file.