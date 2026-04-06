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

# Contracts

## REST API
### `POST /tasks/:id/snooze`
- Purpose: postpone the next nudge for a task.
- Request: `{ snoozedUntil?: string, minutes?: number }`.
- Response: updated task and nudge metadata.
- Tests: `NUDGE-BE-003`.

### `POST /tasks/:id/postpone`
- Purpose: shift a task out of the current reminder window and increment postpone history.
- Request: `{ dueDate?: string, reason?: string }`.
- Response: updated task with postpone count.
- Tests: `NUDGE-BE-001`, `NUDGE-BE-003`.

### `POST /nudge/:id/acknowledge`
- Purpose: record that the user dismissed or acted on a nudge.
- Response: updated nudge event state.
- Tests: `NUDGE-BE-002`, `NUDGE-BE-003`.

## Data Contracts
- `Task.nudgeStrategy`, `Task.nudgeFrequencyMin`, `Task.nudgeEscalation`, `Task.snoozedUntil`, `Task.timesPostponed`, `Task.timesNudged`.
- `NudgeEvent`: `id`, `taskId`, `level`, `message`, `scheduledAt`, `deliveredAt`, `acknowledgedAt`, `snoozedUntil`.
- `UserPreferences`: default nudge strategy, frequency, escalation preference, and sound toggle.
- Invariants: level 2 nudges require explicit dismissal, and snooze state suppresses the next scheduled trigger.
- Tests: `NUDGE-BE-001`, `NUDGE-BE-002`, `NUDGE-BE-003`.

## Frontend Contract
- Level 1 renders as a desktop notification with concise copy and an action to open the task.
- Level 2 renders as an always-on-top modal with task name, reason, estimate, and explicit actions.
- The dialog must block accidental dismissal and preserve state until an action is taken.
- Tests: `NUDGE-FE-001`, `NUDGE-FE-002`, `NUDGE-FE-003`.

## Event Contract
- `nudge:trigger`, `nudge:acknowledge`, `nudge:snooze`.
- Payloads include task id, level, copy id, and timing metadata.
- Tests: `NUDGE-BE-002`, `NUDGE-BE-003`, `NUDGE-FE-003`.
