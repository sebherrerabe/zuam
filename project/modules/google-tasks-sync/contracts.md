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
last_updated: "2026-04-04"
---

# Contracts

## REST API
### `POST /sync/google/tasks`
- Purpose: force a Google Tasks sync cycle.
- Request: optional `{ scope: "full" | "incremental" }`.
- Response: `{ started: true, syncId }`.
- Errors: `401` unauthenticated, `403` token not connected, `409` sync already running.
- Tests: `BE-E2E-SYNC-001`, `BE-E2E-SYNC-002`.

### `GET /sync/status`
- Purpose: report last successful sync times, active sync state, and error summaries.
- Response: `{ googleTasksLastSyncAt, googleTasksStatus, lastError }`.
- Tests: `BE-E2E-SYNC-001`, `FE-UNIT-SYNC-001`.

### `POST /sync/google/tasks/webhook`
- Purpose: accept a Google push notification or provider webhook signal and enqueue a polling pass.
- Response: `202 Accepted`.
- Errors: `400` invalid provider signature or payload.
- Tests: `BE-E2E-SYNC-002`.

## Data Contracts
- `GoogleSyncState`: `userId`, `googleTasksCursor`, `googleTasksLastSyncAt`, `googleTasksStatus`, `googleTasksLastError`.
- `Task` mapping fields: `googleTaskId`, `googleTaskListId`, `title`, `notes`, `dueDate`, `completed`, `completedAt`.
- Invariants: `googleTaskId` uniquely identifies a remote task, and app-only fields are not mutated by Google sync.
- Tests: `BE-E2E-SYNC-003`, `BE-E2E-SYNC-004`.

## Sync Rules
- Full sync imports all remote lists and tasks before incremental sync begins.
- Incremental sync only re-fetches changes after the last known cursor or timestamp.
- Local writes are sent to Google immediately after successful local persistence.
- If the same synced field changes on both sides, Google wins.
- Tests: `BE-E2E-SYNC-001`, `BE-E2E-SYNC-002`, `BE-E2E-SYNC-003`.

## Frontend Contract
- The desktop shell shows sync status, last sync time, and a manual refresh action.
- During sync, the UI enters a loading state and prevents duplicate force-sync requests.
- Sync errors render a recoverable error state with a retry action.
- Tests: `FE-UNIT-SYNC-001`, `FE-UNIT-SYNC-002`, `FE-UNIT-SYNC-003`, `FE-UNIT-SYNC-004`.

## Event Contract
- `sync:started`, `sync:completed`, `sync:failed`, `task:updated`.
- Payloads must include the sync scope, user id, and affected entity ids.
- Tests: `BE-E2E-SYNC-002`, `BE-E2E-SYNC-003`, `FE-UNIT-SYNC-001`.
