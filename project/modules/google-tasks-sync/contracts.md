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

### `POST /sync/google/tasks/trigger`
- Purpose: accept an internal freshness signal from the scheduler or other trusted runtime path and enqueue a polling pass.
- Response: `202 Accepted`.
- Errors: `400` invalid trigger payload.
- Tests: `BE-E2E-SYNC-002`.

## Data Contracts
- `TaskSyncState`: `userId`, `googleTasksCursor`, `googleTasksLastSyncAt`, `googleTasksStatus`, `googleTasksLastError`, `activeRunId`, `lockExpiresAt`.
- `Task` mapping fields: `googleTaskId`, `googleTaskListId`, `title`, `notes`, `dueDate`, `completed`, `completedAt`.
- Invariants: `googleTaskId` uniquely identifies a remote task, and app-only fields are not mutated by Google sync.
- Tests: `BE-E2E-SYNC-003`, `BE-E2E-SYNC-004`.

## Backend Interface Contract
- `GoogleTasksClient`
  - responsibilities: fetch lists/tasks, fetch incremental changes, create/update/complete remote tasks, normalize provider failures
- `GoogleTasksSyncDao`
  - responsibilities: store cursors and run state, acquire/release durable sync lock, persist failure metadata, map remote IDs to local records
- `TasksDao`, `ListsDao`, and `SectionsDao`
  - responsibilities: apply canonical local mutations during sync without exposing Prisma or raw queries to services

## Sync Rules
- Full sync imports all remote lists and tasks before incremental sync begins.
- Incremental sync only re-fetches changes after the last known cursor or timestamp.
- Local writes are sent to Google immediately after successful local persistence.
- If the same synced field changes on both sides, Google wins.
- Manual trigger, poller trigger, and other trusted runtime freshness signals converge on one idempotent sync path guarded by a durable single-run lock.
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

## Runtime Notes
- The real Google Tasks adapter is the authoritative runtime path.
- Fake Google Tasks providers are test-only and do not satisfy this module's completion gate.
