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

# Frontend Test Spec

## `FE-UNIT-SYNC-001` Sync status visibility
- The desktop shell shows the last sync time, current sync status, and whether Google Tasks is connected.
- Verify loading and empty states before the first sync completes.

## `FE-UNIT-SYNC-002` Manual sync action
- Clicking the refresh action triggers a sync request and disables the control until the request settles.
- Verify duplicate clicks do not create overlapping syncs.

## `FE-UNIT-SYNC-003` Sync failure recovery
- If the backend reports a sync error, show a clear retry action and preserve the current task list view.
- Verify the error state is dismissible without losing data.

## `FE-UNIT-SYNC-004` Real-time update reflection
- When sync events arrive, the sidebar counts and task rows update without a full reload.
- Verify stale syncing indicators clear after success.
