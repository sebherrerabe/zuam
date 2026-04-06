---
id: core-data-model-crud
title: Core Data Model and CRUD
status: ready
phase: phase-1-foundation
owners:
  - Backend Engineer
depends_on:
  - auth-invite-onboarding
parallel_group: phase1-data
source_of_truth: PRD_Zuam_v0.3.md
last_updated: "2026-04-04"
---

# Frontend Test Spec

## `FE-UNIT-DATA-001` List and section management states
- Sidebar list creation, rename, reorder, and delete flows render correctly.
- Verify loading, empty, and disabled states for list and section actions.

## `FE-UNIT-DATA-002` Task editing and completion states
- Quick-add and task detail edits update the UI optimistically and recover on failure.
- Verify completion toggles, deletion affordances, and inline validation states.

## `FE-UNIT-DATA-003` Hierarchy and validation feedback
- Moving a task between sections or nesting levels shows the correct allowed and blocked states.
- Verify invalid parent or section choices are prevented in the UI before submission.

## `FE-UNIT-DATA-004` Real-time refresh behavior
- When list, section, or task events arrive, the sidebar and task list reflect the update without a full reload.
- Verify stale selection states are corrected after deletions and reorder operations.
