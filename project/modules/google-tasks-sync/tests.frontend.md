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
last_updated: "2026-04-08"
---

# Frontend Test Spec

## Figma Validation Baseline
- No dedicated frozen light mockup exists yet for the sync widget.
- Use node `155:3` `Desktop Shell — Today (light)` in file `OsyWf2xeC712smZfYoaatq` as the host-shell reference.
- Frontend agents must fetch `155:3` with the Figma plugin using `get_design_context`, then `get_screenshot`, and explicitly record sync-chip/card styling as an inference rather than a direct pixel match.

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

## `FE-VIS-SYNC-001`
- Compare the implemented sync-status surface against the fetched host-shell screenshot for node `155:3`.
- Verify the surface reads as native to the shell's light-mode spacing, typography, and accent system, and record any placement or container styling as intentional inference.
