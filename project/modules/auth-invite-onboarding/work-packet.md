---
id: auth-invite-onboarding
title: Auth, Invite Gating, and Onboarding
status: ready
phase: phase-1-foundation
owners:
  - Backend Engineer
  - Frontend Engineer
depends_on: []
parallel_group: phase1-auth
source_of_truth: PRD_Zuam_v0.3.md
last_updated: "2026-04-04"
---

# Work Packet

## Objective
Ship Google OAuth plus single-use invite gating and the first-login access gate.

## Files and Packages Expected To Change
- `packages/backend/src/auth/*`
- `packages/backend/src/users/*`
- `packages/desktop/src/routes/auth/*`
- Shared auth DTOs and session helpers.

## Contracts To Implement
- OAuth start and callback endpoints.
- Invite token validation endpoint.
- Session refresh and logout behavior.
- Auth-gated route guard and shell handoff.

## Tests To Create First
- `BE-E2E-AUTH-001` through `BE-E2E-AUTH-005`.
- `FE-UNIT-AUTH-001` through `FE-UNIT-AUTH-004`.

## Blockers and Dependencies
- Requires the final session storage choice to stay consistent across backend and desktop.
- Requires a canonical user record shape before downstream modules start consuming it.

## Parallel-Safe Boundaries
- Backend OAuth and invite logic can be built independently from the desktop gate UI once DTOs are fixed.
- The auth screen can be implemented against mocked endpoint contracts before the real backend is complete.

## Completion Signals
- A new user cannot reach the app shell without a valid invite token.
- A returning user can re-authenticate and refresh without duplicate records.

## Non-Goals
- No password auth.
- No team invites or multi-tenant permission model.
- No mobile-specific auth polish beyond the shared contract.

## Risks
- OAuth callback and invite consumption must be transactional to avoid duplicate user creation.
- Error text must stay stable so front-end tests do not become brittle.
