# Frontend Implementation & Refactor Checklist

> Comprehensive checklist grounded in the current Nexus client structure to guide progressive restructuring without losing continuity.

## 1. Directory Hygiene & Module Boundaries
- [ ] Confirm every reusable visual element lives under `client/src/components/`. Audit folders like `OrganizerDashboard/`, `AdminDashboard/`, `GuestNavbar/` for dead or duplicate files and document findings.
- [ ] Establish `client/src/layouts/` for shell-level wrappers (Admin, Organizer, Auth, Guest) and migrate existing implementations (currently mixed within components) while leaving re-export stubs behind to avoid breaking imports.
- [ ] Keep page-level route screens inside `client/src/pages/`; review current exports (e.g., `AdminDashboard.jsx`, `GuestProfile.jsx`) to ensure they do not contain layout scaffolding—only screen logic.
- [ ] Validate that assets are referenced via `client/src/assets/` or `client/public/` and remove any hard-coded `../public` paths from components.

## 2. Layout Consolidation
- [ ] Extract `AdminLayout.jsx`, `OrganizerLayoutDark.jsx`, `AuthLayout.jsx`, and Guest shells into `client/src/layouts/` with consistent prop signatures (`children`, `suppressLoader`, etc.).
- [ ] Group layout-specific partials (headers, sidebars, drawers) beneath `client/src/layouts/{LayoutName}/` to avoid scattering them across `components/`.
- [ ] Replace existing imports in pages/components with the new layout paths; leave barrel re-exports in the old locations to maintain backwards compatibility during rollout.
- [ ] Write lightweight smoke tests or storybook entries for each layout to confirm structural parity post-migration.

## 3. Component Taxonomy
- [ ] Tag large composite components (e.g., `OrganizerDashboard`, `AdminEventDetails`) with README snippets describing purpose, expected props, and dependencies for easier onboarding.
- [ ] Decompose monolithic files over 300 lines by extracting pure presentational elements into sub-folders (e.g., `UserManagement/UserTable.jsx`, `EventManagement/EventFilters.jsx`).
- [ ] Introduce index barrels for directories with many exports (`components/OrganizerDashboard/index.js`) to simplify import paths.

## 4. Hooks Organization
- [ ] Define a hooks naming convention: `useDomainAction` (e.g., `useOrganizerDashboard`, `useGuestEvents`) and enforce consistent default exports.
- [ ] Create domain-specific subfolders: `client/src/hooks/organizer/`, `client/src/hooks/admin/`, `client/src/hooks/guest/`; relocate relevant hooks and adjust imports accordingly.
- [ ] Identify hooks that mix data fetching and UI state; split them into service hooks (API/data) and UI hooks (local state/effects).
- [ ] Add JSDoc summaries to complex hooks to explain side effects and dependency expectations.

## 5. Context Management
- [ ] Audit `client/src/context/` to ensure each context serves a single concern (auth, theme, notifications). Document providers and their consumers in a `README.md` inside the folder.
- [ ] Remove redundant prop-drilling by wiring contexts where repeated pass-through props exist (e.g., user profile, theme toggles).
- [ ] Guard provider initialization with PropTypes or runtime checks to prevent undefined default states.

## 6. Service Layer Alignment
- [ ] Store all API clients and request handlers in `client/src/services/`. Verify files like `api/axios.js` and move domain-specific calls (organizer dashboard, admin CRUD) into dedicated modules (`services/organizer.js`, `services/admin.js`).
- [ ] Ensure services return plain data objects and leave transformation/formatting to utils or hooks.
- [ ] Centralize error normalization so UI layers receive uniform `message`, `status`, `retryable` fields.

## 7. Utilities & Formatting
- [ ] Catalog functions in `client/src/utils/` (date formatting, currency, tag normalization). Remove duplicates discovered in components or hooks.
- [ ] For organizer-specific formatting (earnings, attendance), create `utils/organizer/` to house domain helpers referenced by dashboards and reports.
- [ ] Introduce unit tests for critical utilities (currency converters, filter builders) to lock behavior before further refactors.

## 8. Styling Consistency
- [ ] Review Tailwind usage across components to ensure theme tokens and consistent spacing. Document shared class patterns in `client/README.md`.
- [ ] Migrate inline style objects into class-based utilities or theme configs where possible to keep styling declarative.
- [ ] Confirm dark mode variants are handled by layouts rather than duplicated per component.

## 9. Asset & Icon Handling
- [ ] Inventory icons under `client/src/assets/icons/` and convert repeated inline SVGs into components or imports for consistency.
- [ ] Ensure large media files reside in `client/public/images/` and are referenced via absolute `/images/...` paths for Vite compatibility.
- [ ] Implement lazy loading or responsive variants for hero/background images to optimize bundle weight.

## 10. Routing & Entry Points
- [ ] Revisit `client/src/App.jsx` lazy imports to match the new component/layout locations, avoiding relative path churn.
- [ ] Document route-to-page mapping in `client/README.md` (e.g., `/admin/events -> pages/EventManagement.jsx`).
- [ ] Confirm suspense boundaries wrap all lazy imports with fallback loaders after reorganizing.

## 11. Testing & Verification
- [ ] Add smoke tests using React Testing Library for core pages to ensure refactors do not break rendering (focus on admin dashboard, organizer dashboard, guest home).
- [ ] Update existing Cypress/end-to-end scripts (if any) with new selectors or layout wrappers.
- [ ] Incorporate lint rules enforcing hook placement and import ordering to detect regressions early.

## 12. Documentation & Governance
- [ ] Update [docs/implementation-refactor-plan.md](implementation-refactor-plan.md) with progress notes as each checklist item is completed.
- [ ] Capture before/after diagrams (folder trees) and store them in `docs/` for onboarding reference.
- [ ] Schedule periodic refactor reviews to keep the structure aligned with new features—log decisions in `docs/architecture-changelog.md` (create if absent).

---
Use this checklist iteratively: complete one cluster (e.g., layouts) before moving to hooks or services, running build/tests between phases to maintain stability.