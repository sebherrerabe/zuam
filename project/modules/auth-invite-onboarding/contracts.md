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

# Contracts

## REST API
### `POST /auth/google`
- Purpose: start Google OAuth and return an authorization redirect URL or provider payload.
- Request: optional `returnTo` string.
- Response: `302` redirect or `{ authorizationUrl }`.
- Errors: `401` if the app is not configured, `409` if invite gating is required before redirect, `500` for provider setup failure.
- Tests: `BE-E2E-AUTH-001`.

### `GET /auth/google/callback`
- Purpose: finish OAuth, exchange the code, and stage the authenticated identity.
- Request: OAuth `code`, `state`, and provider error parameters.
- Response: session cookies plus a JSON payload with `user`, `isNewUser`, and `inviteRequired`.
- Errors: `400` invalid state or code, `401` provider rejection, `409` invite token missing or invalid.
- Tests: `BE-E2E-AUTH-001`, `BE-E2E-AUTH-002`, `BE-E2E-AUTH-003`.

### `POST /auth/validate-invite`
- Purpose: validate and consume a single-use invitation token.
- Request: `{ token: string }`.
- Response: `{ valid: true, inviteId, expiresAt }`.
- Errors: `400` malformed token, `404` unknown token, `409` already used or expired.
- Tests: `BE-E2E-AUTH-002`, `BE-E2E-AUTH-003`.

### `POST /auth/refresh`
- Purpose: rotate session credentials without changing the identity record.
- Request: refresh token cookie or header.
- Response: new access/session token pair.
- Errors: `401` expired, revoked, or missing refresh token.
- Tests: `BE-E2E-AUTH-004`.

### `POST /auth/logout`
- Purpose: revoke the current session.
- Response: `204 No Content`.
- Tests: `BE-E2E-AUTH-004`.

## Data Contracts
- `User`: stable `id`, `googleSubject`, `email`, `name`, `avatarUrl`, `createdAt`, `updatedAt`.
- `InviteToken`: `token`, `createdAt`, `expiresAt`, `usedAt`, `usedByUserId`.
- `Session`: `userId`, `refreshTokenHash`, `revokedAt`, `expiresAt`.
- Invariants: a token is single-use, a Google subject maps to at most one user, and invite consumption is transactional.
- Tests: `BE-E2E-AUTH-002`, `BE-E2E-AUTH-003`, `BE-E2E-AUTH-004`.

## Frontend Contract
- Entry screen shows one primary Google sign-in button and one invite token field.
- Loading state disables both actions while the OAuth redirect or callback is in flight.
- Error states distinguish provider failure from invite failure.
- Success transitions to the app shell only after the session is valid.
- Tests: `FE-UNIT-AUTH-001`, `FE-UNIT-AUTH-002`, `FE-UNIT-AUTH-003`, `FE-UNIT-AUTH-004`.

## Event Contract
- `auth:session-updated`: emitted when session state changes so the desktop shell can refresh route guards and user chrome.
- Payload: `{ userId, authenticated, inviteRequired }`.
- Tests: `BE-E2E-AUTH-004`, `FE-UNIT-AUTH-004`.
