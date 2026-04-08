---
id: task-views
title: Task Views Backend Tests
status: ready
phase: 2
owners:
  - Backend Engineer
depends_on:
  - core-data-model-crud
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-2-views
last_updated: 2026-04-08
---

# Backend Test Specs

## `BE-UNIT-TVW-001`
- Covers `TVW-REQ-4`.
- Assert focus-queue selection returns one task plus a deterministic rationale string for the current inputs.

## `BE-UNIT-TVW-002`
- Covers `TVW-REQ-2`.
- Assert list-query filters respect grouping and sorting parameters without leaking unrelated tasks.

## `BE-E2E-TVW-001`
- Covers `TVW-REQ-1`.
- Assert a shared shell query can restore the last selected view and list context from persisted state.

## `BE-E2E-TVW-002`
- Covers `TVW-REQ-3`.
- Assert move/reorder mutations update section, quadrant, and sort order consistently.

