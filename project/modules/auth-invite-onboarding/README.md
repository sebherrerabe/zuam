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

# Objective
Implement Google OAuth sign-in, single-use invitation token gating, and the first-login onboarding gate.

## Scope In
- Start Google OAuth from the desktop and mobile entry points.
- Validate a single-use invite token before account creation is finalized.
- Create or update the local user record and issue session tokens.
- Refresh and revoke sessions cleanly.
- Show onboarding and error states that block access until auth is valid.

## Scope Out
- Password auth or email magic links.
- Team accounts, shared workspaces, and role management.
- Non-Google identity providers.
- Invitation analytics, token administration UI, and bulk invite tooling.

## Requirements
- `AUTH-REQ-001`: A user can start Google OAuth and return to the app with a valid session. Tests: `BE-E2E-AUTH-001`, `FE-UNIT-AUTH-001`.
- `AUTH-REQ-002`: First-time access requires a valid single-use invite token before the session is accepted. Tests: `BE-E2E-AUTH-002`, `FE-UNIT-AUTH-002`.
- `AUTH-REQ-003`: Invalid, missing, expired, or already-used invite tokens are rejected with a stable user-facing error. Tests: `BE-E2E-AUTH-003`, `FE-UNIT-AUTH-003`.
- `AUTH-REQ-004`: Refresh and sign-out flows preserve session integrity and do not create duplicate users. Tests: `BE-E2E-AUTH-004`, `FE-UNIT-AUTH-004`.

## Phase Mapping
- This is a Phase 1 foundation module and must be decision-complete before implementation starts.
- It unblocks all user-scoped modules that depend on authenticated access.

## Google Reference
- Read `google-reference.md` in this module before implementing OAuth, consent, or token storage.
