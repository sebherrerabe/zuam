---
id: nudge-engine
title: Nudge Engine
status: ready
phase: phase-1-foundation
owners:
  - Backend Engineer
  - Frontend Engineer
depends_on:
  - auth-invite-onboarding
  - core-data-model-crud
parallel_group: phase1-nudge
source_of_truth: PRD_Zuam_v0.3.md
last_updated: "2026-04-04"
---

# Frontend Test Spec

## `NUDGE-FE-001` Desktop notification rendering
- Render the level 1 notification with task title, brief explanation, and primary action.
- Verify loading, success, and notification permission-denied states.

## `NUDGE-FE-002` Full-screen level 2 dialog
- Render an always-on-top dialog that blocks interaction with the rest of the shell until the user chooses an action.
- Verify the modal shows task context, cannot be dismissed by clicking outside, and exposes the correct buttons.

## `NUDGE-FE-003` Snooze and acknowledge actions
- Clicking snooze or acknowledge updates the visible state and closes or defers the nudge correctly.
- Verify keyboard and mouse actions both satisfy the contract.

## `NUDGE-FE-004` Copy tone and accessibility
- Render copy matched to the task resistance level without ambiguous or guilt-heavy language.
- Verify focus order, button labels, and high-contrast readability in the dialog.
