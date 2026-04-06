---
id: task-views
title: Task Views Frontend Tests
status: draft
phase: 2
owners:
  - Frontend Engineer
depends_on:
  - desktop-shell-layout
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-2-views
last_updated: 2026-04-04
---

# Frontend Test Specs

## `FE-UNIT-TVW-001`
- Covers `TVW-REQ-1`.
- Switching views preserves the active task and list selection while updating only the main panel content.

## `FE-UNIT-TVW-002`
- Covers `TVW-REQ-2`.
- Group and sort controls reorder tasks correctly for time, priority, tag, and manual order.

## `FE-UNIT-TVW-003`
- Covers `TVW-REQ-3`.
- Drag/drop from list to kanban or matrix updates the rendered placement immediately.

## `FE-E2E-TVW-001`
- Loading a saved view opens the expected surface and restores filters.

## `FE-E2E-TVW-002`
- Empty and loading states render distinct copy for list and calendar views.

## `FE-E2E-TVW-003`
- Dragging a task between kanban columns updates the sidebar count and detail state.

## `FE-E2E-TVW-004`
- Focus queue shows one task at a time with a reason panel and a next-action button.

