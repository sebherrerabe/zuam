---
id: tags-filters-smart-lists
title: Tags Filters and Smart Lists Contracts
status: draft
phase: 2
owners:
  - Product Manager
depends_on:
  - core-data-model-crud
  - task-views
parallel_group: taxonomy
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-04
---

# Contracts

## Data Contract
- `Tag` is a reusable label attached to tasks and subtasks, with slug/name identity and no hidden side effects (`BE-UNIT-TF-001`).
- `SmartList` is a system-generated predicate, not a persisted manual list membership record (`BE-UNIT-TF-002`).
- `SavedFilter` stores an explicit query AST made from list, tag, priority, date, completion, energy, resistance, and keyword criteria (`BE-UNIT-TF-003`).

## API Contract
- Filter endpoints return both the result set and the resolved predicate so the UI can explain why a task matched (`BE-E2E-TF-001`).
- Sidebar count endpoints must be consistent with the same predicate used in list rendering (`BE-UNIT-TF-002`).

## UI Contract
- The sidebar must render built-in smart lists above user lists, followed by Tags and Filters sections (`FE-UNIT-TF-001`).
- Saved filters must support empty, loading, and error states without collapsing the sidebar structure (`FE-UNIT-TF-002`).

## Event Contract
- Tag assignment, filter saves, and smart-list recalculation should invalidate sidebar counts in real time or on the next refresh tick (`BE-UNIT-TF-003`).
