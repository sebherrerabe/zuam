---
id: task-views
title: Task Views
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

# Task Views

## Objective
Define the multi-view task browsing experience: list, kanban, Eisenhower matrix, calendar, and focus queue. It is implementation-ready when view switching preserves context and drag/drop maps cleanly to the documented mutation contract.

## Scope In
- View switching, grouping, sorting, and empty-state behavior.
- Kanban drag/drop and matrix quadrant interactions.
- Focus queue recommendation surface.
- Read-only calendar hints that consume the calendar-context read model.

## Scope Out
- Deep scheduling optimization and scoring engine internals.
- Cross-device sync orchestration.
- Calendar event editing or write-back.

## Requirements
- `TVW-REQ-1`: View switching must preserve the selected list/task context across list, kanban, matrix, calendar, and focus queue. Tests: `FE-UNIT-TVW-001`, `FE-E2E-TVW-001`.
- `TVW-REQ-2`: List view must support grouping and sorting by the documented modes. Tests: `FE-UNIT-TVW-002`, `BE-UNIT-TVW-002`, `FE-E2E-TVW-002`.
- `TVW-REQ-3`: Kanban and matrix views must support drag/drop or reassignment with visible state updates. Tests: `FE-UNIT-TVW-003`, `BE-E2E-TVW-002`, `FE-E2E-TVW-003`.
- `TVW-REQ-4`: Focus queue must show a single recommended task and explain why it was chosen. Tests: `BE-UNIT-TVW-001`, `FE-E2E-TVW-004`.

