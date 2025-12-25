# Frontend Refactor Log

## 2025-12-25
- Initialized refactor log to track task execution.
- Revisited existing frontend planning docs to confirm requirements captured in textual specifications.
- Reviewed client/src/App.jsx; confirmed routes import component-level modules (AdminDashboard, OrganizerDashboard, etc.) and mix components with pages.
- Listed current directories under client/src (layouts currently sparse, components hosting layout shells, hooks flat without domain partitioning).
- Captured pain points: layout shells reside in components, routes mix component/page modules, hooks lack domain grouping.
- Inspected useOrganizerDashboard and useOrganizerEarnings; both perform direct API calls with duplicated token checks and navigation redirects.
- Reviewed useGuestDashboard, useGuestProfile, and useEventGuests; noted repeated event/ticket normalization and local token handling.
- Confirmed OrganizerEventView lacks dedicated emergency broadcast trigger beyond status modal usage.
- Verified MyTickets page renders ticket list without feedback submission workflow, supporting post-event feedback gap.
- Observed static accent color strings inside OrganizerEarningsSummaryCards, reinforcing need for centralized theming tokens.
- Noted admin dashboard currently surfaces only counts/pending approvals, leaving payout metrics unrepresented on the frontend.
- Relocated admin, organizer, and auth layouts into client/src/layouts with re-export shims left in client/src/components to keep imports stable during migration.
- Updated organizer and admin page/component imports to consume the new layout paths, verifying OrganizerAccount, GuestDashboard, and AdminEventDetails load the relocated shells.
- Repointed organizer layout hooks (useLayoutUI, useOrganizerLayoutDark, useOrganizerProfile, useOrganizerNotifications) to read constants and utilities from the layouts directory, removing the dependency on legacy component paths.
- Checked off the corresponding Workstream A checklist items in docs/front-end-refactor.md to reflect completed structural tasks.
- Created client/src/layouts/GuestLayout.jsx to centralize guest-facing wrappers (background, navbar, default spacing) with optional overrides for full-width views like EventDetails.
- Updated guest route pages (GuestDashboard, GuestEvents, MyTickets, GuestProfile, EventDetails) to consume GuestLayout, replacing duplicated GuestNavbar wrappers and ensuring fragments handle layout-specific spacing.
- Refactored EventDetails loading/error helpers to reuse GuestLayout so all guest surfaces share consistent scaffolding regardless of state.
- Audited all files in client/src/pages; confirmed route modules now depend on layout components rather than duplicating shell divs, and noted no additional scaffolding moves required.
- Staged organizer route pages under client/src/pages/organizer with re-export wrappers plus a dedicated Account page, keeping legacy entry at client/src/pages/OrganizerAccount.jsx as a compatibility shim.
- Added client/src/pages/organizer/index.js barrel and switched App.jsx lazy imports to use a shared loadOrganizerPage helper so organizer routes resolve through the new page directory instead of components.
- Added client/src/pages/AdminEventDetails.jsx stub and retargeted App.jsx admin lazy imports (dashboard, events list, event details, users) to page modules, eliminating direct component references in route declarations while guarding organizer barrel loads with explicit export checks.
- Wrapped organizer and guest route segments in App.jsx with nested Suspense boundaries using a shared RouteLoadingFallback component to present consistent loaders while individual pages resolve.
- Established client/src/hooks/organizer/ and migrated organizer-specific hooks (dashboard, earnings, events, event view, create event, account, profile, notifications, layout) while leaving compatibility re-export stubs in client/src/hooks/ for incremental adoption.
- Added organizer hook wrapper useOrganizerLayout to streamline future theme support and confirmed existing imports remain stable via re-export files.
- Updated components and pages to consume the new organizer hook paths directly and deleted the temporary re-export shims from client/src/hooks.
- Added client/scripts/cleanup-proxy-exports.mjs plus an npm cleanup:proxies task to automatically rewrite imports and remove future proxy export shims.
