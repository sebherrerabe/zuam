---
id: google-calendar-context
title: Google Calendar Context Work Packet
status: ready
phase: 2
owners:
  - Backend Engineer
depends_on:
  - core-data-model-crud
  - google-tasks-sync
parallel_group: calendar-context
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-08
---

# Work Packet

## Objective
Define a deterministic calendar-context read model that downstream scheduling and task surfaces can trust.

## Files / Packages Expected To Change
- Calendar sync and suggestion contracts.
- Calendar context read-model types.

## Contracts To Implement First
- Busy-block normalization.
- Free-window derivation.
- Suggestion rationale contract.

## Tests To Create First
- `BE-UNIT-GCAL-001`, `BE-UNIT-GCAL-003`, `BE-UNIT-GCAL-004`.
- `FE-UNIT-GCAL-001`, `FE-UNIT-GCAL-002`, `FE-E2E-GCAL-001`.

## Blockers / Dependencies
- Needs the task model and sync ownership rules to already exist.

## Parallel-Safe Boundaries
- Can be worked alongside filter/taxonomy docs as long as the task schema contract is stable.

## Completion Signals
- The app can explain why a slot is suggested without exposing raw Google API objects.

## Non-Goals
- No event editing.
- No auto-scheduling write-back.

## Rollback / Risk Notes
- If slot derivation becomes fuzzy, downstream scheduling will be untrustworthy; keep the read model explicit and minimal.
