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
last_updated: "2026-04-10"
---

# Backend Test Spec

## `BE-INT-NUDGE-001` Durable schedule persistence
- Persist `NudgeSchedule` and `NudgeEvent` records on disposable Postgres.
- Assert restart recovery keeps the next trigger window and acknowledgement state without duplicate delivery.

## `NUDGE-BE-001` Level selection and trigger timing
- Given task due dates, postponement counts, and user preferences, when the scheduler runs, then the module selects the correct nudge level and records the trigger.
- Assert level 1 is the default first escalation and level 2 activates only when the configured rules are met.

## `NUDGE-BE-002` Level 2 payload and blocking behavior
- Given a level 2 trigger, when the payload is emitted, then it contains the task, estimate, reason, and explicit dismissal requirement.
- Assert the dialog cannot be auto-dismissed by the backend after emission.

## `NUDGE-BE-003` Snooze and acknowledge mutations
- Given a delivered nudge, when snooze or acknowledge is called, then the task state and event history update consistently.
- Assert snoozed events suppress the next scheduled trigger window.

## `NUDGE-BE-004` Copy selection by resistance
- Given low, mild, high, or dread resistance, when copy is selected, then the message bank chooses the matching tone and avoids guilt-heavy text.
- Assert copy selection remains deterministic for the same inputs.

## `BE-E2E-NUDGE-001` Restart-safe schedule execution
- Given persisted schedules before backend restart, when the scheduler resumes, then due nudges run once and only once.

## `BE-E2E-NUDGE-002` Duplicate trigger locking
- Given overlapping scheduler ticks or manual rescan requests, when nudge evaluation starts, then one lock owner proceeds and the others no-op safely.

## `BE-E2E-NUDGE-003` Focus precedence with persisted suppression
- Given an active focus session and an otherwise due nudge, when the scheduler runs, then the nudge is durably suppressed until the documented focus release point.
