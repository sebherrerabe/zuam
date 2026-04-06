---
id: task-detail-basic-editor
title: Task Detail Basic Editor Work Packet
status: ready
phase: 1
owners:
  - Frontend Engineer
depends_on:
  - desktop-shell-layout
  - core-data-model-crud
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-1-desktop
last_updated: 2026-04-04
---

# Work Packet

## Objective
Build the first-pass editable task detail panel with reliable save semantics.

## Inputs
- Selected task payload.
- Task patch/save DTO contract.
- Subtask collection model.

## Outputs
- Editable detail panel.
- Validation and save state indicators.
- Subtask interactions in-panel.

## Tests To Create First
- `FE-UNIT-TDE-001`
- `FE-UNIT-TDE-002`
- `BE-UNIT-TDE-001`

## Blockers And Dependencies
- Requires shell selection behavior and API patch contracts.

## Parallel-Safe Boundaries
- Can be implemented alongside list/section CRUD if save DTOs are frozen.

## Completion Signals
- Editing never drops unsaved content accidentally.
- Save and error states are visible and deterministic.

## Non-Goals
- No rich block editor.
- No attachment uploads.
- No nudge controls in Phase 1.

## Rollback / Risk Notes
- Risk: autosave races if the save DTO is not idempotent.
- Risk: nested subtask edits can complicate focus management.

