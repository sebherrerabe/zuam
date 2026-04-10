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
last_updated: "2026-04-10"
---

# Backend Test Spec

## `BE-INT-AUTH-001` Invite and session persistence on disposable Postgres
- Persist user, invite, and session records through Prisma-backed DAOs.
- Assert invite consumption, session rotation, and session revocation survive backend restart and fresh DAO construction.

## `BE-INT-AUTH-002` Transactional first-login creation
- Given concurrent first-login callbacks for the same Google subject and invite token, assert only one user record and one invite consumption commit.

## `BE-E2E-AUTH-001` Google OAuth happy path
- Given a configured Google provider and a valid `returnTo`, when the user completes callback successfully, then the API issues a session and returns the authenticated user payload.
- Assert redirect/state validation, cookie issuance, and idempotent user creation on repeat sign-in.

## `BE-E2E-AUTH-002` Invite token required on first login
- Given a new Google identity, when the callback completes without a valid invite token, then the API marks the session as gated and refuses full access.
- Assert `POST /auth/validate-invite` is required before access is finalized.

## `BE-E2E-AUTH-003` Invalid invite token handling
- Given malformed, expired, or already-used tokens, when validation is attempted, then the API returns a deterministic error and does not consume the token twice.
- Assert concurrent submissions are safe and only one request can consume the token.

## `BE-E2E-AUTH-004` Refresh and logout integrity
- Given a valid session, when refresh or logout is called, then tokens rotate or revoke cleanly and the user record is unchanged.
- Assert revoked refresh tokens cannot be reused and the session event is emitted.

## `BE-E2E-AUTH-005` OAuth failure surfaces
- Given provider errors or bad callback state, when the callback endpoint is hit, then the API returns a safe, non-leaking error response.
- Assert no user or session record is created on failure.

## `BE-E2E-AUTH-006` Expired or revoked session recovery
- Given an expired or revoked persisted session, when the client attempts refresh or authenticated access after restart, then the API rejects the session deterministically and requires re-auth.
