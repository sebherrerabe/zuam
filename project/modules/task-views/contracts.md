---
id: task-views
title: Task Views Contracts
status: ready
phase: 2
owners:
  - Frontend Engineer
depends_on:
  - core-data-model-crud
  - tags-filters-smart-lists
  - google-calendar-context
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-2-views
last_updated: 2026-04-08
---

# Contracts

## UI Contracts
- Shared persisted view state is `TaskViewState` and includes `activeView`, `groupBy`, `sortBy`, `selectedListId`, `selectedTaskId`, `filters`, and `sidebarCollapsed`.
- View switching must preserve the active list and task context while only the main presentation changes.
- Empty, loading, and error states must be view-specific, not generic.
- Focus queue is a single-item surface with explicit rationale copy and a next-action affordance.

## Data Contracts
- View query shapes consume the resolved `TaskQueryFilter` from the taxonomy layer.
- `TaskMoveMutation` carries the destination list, section, quadrant, and/or view placement for drag/drop interactions.
- `TaskReorderMutation` carries the new relative order within the active grouping scope.
- Drag/drop updates must translate to section, quadrant, or sort-order mutations depending on the active view.
- Calendar view is read-only in this wave; it can surface availability hints but cannot mutate task or calendar state.

## Event Contracts
- `view:changed`, `task:moved`, and `task:reordered` are local view events.
- `focusQueue:recommendation` carries task id plus scoring rationale text and a stable explanation string.

