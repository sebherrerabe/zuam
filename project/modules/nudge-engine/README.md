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

# Objective
Deliver the Phase 1 reminder system: level 1 notifications plus level 2 full-screen desktop dialogs.

## Scope In
- Generate nudges from task state, due date, postponement history, and user preferences.
- Deliver desktop notifications for level 1.
- Deliver always-on-top, explicitly dismissed dialogs for level 2.
- Support snooze and acknowledge flows.
- Track nudge counts and postpone counts for escalation.

## Scope Out
- Level 3 and 4 escalation.
- Android overlay behavior.
- Focus-session timers and calendar-driven scheduling.
- Adaptive copy learning and long-term personalization.

## Requirements
- `NUDGE-REQ-001`: Overdue or postponed tasks can trigger level 1 and level 2 nudges according to the configured strategy. Tests: `NUDGE-BE-001`, `NUDGE-FE-001`.
- `NUDGE-REQ-002`: Level 2 nudges are explicit dialogs that cannot disappear until the user acts. Tests: `NUDGE-BE-002`, `NUDGE-FE-002`.
- `NUDGE-REQ-003`: Snooze and acknowledge actions update task state and nudge history deterministically. Tests: `NUDGE-BE-003`, `NUDGE-FE-003`.
- `NUDGE-REQ-004`: Copy selection reflects task resistance and urgency without guilt-heavy or ambiguous messaging. Tests: `NUDGE-BE-004`, `NUDGE-FE-004`.

## Phase Mapping
- This is a Phase 1 foundation module and desktop-only for the MVP.
- Later escalation levels are intentionally out of scope here.

## Figma Reference
- This module has no dedicated frozen light-mode nudge modal frame in the current Figma file.
- Fetch `1:19` `Desktop Shell — Today` and `1:255` `Detail` as the nearest visual references, then record the modal/notification treatment as an explicit inference.
- Frontend work must still use the Figma plugin and compare against fetched screenshots, even when the exact nudge surface is inferred from the surrounding light-mode language.
