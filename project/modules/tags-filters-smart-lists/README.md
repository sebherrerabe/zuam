---
id: tags-filters-smart-lists
title: Tags Filters and Smart Lists
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

# Tags, Filters, and Smart Lists

This module defines the task taxonomy layer: tags, saved filters, and the built-in smart lists that structure the sidebar and every cross-list view. It is implementation-ready when every built-in list and saved filter resolves to a deterministic predicate with a matching explanation string and count.

## Scope In
- Tag identity, rename, and de-duplication rules (`BE-UNIT-TF-001`).
- Smart-list predicates for Today, Next 7 Days, Inbox, Completed, Won't Do, and Trash (`BE-UNIT-TF-002`).
- Saved-filter AST for multi-criteria queries (`BE-UNIT-TF-003`).
- Sidebar count and filter state presentation, including explainable active-filter chips (`FE-UNIT-TF-001`, `FE-E2E-TF-001`).

## Scope Out
- Tag color customization and advanced taxonomy tooling beyond the initial query model.
- Shared/team tagging.
- Collaborative list membership or multi-user taxonomy.

## Implementation Gate
- This slice is ready when the query language, smart-list semantics, and sidebar counts can be implemented without another product decision (`BE-E2E-TF-001`).
