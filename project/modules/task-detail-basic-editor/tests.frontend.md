---
id: task-detail-basic-editor
title: Task Detail Basic Editor Frontend Tests
status: ready
phase: 1
owners:
  - Frontend Engineer
depends_on:
  - desktop-shell-layout
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-1-desktop
last_updated: 2026-04-04
---

# Frontend Test Specs

## `FE-UNIT-TDE-001`
- Covers `TDE-REQ-1`.
- Opening a task populates title, metadata, and body fields without losing the selected task focus.

## `FE-UNIT-TDE-002`
- Covers `TDE-REQ-2`.
- Typing into the editor transitions through dirty and saving states, then clears dirty state on success.

## `FE-UNIT-TDE-003`
- Covers `TDE-REQ-3`.
- Subtask add/complete/delete actions remain scoped to the selected task and update progress indicators.

## `FE-E2E-TDE-001`
- Editing a task body and blurring the field persists the change after a reload.

## `FE-E2E-TDE-002`
- Invalid title input shows an inline error and blocks submit until corrected.

## `FE-E2E-TDE-003`
- Switching between two tasks preserves each task's unsaved draft state until save or discard.

