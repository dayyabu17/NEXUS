# Nexus Frontend Refactor Checklist

## Preparation
- [x] Re-read [docs/frontend-refactor-checklist.md](frontend-refactor-checklist.md) and align key decisions with the textual requirements captured in the Nexus documentation set.
- [x] Inventory current routes, components, hooks, and layouts by cataloging [client/src/App.jsx](../client/src/App.jsx), [client/src/pages](../client/src/pages), [client/src/components](../client/src/components), and [client/src/hooks](../client/src/hooks).
- [x] Log existing pain points uncovered during inventory directly in this checklist for visibility.

## Diagnose Current Gaps
- [x] Audit [client/src/App.jsx](../client/src/App.jsx) for route entries that import component wrappers instead of page modules and document each mismatch.
- [x] Identify layout primitives inside [client/src/components](../client/src/components) (for example [client/src/components/OrganizerLayoutDark.jsx](../client/src/components/OrganizerLayoutDark.jsx), [client/src/components/AdminLayout.jsx](../client/src/components/AdminLayout.jsx)) and mark them for relocation.
- [x] Compare organizer hooks such as [useOrganizerDashboard](../client/src/hooks/useOrganizerDashboard.js) and [useOrganizerEarnings](../client/src/hooks/useOrganizerEarnings.js) to list overlapping API calls.
- [x] Trace guest ticket normalization logic across [useGuestDashboard](../client/src/hooks/useGuestDashboard.js), [useGuestProfile](../client/src/hooks/useGuestProfile.js), and [useEventGuests](../client/src/hooks/useEventGuests.js) to locate duplication.
- [x] Confirm emergency broadcast UI entry points are missing in organizer surfaces and capture the required placement per use case documentation.
- [x] Verify that feedback capture is absent from [client/src/pages/MyTickets.jsx](../client/src/pages/MyTickets.jsx) and [client/src/pages/EventDetails.jsx](../client/src/pages/EventDetails.jsx) and note required states.
- [x] List admin payout metrics currently exposed in backend responses but unused in the UI.
- [x] Record repeated styling constants (for example accent values in [client/src/components/OrganizerEarningsSummaryCards.jsx](../client/src/components/OrganizerEarningsSummaryCards.jsx)) for later extraction.

## Workstream A — Structure & Routing
- [x] Create `client/src/layouts/` and move organizer, admin, guest, and auth shells from components into that directory.
- [x] Add re-export stubs inside [client/src/components](../client/src/components) to avoid breaking imports during relocation.
- [x] Update layout imports within [client/src/pages/OrganizerAccount.jsx](../client/src/pages/OrganizerAccount.jsx), [client/src/pages/GuestDashboard.jsx](../client/src/pages/GuestDashboard.jsx), and [client/src/components/AdminEventDetails.jsx](../client/src/components/AdminEventDetails.jsx).
- [x] Review every file under [client/src/pages](../client/src/pages) to ensure only route-level logic resides there; move any layout scaffolding into layouts or components.
- [x] Introduce barrel files such as `client/src/pages/organizer/index.js` to standardize lazy imports.
- [x] Realign lazy route declarations in [client/src/App.jsx](../client/src/App.jsx) with the new page exports and remove direct component proxies like [client/src/components/EventDetails.jsx](../client/src/components/EventDetails.jsx).
- [x] Wrap organizer and guest route groups with suspense boundaries using consistent loaders.

## Workstream B — Data Layer & Hooks
- [x] Create `client/src/hooks/organizer/` and relocate organizer-specific hooks, updating their import paths.
- [ ] Create `client/src/hooks/guest/` and migrate guest flows accordingly.
- [ ] Draft hook naming guidelines (for example `useOrganizerDashboard`) and document them in a README inside `client/src/hooks/`.
- [ ] Extract ticket normalization into `client/src/utils/ticketTransforms.js` and refactor guest hooks to consume it.
- [ ] Build `client/src/utils/formatters.js` for currency/time helpers currently defined inline in components such as [client/src/components/OrganizerDashboard/dashboardUtils.js](../client/src/components/OrganizerDashboard/dashboardUtils.js).
- [ ] Extend [client/src/api/axios.js](../client/src/api/axios.js) with interceptors to normalize API errors and add auth refresh handling.
- [ ] Add feature-focused service modules (for example `client/src/services/eventsService.js`, `client/src/services/notificationsService.js`) and migrate hooks to call them.
- [ ] Replace boolean loading/error flags in complex hooks with explicit status enums to support skeleton, empty, and error views.

