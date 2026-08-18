<div align="center">

# 🚀 SKILLEZO.AI — Enterprise Client Platform

### Next-Generation AI Skill Verification & Student Career Intelligence System

[![Next.js](https://img.shields.io/badge/Next.js-16.3.0-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-React-3D5AFE?style=for-the-badge)](https://better-auth.com/)
[![License](https://img.shields.io/badge/License-Proprietary-FF4081?style=for-the-badge)](LICENSE)
[![Deployment](https://img.shields.io/badge/Vercel-Deployed-00D9C0?style=for-the-badge&logo=vercel&logoColor=white)](https://skillezo-ai.vercel.app)

**SKILLEZO AI** is an enterprise-grade AI-powered platform for candidate skill verification, automated ATS resume intelligence, employability scoring, personalized career roadmapping, Better Auth authentication, and smart job matching. Built with Next.js App Router, React 19, TypeScript, Framer Motion, and Tailwind CSS v4.

[🌐 Live Demo](https://skillezo-ai.vercel.app) • [📖 Documentation](#-system-architecture) • [🚀 Quick Start](#-quick-start)

---

</div>

## 📌 Executive Summary

SKILLEZO AI bridges the gap between candidate skill mastery and recruiter visibility. The client application provides an interactive, glassmorphic student dashboard equipped with:

- **Better Auth Authentication:** Integrated sign up, sign in, sign out, and session management (`better-auth/react`).
- **AI Career Intelligence (Modules 20–23):** Automated ATS scoring, skill gap diagnostics, candidate percentile benchmarking, and step-by-step career GPS paths.
- **Smart Job Center (Module 28):** Real-time skill match percentage engine, high-contrast light/dark mode UI, interactive job drawer, 1-click application modal, saved jobs, and application status tracker.
- **Skill Audit Verification Engine:** Categorized skill verifications, proof-of-work credentials, and telemetry audit inspection drawers.
- **Learning & Growth Hub:** AI career coaching, interactive skill assessments, curated learning tracks, active projects, progress analytics, and wallet.
- **Enterprise Design System:** Sleek dark/light glassmorphic UI components, fluid micro-animations, responsive sidebars, accessible high-contrast light mode tokens, and theme controls.

---

## 🏗 System Architecture

```text
                               ┌────────────────────────────────────────┐
                               │           SKILLEZO AI CLIENT           │
                               │       Next.js 16 (App Router)          │
                               └──────────────────┬─────────────────────┘
                                                  │
                ┌─────────────────────────────────┴─────────────────────────────────┐
                ▼                                                                   ▼
    ┌───────────────────────┐                                           ┌───────────────────────┐
    │   AUTHENTICATION      │                                           │  STUDENT PORTAL HUB   │
    │   (BETTER AUTH REACT) │                                           │   & CAREER ENGINE     │
    └───────────┬───────────┘                                           └───────────┬───────────┘
                │                                                                   │
    ┌───────────┴───────────┐                       ┌───────────────────────────────┴───────────────────────────────┐
    │ - Login / Register    │                       │                                                               │
    │ - Better Auth Client  │                       ▼                                                               ▼
    │ - Password Recovery   │          ┌─────────────────────────┐                                     ┌─────────────────────────┐
    │ - Email Verification  │          │ CAREER INTELLIGENCE     │                                     │ SMART JOB CENTER        │
    │ - Account Suspended   │          │ - Resume Intelligence   │                                     │ - Multi-Filter Search   │
    └───────────────────────┘          │ - Skill Gap Audit       │                                     │ - Match Score Calculator│
                                       │ - Employability Index   │                                     │ - Detail Drawer & Modal │
                                       │ - Career GPS Roadmap    │                                     │ - Saved & Applied Jobs  │
                                       └─────────────────────────┘                                     └─────────────────────────┘
                                                     │                                                               │
                                                     └───────────────────────────────┬───────────────────────────────┘
                                                                                     │
                                                                                     ▼
                                                                      ┌────────────────────────────┐
                                                                      │ CENTRALIZED MOCK & DATA    │
                                                                      │ TYPESAFE ARCHITECTURE      │
                                                                      └────────────────────────────┘
```

---

## 🗺️ Route Directory & Feature Matrix

| Path | Module Name | Primary Function | Status |
|:---|:---|:---|:---:|
| `/` | Landing Page | Hero showcase, interactive AI score calculator modal, feature highlights | 🟢 Active |
| `/login` | Authentication | Better Auth email/password login, remember me state, error toast | 🟢 Active |
| `/register` | Authentication | Better Auth registration with password validation rules | 🟢 Active |
| `/forgot-password` | Authentication | Self-service password recovery workflow | 🟢 Active |
| `/reset-password` | Authentication | Secure password reset submission token handler | 🟢 Active |
| `/verify-email` | Authentication | OTP / Link verification flow with resend countdown | 🟢 Active |
| `/account-suspended` | Security | Standalone security suspension alert page | 🟢 Active |
| `/dashboard` | Dashboard Overview | Key stats, dynamic user greeting, skill growth line charts | 🟢 Active |
| `/dashboard/student-portal` | Student Portal Hub | Glassmorphic hero gauge, AI coach widget, filterable feature grid | 🟢 Active |
| `/dashboard/job-center` | Smart Job Center | Multi-filter job search, AI match scores, high-contrast light mode UI, application tracker | 🟢 Active |
| `/dashboard/profile` | Career Profile | Target roles, tech stack mastery, verified credential showcase | 🟢 Active |
| `/dashboard/resume-intelligence` | Resume Intelligence | ATS compatibility auditor, skill extraction, formatting checks | 🟢 Active |
| `/dashboard/skill-gap-analysis` | Skill Gap Analysis | Skill deficiency matrix, recommended courses, action items | 🟢 Active |
| `/dashboard/employability-index` | Employability Score | Recruiter readiness score, Top % percentile rank benchmark | 🟢 Active |
| `/dashboard/career-gps` | Career GPS | Step-by-step career path milestones & ETA timeline | 🟢 Active |
| `/dashboard/skill-verification` | Skill Audit Engine | Filterable skill audit directory & telemetry inspection drawer | 🟢 Active |
| `/dashboard/ai-career-coach` | AI Career Coach | Personalized AI guidance, resume tips, and interview coaching | 🟢 Active |
| `/dashboard/assessments` | Skill Assessments | Technical skill quizzes, code challenges, and score badges | 🟢 Active |
| `/dashboard/learning-hub` | Learning Hub | Curated courses, learning tracks, and certification paths | 🟢 Active |
| `/dashboard/projects` | Hands-on Projects | Real-world project portfolio, code submissions, and reviews | 🟢 Active |
| `/dashboard/progress-analytics` | Progress Analytics | Deep analytics on skill acquisition, time spent, and growth curves | 🟢 Active |
| `/dashboard/wallet` | Wallet & Credits | Skill verification credits, transaction history, and rewards | 🟢 Active |
| `/dashboard/notifications` | Notifications | Unread count badge dropdown & category-filtered inbox | 🟢 Active |
| `/dashboard/settings` | Account Settings | Profile preferences, security controls, theme toggles, data export | 🟢 Active |

---

## 💻 Tech Stack & Dependencies

### Core Frameworks & Libraries
- **Framework:** [Next.js 16.3.0](https://nextjs.org/) (App Router with Turbopack)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode)
- **Authentication & Security:** [Better-Auth React 1.6.26](https://better-auth.com/), Mongoose / MongoDB, JWT, bcryptjs
- **UI Engine:** [React 19.2.8](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/) & [Lenis](https://lenis.darkroom.engineering/) (Smooth Scroll)
- **Form Controls & Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) + `@hookform/resolvers`
- **Data Visualization:** [Recharts](https://recharts.org/)
- **Toast Notifications:** [Sonner](https://sonner.emilkowal.si/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 📁 Repository Structure

```text
client/
├── app/                        # Next.js App Router Page Handlers & Layouts
│   ├── (auth)/                 # 🔐 Shared Authentication Layout & Pages
│   │   ├── login/              # Sign-In View (Better Auth)
│   │   ├── register/           # Registration View (Better Auth)
│   │   ├── forgot-password/    # Password Recovery
│   │   ├── reset-password/     # Password Reset
│   │   └── verify-email/       # Email Verification
│   ├── dashboard/              # 📊 Dashboard Pages & Modules
│   │   ├── student-portal/     # 🎓 Student Portal Hub
│   │   ├── job-center/         # 💼 Smart Job Center (Module 28)
│   │   ├── profile/            # 👤 Student Career Profile
│   │   ├── resume-intelligence/# 📄 AI Resume Intelligence (Module 20)
│   │   ├── skill-gap-analysis/ # 🎯 Skill Gap Analysis (Module 21)
│   │   ├── employability-index/# 📊 Employability Score (Module 22)
│   │   ├── career-gps/         # 🧭 Career GPS Roadmap (Module 23)
│   │   ├── skill-verification/ # 🏆 Skill Audit Verification Engine
│   │   ├── ai-career-coach/    # 🤖 AI Career Coach
│   │   ├── assessments/        # 📝 Skill Quizzes & Code Challenges
│   │   ├── learning-hub/       # 📚 Learning Tracks & Courses
│   │   ├── projects/           # 💻 Hands-on Portfolio Projects
│   │   ├── progress-analytics/ # 📈 Skill Growth & Percentile Analytics
│   │   ├── wallet/             # 💳 Verification Credits & Wallet
│   │   ├── notifications/      # Notifications Center
│   │   ├── settings/           # Account Settings
│   │   └── page.tsx            # Main Dashboard Overview
│   ├── account-suspended/      # 🚨 Suspension Guard Screen
│   ├── api/                    # Serverless API Handlers (Auth & Verification)
│   ├── globals.css             # Utility Classes & CSS Tokens
│   ├── layout.tsx              # Root HTML Shell & Theme Providers
│   └── page.tsx                # Marketing Landing Page
│
├── components/                 # Atomic Modular UI Components
│   ├── auth/                   # Form Inputs, PasswordInput, LoadingSpinner
│   ├── dashboard/              # Dashboard Feature UI
│   │   ├── job-center/         # Job Center Filters, High-Contrast Job Cards, Drawer, Modal
│   │   ├── student-portal/     # Student Portal Hero, AI Coach, Feature Grid
│   │   ├── resume-intelligence/# ATS Audit, Keyword Analysis, Resume Uploader
│   │   ├── employability-index/# Employability Gauge, Score Breakdown, Strengths/Gaps
│   │   ├── career-gps/         # Career Milestone Timeline & Salary Progression
│   │   ├── notifications/      # Inbox & Notification Filters
│   │   ├── profile/            # Profile Header, Skill Badges, Progress Gauge
│   │   ├── settings/           # Preference Tabs & Form Sections
│   │   └── verification/       # Audit Directory & Telemetry Drawer
│   ├── layout/                 # Main Shell (Sidebar, Topbar, MobileSidebar, UserMenu Session Sync)
│   ├── common/                 # PageHeader, StatusBadge, MetricCard, Skeleton
│   ├── site/                   # Landing Page (Hero, Features, Pricing, CTA)
│   └── ui/                     # Primitives (Button, Dialog, Input, Toaster)
│
├── context/                    # React Context Providers (ThemeContext)
├── doc/                        # Architecture Specs & Phase Walkthrough Documents
├── mock/                       # Typesafe Mock Data Layers (Job Center, Resume, Audits, Career)
├── types/                      # TypeScript Domain Models & Interfaces
├── lib/                        # Utility Functions & Helper Classes (auth-client, api, cn, formatters)
└── public/                     # Static Assets, Vectors & Favicons
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js:** `>= 18.17.0` (LTS recommended)
- **npm:** `>= 9.0.0` or **pnpm:** `>= 8.0.0`

### Installation Steps

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/priyayayayayaaa/Skillezo.AI.git
   cd Skillezo.AI/client
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in `client/`:
   ```env
   NEXT_PUBLIC_APP_NAME="SKILLEZO AI"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NEXT_PUBLIC_API_URL="http://localhost:5000"
   ```

4. **Launch Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Production Vercel Deployment

Deploy frontend on **Vercel** (`https://skillezo-ai.vercel.app`):

1. **Vercel Environment Variable**:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://<your-backend-app>.onrender.com`
2. **Build Verification**:
   ```bash
   npm run build
   ```

---

## 🧪 Quality Control & Verification

To maintain production standards, execute the following commands prior to committing changes:

```bash
# 1. Strict TypeScript Compile Check (Zero Warnings)
npx tsc --noEmit

# 2. ESLint Static Code Analysis
npm run lint

# 3. Production Build Verification
npm run build
```

---

## 🎨 Design Tokens & UI Architecture

| Token Class | Light Mode | Dark Mode (Deep Space) | Visual Role |
|:---|:---|:---|:---|
| **Background** | `#F8FAFC` | `#0B1130` | Main canvas surface |
| **Sidebar Surface** | `#FFFFFF` | `#080D26` | Fixed layout side panel |
| **Card Container** | `#FFFFFF` | `#111736` / `#131B3E` | Elevation surface cards |
| **Primary Text** | `#0F172A` (Slate 900) | `#F8FAFC` (Slate 50) | Main titles & headers |
| **Secondary Text** | `#475569` (Slate 600) | `#94A3B8` (Slate 400) | Descriptions, subtitles, tags |
| **Primary Accent** | `#3D5AFE` | `#3D5AFE` (Electric Blue) | Buttons, active borders, links |
| **Secondary Accent** | `#059669` / `#00897B` | `#00D9C0` (Vivid Cyan) | Skill badges, match score badges |
| **Borders** | `#E2E8F0` (Slate 200) | `#1E293B` (Slate 800) | Structural divider lines |

> 💡 **Light Mode Contrast Optimization**: All job listings, metadata tags, department labels, and skill badges incorporate high-contrast Slate text tokens (`slate-600` / `slate-700` / `slate-900`) and explicit border tokens (`border-slate-200`) to guarantee high visibility when toggling from Dark Mode.

---

## 🔒 Security & Performance Guidelines

- **Zero Hydration Mismatch:** Strict client component mounting checks for SSR compatibility.
- **Route Guards:** Client-side layout route validation for dashboard modules.
- **Bundle Optimization:** Tree-shakeable Lucide icon imports and lightweight Framer Motion dynamic imports.
- **Accessibility (a11y):** Semantic HTML5 landmarks, unique interactive element IDs, high contrast text tokens, and full keyboard navigation support.

---

## 📄 License & Intellectual Property

Copyright © 2026 **SKILLEZO AI**. All rights reserved.  
*Proprietary software — unauthorized copying, distribution, or modifications are strictly prohibited.*
