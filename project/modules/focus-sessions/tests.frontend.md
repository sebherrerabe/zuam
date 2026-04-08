---
id: focus-sessions
title: Focus Sessions Frontend Tests
status: ready
phase: 2
owners:
  - Frontend Engineer
depends_on:
  - task-detail-basic-editor
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-2-focus
last_updated: 2026-04-08
---

# Frontend Test Specs

## `FE-UNIT-FCS-001`
- Covers `FCS-REQ-2`.
- Render countdown, progress bar, and state transitions for work, paused, and break modes.

## `FE-UNIT-FCS-002`
- Covers `FCS-REQ-4`.
- Break overlay blocks the main surface, offers explicit dismissal, and restores the prior state on close.

## `FE-E2E-FCS-001`
- Starting a focus session from a task detail opens the timer and records the selected task id.

## `FE-E2E-FCS-002`
- Timer completion transitions to break mode and displays the next-session affordance.

## `FE-E2E-FCS-003`
- Manual pause and resume preserve elapsed time and do not reset streak metadata.

## `FE-E2E-FCS-004`
- A blocking nudge arriving during an active session is deferred until the timer is paused or the break overlay is shown.
