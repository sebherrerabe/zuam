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

# Work Packet

## Objective
Implement the first desktop escalation loop so overdue or postponed tasks can trigger level 1 notifications and level 2 blocking dialogs on the real backend runtime.

## Files and Packages Expected To Change
- `packages/backend/src/reminders/*`
- `packages/backend/src/tasks/*`
- Desktop notification and modal components.
- Shared nudge copy bank and event types.

## Contracts To Implement
- Nudge trigger, snooze, and acknowledge routes or service calls.
- Event payloads for delivery to the desktop shell.
- Copy selection rules based on resistance and urgency.
- `NudgesDao` with durable `NudgeSchedule`, delivery history, and scheduler locking.

## Tests To Create First
- `BE-INT-NUDGE-001`
- `NUDGE-BE-001` through `NUDGE-BE-004`.
- `NUDGE-FE-001` through `NUDGE-FE-004`.

## Blockers and Dependencies
- Depends on stable task mutation history and user preferences.
- Depends on the desktop shell being able to host always-on-top modal UI.

## Parallel-Safe Boundaries
- Copy-bank selection can be implemented independently from the scheduling rules if the payload shape stays fixed.
- The front-end modal can be built against mock nudge events before the scheduler is complete, but mock events are scaffold-only.

## Completion Signals
- A postponed task can surface as a level 1 notification and escalate to a level 2 dialog on schedule.
- Snooze and acknowledge actions round-trip through the backend and reflect in the UI.
- Schedule state survives backend restart and duplicate scheduler triggers do not double-deliver nudges.

## Non-Goals
- No Android overlays.
- No level 3 or level 4 escalation.
- No advanced personalization or learning loop.

## Risks
- Notification and modal behavior must be deterministic or UI tests will flake.
- Escalation timing should stay separate from the task CRUD layer to avoid accidental coupling.
