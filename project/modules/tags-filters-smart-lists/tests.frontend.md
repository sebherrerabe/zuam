---
id: tags-filters-smart-lists
title: Tags Filters and Smart Lists Frontend Tests
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

# Frontend Tests

- `FE-UNIT-TF-001`: sidebar renders smart lists, tags, and filters in the correct order with accurate counts.
- `FE-UNIT-TF-002`: saved-filter creation handles loading, empty, validation-error, and success states.
- `FE-E2E-TF-001`: applying a filter updates the task list and preserves an explainable active-filter chip.
- `FE-UNIT-TF-003`: mobile and desktop layouts both keep the taxonomy sections accessible without collapsing them into hidden-only controls.
