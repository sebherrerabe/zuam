---
id: task-detail-basic-editor
title: Task Detail Basic Editor
status: ready
phase: 1
owners:
  - Frontend Engineer
depends_on:
  - desktop-shell-layout
  - core-data-model-crud
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-1-desktop
last_updated: 2026-04-08
---

# Task Detail Basic Editor

## Objective
Define the right-panel task detail experience for Phase 1 using a plain-text editor and core metadata controls.

## Scope In
- Task title, notes/body, due date, priority, list/section metadata, and subtasks.
- Inline editing, autosave, and dirty-state handling.
- Plain-text editor only; rich block editing is Phase 2.

## Scope Out
- TipTap block editor, slash commands, and attachment uploads.
- Focus-session controls and advanced nudge configuration.
- Dedicated focus-session, calendar-context, and progression modules may render adjacent contextual cards in later-phase design explorations, but they do not expand the Phase 1 editing obligations of this module.

## Requirements
- `TDE-REQ-1`: Selecting a task opens the detail panel with title, metadata, and editable notes/body. Tests: `FE-UNIT-TDE-001`, `FE-E2E-TDE-001`.
- `TDE-REQ-2`: Editing must support autosave, validation, and visible dirty/saving/error states. Tests: `FE-UNIT-TDE-002`, `FE-E2E-TDE-002`.
- `TDE-REQ-3`: The detail panel must allow subtask create/complete/delete flows from the task context. Tests: `FE-UNIT-TDE-003`, `FE-E2E-TDE-003`.
- `TDE-REQ-4`: The plain-text body editor must preserve line breaks and Google sync fallback semantics. Tests: `BE-UNIT-TDE-001`, `BE-E2E-TDE-001`.

## Dependency Notes
- Requires task identity and save contracts from `core-data-model-crud`.
- Must interoperate with shell selection state from `desktop-shell-layout`.

## Figma Reference
- Fetch `1:255` `Detail` via the Figma plugin before implementing or revising this module.
- Use `get_design_context` for `1:255`, then `get_screenshot` to validate spacing, progress treatment, metadata rows, and subtask layout.
- Treat the Focus Session CTA shown in the mockup as phase-gated per ADR-014 rather than proof that all later-phase controls belong in this module now.

