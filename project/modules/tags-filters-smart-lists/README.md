---
id: tags-filters-smart-lists
title: Tags Filters and Smart Lists
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

# Tags, Filters, and Smart Lists

This module defines the task taxonomy layer: tags, saved filters, and the built-in smart lists that structure the sidebar and every cross-list view. It is planning-critical because it governs what users can see, filter, and count across the app.

## Scope In
- Tag semantics and assignment rules (`BE-UNIT-TF-001`).
- Smart-list definitions for Today, Next 7 Days, Inbox, Completed, Won't Do, and Trash (`BE-UNIT-TF-002`).
- Saved-filter model for multi-criteria queries (`BE-UNIT-TF-003`).
- Sidebar count and filter state presentation (`FE-UNIT-TF-001`).

## Scope Out
- Tag color customization and advanced taxonomy tooling beyond the initial query model.
- Shared/team tagging.

## Implementation Gate
- This slice is ready when every built-in list and saved filter can be explained as a deterministic predicate over task data (`BE-E2E-TF-001`).
