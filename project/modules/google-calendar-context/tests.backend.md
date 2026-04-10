---
id: google-calendar-context
title: Google Calendar Context Backend Tests
status: ready
phase: 2
owners:
  - Backend Engineer
depends_on:
  - core-data-model-crud
  - google-tasks-sync
parallel_group: calendar-context
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-10
---

# Backend Tests

- `BE-UNIT-GCAL-001`: busy blocks are normalized from raw Google calendar items into the canonical read model.
- `BE-UNIT-GCAL-002`: stale calendar state triggers a refresh path instead of serving silently expired suggestions.
- `BE-UNIT-GCAL-003`: slot suggestions never overlap with busy blocks.
- `BE-UNIT-GCAL-004`: suggestion output includes the rationale and the blocking calendar windows.
- `BE-UNIT-GCAL-005`: sync fallback returns a useful partial result when one calendar source fails.
- `BE-INT-GCAL-001`: `GoogleCalendarContextDao` persists `CalendarContextSnapshot` and refresh state on disposable Postgres.
- `BE-INT-GCAL-002`: calendar snapshot recovery after restart preserves `fresh`, `stale`, and `partial` semantics.
- `BE-E2E-GCAL-001`: a task with calendar-aware context can surface a slot suggestion and explain the blockers that prevented tighter scheduling.
- `BE-E2E-GCAL-002`: partial calendar failure still returns an explicit partial/unknown availability response without pretending the schedule is complete.
- `BE-E2E-GCAL-003`: stale snapshot refresh acquires one durable lock and recovers safely after restart or provider outage.
