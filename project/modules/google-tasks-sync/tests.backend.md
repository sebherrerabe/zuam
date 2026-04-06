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

# Backend Test Spec

## `BE-E2E-SYNC-001` Full import on first sync
- Given a connected Google account with lists and tasks, when the first sync runs, then local lists and tasks are created with stable IDs and a sync cursor is stored.
- Assert duplicate remote items are not imported twice.

## `BE-E2E-SYNC-002` Incremental sync and webhook trigger
- Given a stored cursor, when the provider signals new activity or the poller runs, then only changed items are fetched and merged.
- Assert webhook or polling signals queue a single sync cycle and do not race each other.

## `BE-E2E-SYNC-003` Conflict resolution
- Given the same synced field changed both locally and remotely, when sync merges the record, then the Google value wins for synced fields.
- Assert the merge is deterministic and emits one updated task event.

## `BE-E2E-SYNC-004` App-only field preservation
- Given sections, tags, priority, or nudge fields on a task, when Google sync updates the task, then those app-only fields remain unchanged.
- Assert plain-text `notes` fallback is written without stripping local-only data.

## `BE-E2E-SYNC-005` Error and retry handling
- Given provider failure or invalid credentials, when sync runs, then the module records a recoverable failure state and does not corrupt local data.
- Assert repeated sync attempts reuse the latest valid cursor.
