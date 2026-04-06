---
id: task-detail-basic-editor
title: Task Detail Basic Editor Backend Tests
status: ready
phase: 1
owners:
  - Frontend Engineer
depends_on:
  - core-data-model-crud
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-1-desktop
last_updated: 2026-04-04
---

# Backend Test Specs

## `BE-UNIT-TDE-001`
- Covers `TDE-REQ-4`.
- Assert task update patches preserve plain-text notes and reject unsupported rich-body shapes in Phase 1.

## `BE-UNIT-TDE-002`
- Covers `TDE-REQ-2`.
- Assert save validation returns field-level errors for empty titles and invalid due dates.

## `BE-E2E-TDE-001`
- Covers `TDE-REQ-1`.
- Assert a selected task receives the expected detail payload and updates persist through the API boundary.

## `BE-E2E-TDE-002`
- Covers `TDE-REQ-3`.
- Assert subtask mutations round-trip with the parent task and preserve ordering.

