# Implementation & Refactor Plan

## Objectives
- Close functional gaps documented in [docs/requirements.md](requirements.md), [docs/use_cases.md](use_cases.md), and [docs/algorithm_final.md](algorithm_final.md).
- Simplify backend controller flow (for example in [server/controllers/authController.js](../server/controllers/authController.js) and [server/controllers/eventController.js](../server/controllers/eventController.js)).
- Restructure frontend layouts and pages to follow the UX architecture in [docs/Chapter_3_Methodology/3.5.2_Architecture_Design.md](Chapter_3_Methodology/3.5.2_Architecture_Design.md).

## Feature Gap Audit

| Feature | Documentation Source | Current Status | Required Actions |
| --- | --- | --- | --- |
| Organizer emergency update broadcast (Use Case 5) | [docs/use_cases.md](use_cases.md) | No endpoint or UI entry point detected | Add `/api/organizer/events/:id/emergency-update` service plus dashboard composer, reuse notification builder in [server/utils/eventHelpers.js](../server/utils/eventHelpers.js).
| Guest post-event feedback loop (Algorithm 5 step 4, UC15) | [docs/algorithms.md](algorithms.md), [docs/use_cases.md](use_cases.md) | Feedback fetch hooks exist, but submission/workflow missing | Implement feedback submission form on guest ticket detail, persist via Ticket to new Feedback endpoint, surface replies to organizers.
| Admin payout and settlement reporting | [docs/requirements.md](requirements.md) optional feature | Earnings UI present, no admin audit layer | Extend [server/controllers/adminController.js](../server/controllers/adminController.js) with payout summary and expose `/api/admin/payouts`.
| Paystack callback resilience and idempotency | [docs/algorithm_final.md](algorithm_final.md), [docs/behavioral_diagrams.md](behavioral_diagrams.md) | Flow in paymentController requires verification | Introduce service layer enforcing reference locks before issuing tickets, add retries and logging.
| Guest map filtering (Leaflet integration) | [docs/use_cases.md](use_cases.md) | GuestMap component exists but routing unverified | Ensure `/guest/map` uses location filters from `useGuestDashboard`, synchronize backend query params.

## Backend Refactor Roadmap

1. ✅ Introduce `server/services/` for auth, events, tickets, and notifications. Move business logic out of controllers into reusable functions for better testability (auth layer complete).
2. ✅ Centralize request validation under `server/validators/` (for example using express-validator) so controllers only orchestrate (login and register covered).
3. ⬜ Consolidate notification strategies extracted from controller constants into `server/utils/notificationStyles.js`. Align Algorithm 5 scenarios through unit tests (within 12h, post-event, escalation).
4. ✅ Extract repeated defaults (for example `DEFAULT_ACCENT`, `DEFAULT_BRAND_COLOR`) into `server/config/themeDefaults.js` and reuse across uploads and ticket flows.
5. ⬜ Replace ad-hoc logging with a structured logger such as Pino and standardize error handling via `createHttpError` helper.

## Frontend Restructure

1. Move layout components (for example OrganizerLayoutDark, AdminLayout) into `client/src/layouts/` and keep route-level screens inside `client/src/pages/` with lazy-loaded index barrels.
2. Group organizer hooks under `client/src/hooks/organizer/` and relocate formatting helpers to `client/src/utils/organizerFormatters.js` for clarity.
3. Build a shared notification drawer component that both guest and organizer experiences consume, backed by the unified notification service.
4. Extend ticket pages with a detail modal enabling feedback submission and event recaps that match the documented flow.

## Testing and Documentation

- Add integration tests for the new services using Jest and Supertest, following scenarios listed in [docs/integration_testing.md](integration_testing.md).
- Update sequence and activity diagrams in [docs/Chapter_3_Methodology/3.5.1_Proposed_System_Description.md](Chapter_3_Methodology/3.5.1_Proposed_System_Description.md) once emergency updates and feedback flows are delivered.
- Reflect the updated folder structure in [README.md](../README.md) and [EXPLANATION.md](../EXPLANATION.md).

## Execution Phasing

1. Phase 1 – Services and validation setup.
2. Phase 2 – Feature completion for emergency updates, feedback loop, and payout reporting.
3. Phase 3 – Frontend layout realignment and feature integration.
4. Phase 4 – Testing expansion and documentation refresh.

## Acceptance Criteria

- Controllers stay under roughly 100 lines, delegating core work to services.
- Documented feature gaps are covered with end-to-end tests mirroring use cases.
- Documentation reflects the live implementation to prevent divergence during reviews.
