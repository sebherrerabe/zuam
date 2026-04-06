---
id: auth-invite-onboarding-google-reference
title: Google Auth Reference
status: ready
phase: phase-1-foundation
owners:
  - Backend Engineer
  - Frontend Engineer
depends_on:
  - auth-invite-onboarding
parallel_group: phase1-auth
source_of_truth:
  - project/modules/auth-invite-onboarding/README.md
  - PRD_Zuam_v0.3.md
last_updated: "2026-04-05"
---

# Google Auth Reference

This file captures the Google-specific implementation decisions for Zuam auth so future agents do not need to re-read the Google Identity docs before building Phase 1 and Phase 2 auth flows.

## Official Docs Reviewed
- OAuth 2.0 for web server apps: https://developers.google.com/identity/protocols/oauth2/web-server
- OAuth 2.0 for iOS and desktop apps: https://developers.google.com/identity/protocols/oauth2/native-app
- OAuth 2.0 policies: https://developers.google.com/identity/protocols/oauth2/policies
- OpenID Connect overview: https://developers.google.com/identity/openid-connect/openid-connect
- Verify Google ID token on the server: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
- Google Tasks scopes: https://developers.google.com/workspace/tasks/auth
- Google Calendar scopes: https://developers.google.com/workspace/calendar/api/auth

Reviewed on 2026-04-05.

## Zuam Decisions Frozen From The Docs

### 1. Zuam uses the backend web-server OAuth flow
- Zuam should use the Google OAuth 2.0 web-server flow from the NestJS backend.
- Reason: Google documents the web-server flow for applications that can securely store confidential information and maintain state.
- This means the backend owns the Google client secret, the authorization-code exchange, refresh-token storage, and token refresh.

### 2. Desktop and mobile must use the system browser for Google auth
- Electron and Expo entry points should open the system browser for the Google consent flow.
- Do not run Google auth inside an embedded browser surface.
- This decision is based on Google's native-app guidance and the documented `disallowed_useragent` error for embedded user agents.
- Inference from the sources: this rule should also be applied to Electron `BrowserWindow` auth popups to avoid policy and compatibility problems.

### 3. Separate OAuth clients are required per platform
- Google policy requires a separate OAuth client for each platform.
- Zuam should register at least:
  - one web OAuth client for the backend callback flow
  - one Android OAuth client if the mobile app later performs native Google identity operations
- Do not reuse a web client for native Android auth.
- If desktop later moves to a true installed-app OAuth flow instead of browser-to-backend auth, create a separate desktop client at that time.

### 4. Request offline access and incremental authorization
- The backend auth flow must request `access_type=offline`.
- The backend auth flow should request `include_granted_scopes=true`.
- Reason: Zuam needs long-lived background access for sync without the user being present, and Google recommends incremental authorization as a best practice.
- Persist the refresh token securely when Google returns it. In Google's Node guidance, the refresh token commonly arrives on first authorization and should be stored when emitted.

### 5. Use OpenID scopes for identity, not API-specific userinfo fallbacks
- Zuam should request `openid email profile` for base identity.
- Use the ID token's `sub` claim as the durable external user key.
- Do not use email as the primary identifier because Google documents that email can change.
- Backend ID-token verification must validate signature, `aud`, `iss`, and `exp`.
- If Zuam ever restricts access by Workspace domain, validate the `hd` claim explicitly.

### 6. Scope rollout should be phased
- Phase 1 auth bundle:
  - `openid`
  - `email`
  - `profile`
  - `https://www.googleapis.com/auth/tasks`
- Phase 2 calendar-read bundle:
  - keep Phase 1 scopes
  - add `https://www.googleapis.com/auth/calendar.calendarlist.readonly`
  - add `https://www.googleapis.com/auth/calendar.freebusy`
- Only add `https://www.googleapis.com/auth/calendar.events.readonly` if the product actually needs event titles or event-level read models.
- Only add `https://www.googleapis.com/auth/calendar.events` when Zuam starts creating or editing calendar events.

This scope rollout is an inference from Google's scope docs plus Zuam's phase plan. It intentionally chooses the narrowest scope bundle that satisfies each phase.

## Backend Implementation Notes
- Authorized redirect URIs must match exactly, or Google returns `redirect_uri_mismatch`.
- Keep the callback route stable and environment-specific, for example:
  - local: `http://localhost:<port>/auth/google/callback`
  - production API: `https://api.<domain>/auth/google/callback`
- Store Google refresh tokens outside source control and treat them like secrets.
- If multiple OAuth clients can access the same backend, the backend verifier must allow the correct audience list.

## Desktop And Mobile Notes
- Desktop and mobile should redirect into the backend auth start route, not talk directly to Google for API tokens in Phase 1.
- If mobile later uses a native Google sign-in SDK, that SDK should still hand identity to the backend; the backend remains the system of record for Google API access.

## Failure Modes Agents Must Handle
- `redirect_uri_mismatch`: the configured redirect URI and request URI differ exactly.
- `disallowed_useragent`: the consent screen was opened in an embedded browser surface.
- Missing refresh token: the app did not ask for offline access, or the user previously granted consent without the needed constraints.
- Unverified app warning: public production rollout with sensitive scopes requires Google verification.
- Partial-grant scenarios: Google documents that when multiple scopes are requested, the app must check which scopes were actually granted.

## Recommended Zuam Test Additions
- Add one backend e2e test that fails when the callback is configured with a non-matching redirect URI.
- Add one backend e2e test that proves the stored Google external identity key is `sub`, not email.
- Add one backend e2e test for phased re-consent when calendar scopes are added after tasks-only authorization.

## Source Highlights
- Google policy says each platform needs its own OAuth client.
- Google web-server docs say offline access is required for background token refresh.
- Google web-server docs recommend incremental authorization with `include_granted_scopes=true`.
- Google ID-token docs say to use `sub` as the unique identifier and not email.