## Workstream C — Feature Completion
- [ ] Implement emergency broadcast CTA within organizer management surfaces (for example update [client/src/components/OrganizerEventView/UpdateStatusModal.jsx](../client/src/components/OrganizerEventView/UpdateStatusModal.jsx)).
- [ ] Render a broadcast history timeline inside organizer check-in views to surface confirmation details.
- [ ] Add a feedback drawer to [client/src/pages/MyTickets.jsx](../client/src/pages/MyTickets.jsx) tied to a new feedback hook.
- [ ] Surface aggregated feedback metrics within [client/src/components/OrganizerEventView/OrganizerEventCheckIns.jsx](../client/src/components/OrganizerEventView/OrganizerEventCheckIns.jsx) under a dedicated tab.
- [ ] Build an admin revenue summary page using shared cards from [client/src/components/OrganizerEarningsSummaryCards.jsx](../client/src/components/OrganizerEarningsSummaryCards.jsx) with admin theming overrides.
- [ ] Synchronize [client/src/components/GuestMap.jsx](../client/src/components/GuestMap.jsx) filters with categories provided by [useGuestDashboard](../client/src/hooks/useGuestDashboard.js) and ensure query params persist across navigation.

## Workstream D — UI Composition
- [ ] Restructure `client/src/components/` into subfolders for layout, sections, and common atoms with minimal breaking changes.
- [ ] Add READMEs in major component directories documenting purpose, expected props, and dependencies.
- [ ] Convert repeated Tailwind class stacks into utility components or CSS modules using `@apply` where appropriate.
- [ ] Introduce variant props for avatars, badges, and cards to replace duplicated styling logic.
- [ ] Wrap theme accent adjustments inside a dedicated provider rather than manual `applyAccentVariables` usage in [client/src/index.css](../client/src/index.css).

## Workstream E — Performance & Reliability
- [ ] Implement skeleton loaders for organizer and guest dashboards that match non-functional requirements in [docs/non_functional_requirements.md](non_functional_requirements.md).
- [ ] Create a shared `ErrorBoundary` and apply it to organizer, guest, and admin route segments.
- [ ] Centralize toast and alert handling via a notification context shared between layouts.
- [ ] Introduce caching for repeated dashboard requests using SWR, React Query, or a custom cache layer.
- [ ] Review navigation, headers, and interactive elements for semantic HTML and ARIA compliance.

## Workstream F — Tooling & Testing
- [ ] Extend [client/eslint.config.js](../client/eslint.config.js) with accessibility and hooks rules; add Prettier configuration if missing.
- [ ] Write unit tests covering SignIn, Guest Dashboard, and Organizer Dashboard render paths using React Testing Library.
- [ ] Mock service modules in tests to validate hook state transitions without network calls.
- [ ] Update or add Cypress/E2E scenarios for emergency broadcasts, feedback submission, and admin payout audits.
- [ ] Wire client lint and test scripts into the CI pipeline to run alongside backend checks.

## Delivery Roadmap Tracking
- [ ] Complete Sprint 1 scope: directory restructuring, updated lazy routes, baseline error boundaries.
- [ ] Complete Sprint 2 scope: shared utilities, refreshed services, normalized dashboard hooks.
- [ ] Complete Sprint 3 scope: emergency alerts UI, feedback workflows, admin payout dashboards.
- [ ] Complete Sprint 4 scope: theming cleanup, performance enhancements, expanded test suite, documentation sync.

## Acceptance Criteria Validation
- [ ] Verify every route component resides in [client/src/pages](../client/src/pages) with thin wrappers delegating to layouts.
- [ ] Confirm all network interactions flow through service modules returning normalized payloads for components.
- [ ] Demonstrate emergency updates, feedback loops, and guest map filters via manual walkthrough or automated tests in alignment with use cases.
- [ ] Ensure styling tokens derive from centralized providers and duplicated accent constants are removed.
- [ ] Validate CI runs linting, unit tests, and build steps for the client project without regressions.
