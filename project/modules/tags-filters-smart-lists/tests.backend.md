---
id: tags-filters-smart-lists
title: Tags Filters and Smart Lists Backend Tests
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

# Backend Tests

- `BE-UNIT-TF-001`: tag CRUD enforces stable identity and rejects duplicate slugs.
- `BE-UNIT-TF-002`: every smart list resolves to the documented predicate.
- `BE-UNIT-TF-003`: saved-filter AST evaluation returns the same task set as direct query execution.
- `BE-UNIT-TF-004`: sidebar counts match the task results for each built-in list.
- `BE-UNIT-TF-005`: invalid filter criteria return validation errors, not silent empty sets.
- `BE-E2E-TF-001`: each smart list and saved filter resolves to a deterministic predicate that matches the documented sidebar counts.
