---
id: public-progression-profiles
title: Public Progression Profiles Work Packet
status: draft
phase: 4
owners:
  - Product Manager
depends_on:
  - player-progression-rewards
parallel_group: social-sharing
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-07
---

# Work Packet

## Objective
Document the minimum opt-in public progression profile system that can ship without turning Zuam into a social network or leaking private task-management data.

## Files / Packages Expected To Change
- Public profile visibility and slug definitions.
- Public-share page contracts.
- Owner-facing privacy controls and previews.

## Contracts To Implement First
- Public snapshot allowlist.
- Link creation and revocation policy.
- Owner preview and consent policy.

## Tests To Create First
- `BE-UNIT-PPP-001`, `BE-UNIT-PPP-002`, `BE-UNIT-PPP-003`.
- `FE-UNIT-PPP-001`, `FE-UNIT-PPP-002`.

## Blockers / Dependencies
- Depends on Phase 3 progression state being stable enough to snapshot and share.
- Requires privacy boundaries for public-safe fields to be frozen first.

## Parallel-Safe Boundaries
- Can be planned in parallel with other Phase 4 modules once progression state and share-export rules are stable.
- Must not redefine the core reward model from `player-progression-rewards`.

## Completion Signals
- A user can explicitly opt into a public profile, preview exactly what becomes public, share a stable URL, and revoke it later.

## Non-Goals
- No leaderboards, comments, follows, or public feeds.
- No public task detail or routine disclosure.

## Rollback / Risk Notes
- If privacy boundaries are fuzzy, public sharing can leak sensitive productivity data; keep the public snapshot allowlist explicit and minimal.
