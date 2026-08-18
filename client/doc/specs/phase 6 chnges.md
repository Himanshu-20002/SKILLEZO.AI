# SKILLEZO AI — Phase 6 Navigation Enhancement (Collapsible Student Portal)

## Objective

Redesign the dashboard sidebar navigation to support expandable/collapsible navigation groups while preserving the existing enterprise design system, responsive behavior, routing architecture, and reusable components.

This is a navigation enhancement only.

Do NOT modify the business modules themselves.

Do NOT change any existing routes.

Maintain the current dark glassmorphic design.

----------------------------------------------------

## Navigation Structure

The sidebar should be organized into logical groups.

Dashboard

Student Portal ▼
    • Career Profile
    • Resume Intelligence
    • Skill Gap Analysis
    • Employability Index
    • Career GPS
    • Learning Hub
    • Projects
    • Assessments
    • AI Career Coach
    • Job Center
    • Progress & Analytics
    • Wallet & Subscription

Skill Verification

Notifications

----------------------------------------------------

## Student Portal Dropdown

Requirements

Create a collapsible navigation group called

Student Portal

Behavior

- Initially collapsed.
- Clicking the parent expands all child pages.
- Clicking again collapses it.
- Animate expand/collapse using Framer Motion.
- Remember expanded state while navigating.
- Automatically expand if the current route belongs to Student Portal.

Example

▶ Student Portal

Click

▼ Student Portal
   Career Profile
   Resume Intelligence
   Skill Gap Analysis
   Employability Index
   Career GPS
   Learning Hub
   Projects
   Assessments
   AI Career Coach
   Job Center
   Progress & Analytics
   Wallet & Subscription

----------------------------------------------------

## Dashboard Navigation

Dashboard remains a standalone top-level navigation item.

Do not place Dashboard inside Student Portal.

----------------------------------------------------

## Active Route

Requirements

- Highlight the active child page.
- Highlight the parent Student Portal when any child route is active.
- Maintain current active navigation styling.

----------------------------------------------------

## Icons

Student Portal

Use an appropriate Lucide icon such as

GraduationCap

or

BookOpen

Child items should use smaller icons.

Dashboard keeps its existing icon.

----------------------------------------------------

## Animations

Use Framer Motion.

Animate

- Expand
- Collapse
- Chevron rotation
- Child fade
- Child slide

Animation should be smooth and lightweight.

----------------------------------------------------

## Mobile Sidebar

Ensure

- Dropdown works correctly
- Auto collapses after selecting a page
- Responsive behavior is maintained

----------------------------------------------------

## Sidebar Component Refactor

Refactor Sidebar.tsx.

Instead of a flat navigation array, use grouped navigation.

Example

Dashboard

Student Portal

Skill Verification

Notifications

Future groups can easily be added without rewriting the sidebar.

----------------------------------------------------

## Future Scalability

Design the navigation configuration to support additional groups such as

Recruiter Portal

Admin Portal

Company Portal

Learning Management

without modifying sidebar logic.

----------------------------------------------------

## Verification

Run

npm run lint

npx tsc --noEmit

npm run build

----------------------------------------------------

## Manual Verification

✓ Student Portal expands smoothly

✓ Student Portal collapses smoothly

✓ Chevron rotates correctly

✓ Active child route is highlighted

✓ Parent group stays highlighted

✓ Dashboard remains separate

✓ Mobile sidebar functions correctly

✓ Responsive layout maintained

✓ Zero TypeScript errors

✓ Zero ESLint errors

✓ Production build succeeds

----------------------------------------------------

## Expected Deliverables

- Collapsible Student Portal navigation group
- Smooth Framer Motion animations
- Grouped sidebar architecture
- Persistent expanded state during navigation
- Active route highlighting
- Responsive mobile support
- Clean, scalable navigation ready for future Recruiter, Admin, and Company portals