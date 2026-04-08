---
id: tags-filters-smart-lists
title: Tags Filters and Smart Lists Contracts
status: ready
phase: 2
owners:
  - Product Manager
depends_on:
  - core-data-model-crud
parallel_group: taxonomy
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-08
---

# Contracts

## Data Contract
- `Tag` is the canonical user taxonomy record. `id` is the persistence key, `slug` is the stable public identifier, and `name` is the display label. Slugs are unique per user, case-insensitive, and normalized to lowercase kebab case (`BE-UNIT-TF-001`).
- `TaskQueryFilter` is the resolved runtime query shape used by sidebar counts and list rendering. It includes normalized clauses for `listIds`, `sectionIds`, `tagSlugs`, `priority`, `status`, `energy`, `resistance`, `dueDateRange`, `text`, and `includeDeleted` / `includeCompleted` flags.
- `SmartListPredicate` is a deterministic predicate descriptor, not persisted membership. The built-in predicates are:
  - `today`: incomplete, non-deleted tasks due on or before the current local day, including overdue items.
  - `next7days`: incomplete, non-deleted tasks due within the current day plus the next six days.
  - `inbox`: incomplete, non-deleted tasks with no section assignment.
  - `completed`: tasks whose completion state is done and that are not deleted.
  - `wontDo`: tasks explicitly marked as won’t do.
  - `trash`: deleted tasks.
- `SavedFilterAst` is an explicit boolean tree over filterable task fields. It supports `and`, `or`, `not`, and leaf predicates for list, section, tag, status, priority, energy, resistance, due-date, and keyword matching.
- `SavedFilter` stores `id`, `name`, `ast`, `sortOrder`, `isPinned`, `createdAt`, `updatedAt`, and optional `description`.

## API Contract
- Query endpoints return both the result set and the resolved `TaskQueryFilter` so the UI can explain why a task matched (`BE-E2E-TF-001`).
- Sidebar count endpoints use the same resolved predicate as list rendering, not a separate approximation (`BE-UNIT-TF-002`).
- Filter compilation must reject invalid AST nodes or unsupported field/operator combinations with validation errors, not silent empty sets (`BE-UNIT-TF-005`).

## UI Contract
- The sidebar renders built-in smart lists first, then user lists, then Tags, then Filters (`FE-UNIT-TF-001`).
- Saved filters keep the sidebar structure stable while their own section shows loading, empty, validation-error, and success states (`FE-UNIT-TF-002`).
- Applying a filter must preserve an explainable active-filter chip that can be removed without losing the underlying list context (`FE-E2E-TF-001`).

## Event Contract
- Tag assignment, filter saves, and smart-list recalculation invalidate sidebar counts immediately on mutation success or on the next refresh tick.
- Filter compilation and smart-list evaluation emit the same explanation text used by the list and sidebar count surfaces.
