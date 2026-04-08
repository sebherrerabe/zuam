---
id: task-views
title: Task Views Work Packet
status: ready
phase: 2
owners:
  - Frontend Engineer
depends_on:
  - desktop-shell-layout
  - core-data-model-crud
  - google-tasks-sync
  - tags-filters-smart-lists
  - google-calendar-context
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-2-views
last_updated: 2026-04-08
---

# Work Packet

## Objective
Implement the core browsing and prioritization views that turn the task store into actionable surfaces.

## Inputs
- Selected list/filter/view state.
- Resolved `TaskQueryFilter` and `TaskViewState`.
- Recommendation rationale payload.

## Outputs
- List, kanban, matrix, calendar, and focus queue surfaces.
- Drag/drop and reorder interactions.
- Persisted view context restoration.

## Tests To Create First
- `FE-UNIT-TVW-001`
- `FE-UNIT-TVW-003`
- `BE-UNIT-TVW-001`

## Blockers And Dependencies
- Requires stable task query shape and move/reorder mutations.

## Parallel-Safe Boundaries
- Kanban/matrix rendering can be built independently from focus-queue rationale if the view contract is frozen.

## Completion Signals
- Switching views never loses context.
- View-specific empty/loading/error states are visibly distinct.

## Non-Goals
- No advanced scoring engine implementation.
- No calendar drag scheduling beyond the documented surface.

## Rollback / Risk Notes
- Risk: too much state duplication if each view owns its own selection model.
- Risk: reorder bugs if drag/drop events mutate both section and sort order ambiguously.

