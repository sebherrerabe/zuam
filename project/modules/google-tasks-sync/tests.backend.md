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

# Backend Test Spec

## `BE-INT-SYNC-001` Sync state persistence on disposable Postgres
- Persist `TaskSyncState`, remote ID mappings, and recoverable error state through `GoogleTasksSyncDao`.
- Assert a new sync process can resume from the stored cursor after restart.

## `BE-INT-SYNC-002` Durable sync lock behavior
- Assert only one sync run acquires the lock for a user at a time and expired locks can recover safely after simulated crash/restart.

## `BE-E2E-SYNC-001` Full import on first sync
- Given a connected Google account with lists and tasks, when the first sync runs, then local lists and tasks are created with stable IDs and a sync cursor is stored.
- Assert duplicate remote items are not imported twice.

## `BE-E2E-SYNC-002` Incremental sync and runtime trigger convergence
- Given a stored cursor, when the poller or another trusted runtime trigger signals fresh work, then only changed items are fetched and merged.
- Assert concurrent trigger paths queue a single sync cycle and do not race each other.

## `BE-E2E-SYNC-003` Conflict resolution
- Given the same synced field changed both locally and remotely, when sync merges the record, then the Google value wins for synced fields.
- Assert the merge is deterministic and emits one updated task event.

## `BE-E2E-SYNC-004` App-only field preservation
- Given sections, tags, priority, or nudge fields on a task, when Google sync updates the task, then those app-only fields remain unchanged.
- Assert plain-text `notes` fallback is written without stripping local-only data.

## `BE-E2E-SYNC-005` Error and retry handling
- Given provider failure or invalid credentials, when sync runs, then the module records a recoverable failure state and does not corrupt local data.
- Assert repeated sync attempts reuse the latest valid cursor.

## `BE-E2E-SYNC-006` Duplicate trigger suppression
- Given webhook, poller, and manual trigger signals arriving together, when sync dispatch runs, then one durable run executes and the others exit without double-importing or double-pushing.

## `BE-E2E-SYNC-007` Stale cursor recovery
- Given a stale or rejected provider cursor, when incremental sync runs, then the module resets safely to the documented recovery path without dropping local app-only fields.
