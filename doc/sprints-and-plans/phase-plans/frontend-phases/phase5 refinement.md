Here's a single implementation prompt covering all the changes you want.

````text
# SKILLEZO AI — Phase 5 UI Navigation Refinement

## Objective

Refine the dashboard navigation and information architecture to improve usability while preserving the existing enterprise design system, responsive behavior, animations, and reusable component architecture.

Do not redesign the UI. Only implement the requested navigation and layout changes.

---

## Task 1 — Remove Settings from Sidebar

Update the left sidebar navigation.

Requirements:

- Remove the **Settings** menu item completely.
- Remove its icon.
- Update the sidebar navigation configuration.
- Ensure active route highlighting continues to work correctly.
- Remove any unused sidebar imports.

The sidebar should now contain only:

- Dashboard
- Skill Verification
- User Profile
- Notifications

---

## Task 2 — Move Settings Inside Profile Module

Instead of having Settings as a separate primary navigation item, move it under the Profile section.

Requirements:

Keep the route:

```
/dashboard/settings
```

or, if the existing routing architecture allows nested profile routes, move it to:

```
/dashboard/profile/settings
```

(Choose the approach that best fits the current routing architecture without breaking existing navigation.)

Inside the **Profile** page, create a secondary navigation (tabs or left menu) containing:

- Personal Information
- Skills
- Certifications
- Education
- Profile Completion
- Settings

When the user clicks **Settings**, display:

- Profile Settings
- Password Settings
- Notification Preferences
- Appearance Settings
- Account Settings

Maintain the existing settings components.

Do not recreate them.

Simply relocate them into the Profile experience.

---

## Task 3 — Notifications in Header

Improve the notification experience.

Requirements:

The notification bell in the top header should become the primary notification access point.

When clicked:

- Open a notification dropdown/panel.
- Display recent notifications.
- Show unread badge count.
- Include:
  - Notification title
  - Short description
  - Timestamp
  - Read/Unread indicator

At the bottom include:

```
View All Notifications
```

Clicking it should navigate to:

```
/dashboard/notifications
```

The existing Notifications page should remain unchanged.

---

## Task 4 — User Menu

Keep the profile dropdown.

Include:

- Profile
- Settings
- Security Status
- Sign Out

Settings should navigate to the Settings section inside Profile (or the updated settings route).

---

## Task 5 — Skill Verification Typo

Locate every occurrence of the incorrectly spelled word related to "Statuses" within the Skill Verification module.

Correct the spelling everywhere, including:

- Filters
- Labels
- Headings
- Table columns
- Badges
- Empty states

---

## Task 6 — UI Verification

Verify that:

- Sidebar spacing remains balanced.
- Header alignment is maintained.
- Notification dropdown is responsive.
- Mobile sidebar works correctly.
- Profile navigation works.
- Settings open correctly from Profile.
- Notification bell opens dropdown.
- "View All Notifications" navigates correctly.
- Active navigation highlighting works.
- No layout shifts occur.

---

## Code Quality

After implementation:

- Remove unused imports.
- Remove unused sidebar configuration.
- Remove dead code.
- Maintain strict TypeScript typing.
- Maintain existing design system.
- Do not introduce duplicate components.
- Reuse existing Settings components.
- Reuse existing Notification components wherever possible.

---

## Verification

Run:

```
npm run lint
npx tsc --noEmit
npm run build
```

Confirm:

- Zero TypeScript errors
- Zero ESLint errors
- Successful production build
- Sidebar updated successfully
- Notification dropdown works from header
- Settings moved under Profile
- Skill Verification typo corrected
- Responsive behavior maintained
- Existing functionality remains unaffected
````
