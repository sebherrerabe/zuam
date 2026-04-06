---
id: task-views
title: Task Views Contracts
status: draft
phase: 2
owners:
  - Frontend Engineer
depends_on:
  - core-data-model-crud
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-2-views
last_updated: 2026-04-04
---

# Contracts

## UI Contracts
- Shared view state includes `activeView`, `groupBy`, `sortBy`, `selectedListId`, `selectedTaskId`, and `filters`.
- Empty, loading, and error states must be view-specific, not generic.
- Focus queue is a single-item surface with explicit rationale copy.

## Data Contracts
- View query shapes accept list, section, tag, date range, and task-state filters.
- Drag/drop updates must translate to section, quadrant, or sort-order mutations depending on the active view.

## Event Contracts
- `view:changed`, `task:moved`, and `task:reordered` are local view events.
- `focusQueue:recommendation` carries task id plus scoring rationale text.

