---
id: google-tasks-sync
title: Google Tasks Sync
status: ready
phase: phase-1-foundation
owners:
  - Backend Engineer
depends_on:
  - auth-invite-onboarding
  - core-data-model-crud
parallel_group: phase1-sync
source_of_truth: PRD_Zuam_v0.3.md
last_updated: "2026-04-10"
---

# Work Packet

## Objective
Import Google Tasks into the local model and keep synced fields aligned with low-latency bidirectional updates on the real backend runtime.

## Files and Packages Expected To Change
- `packages/backend/src/sync/*`
- `packages/backend/src/tasks/*`
- Google API client wrapper and sync state persistence.
- Desktop sync-status UI and refresh control.

## Contracts To Implement
- Sync force endpoint and status endpoint.
- Trusted runtime trigger entrypoint for scheduler-driven freshness checks.
- Merge rules for synced and app-only fields.
- `GoogleTasksClient` and `GoogleTasksSyncDao` interfaces with durable cursor and lock behavior.

## Tests To Create First
- `BE-INT-SYNC-001`
- `BE-INT-SYNC-002`
- `BE-E2E-SYNC-001` through `BE-E2E-SYNC-005`.
- `FE-UNIT-SYNC-001` through `FE-UNIT-SYNC-004`.

## Blockers and Dependencies
- Depends on the local task/list schema and ownership model being final.
- Requires a stable Google account connection flow from the auth module.

## Parallel-Safe Boundaries
- Local merge logic can be developed against fixtures before the provider client is complete.
- Desktop status UI can be built against mock sync state contracts, but mock sync state is scaffold-only.

## Completion Signals
- First login imports remote lists and tasks correctly.
- Local changes propagate to Google without losing app-only fields.
- Incremental sync resumes safely after restart and duplicate triggers do not run the same sync twice.

## Non-Goals
- No calendar sync.
- No rich text round-tripping.
- No offline sync queue or advanced conflict UI.

## Risks
- Sync loops can happen if merge ownership is not explicit.
- Cursor handling must be durable or incremental sync will duplicate or skip records.
