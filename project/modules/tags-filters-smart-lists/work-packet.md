---
id: tags-filters-smart-lists
title: Tags Filters and Smart Lists Work Packet
status: ready
phase: 2
owners:
  - Product Manager
depends_on:
  - core-data-model-crud
  - task-views
parallel_group: taxonomy
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-08
---

# Work Packet

## Objective
Make taxonomy and saved-filter behavior deterministic so the sidebar, filters, and smart lists all resolve to the same query language.

## Files / Packages Expected To Change
- Planning docs for taxonomy and sidebar behavior.
- Shared query/filter contract docs if a cross-cutting decision must be recorded.

## Contracts To Implement First
- `Tag` identity and slug uniqueness.
- `TaskQueryFilter` runtime shape.
- `SmartListPredicate` definitions for the built-in lists.
- `SavedFilterAst` and `SavedFilter` metadata.

## Tests To Create First
- `BE-UNIT-TF-001`, `BE-UNIT-TF-002`, `BE-UNIT-TF-003`.
- `FE-UNIT-TF-001`, `FE-UNIT-TF-002`, `FE-E2E-TF-001`.

## Blockers / Dependencies
- Requires the core task/list model to exist so predicates have stable fields.

## Parallel-Safe Boundaries
- Can run in parallel with calendar-context planning once the filterable task fields are locked.

## Completion Signals
- A future engineer can add a filter criterion without guessing how the sidebar count logic works.

## Non-Goals
- No collaboration features.
- No advanced tag analytics.

## Rollback / Risk Notes
- Query-language ambiguity will leak into every list view, so the saved-filter AST must stay explicit.
