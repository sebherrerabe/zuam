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

# Frontend Test Spec

## `FE-UNIT-AUTH-001` Sign-in entry state
- Render the auth screen with one primary Google sign-in action.
- Verify loading, disabled, and retry states around OAuth start.

## `FE-UNIT-AUTH-002` Invite token entry and validation
- Render the invite token field with inline validation and helper text.
- Verify the continue action is disabled until the token is present and well-formed.

## `FE-UNIT-AUTH-003` Invite failure feedback
- When the backend rejects a token, show a stable error message and preserve the input value.
- Verify the user can correct the token without a full page reload.

## `FE-UNIT-AUTH-004` Session handoff after success
- After callback completion, route into the app shell only when the session is confirmed.
- Verify the logged-out state cannot access protected UI and that sign-out returns to the auth screen.
