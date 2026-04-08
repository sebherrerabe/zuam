---
id: google-calendar-context
title: Google Calendar Context Contracts
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

# Contracts

## Data Contract
- `CalendarContextState` tracks `fresh`, `stale`, `partial`, or `unknown` availability, plus `lastSyncedAt`, `sourceCalendarCount`, and `syncTokenState`.
- `BusyBlock` captures `id`, `calendarId`, `calendarName`, `startAt`, `endAt`, `allDay`, `source`, and `confidence`.
- `FreeWindow` is derived from busy blocks and user work hours, not stored as raw Google state. It captures `startAt`, `endAt`, `durationMinutes`, and `confidence`.
- `ScheduleSuggestion` records `taskId`, `candidateStartAt`, `candidateEndAt`, `rationale`, `blockingBusyBlocks`, `confidence`, and `generatedAt`.

## API Contract
- `GET /sync/google/calendar` or an equivalent sync read path returns normalized busy blocks and refresh metadata (`BE-UNIT-GCAL-003`).
- Suggestion endpoints return a deterministic list of candidate slots with a human-readable reason string and the blocking windows used to derive it (`BE-E2E-GCAL-001`).
- The read model is derived from calendar-list plus free/busy reads and never exposes raw Google objects to downstream consumers.

## UI Contract
- Task detail and focus-queue surfaces may display calendar-busy warnings, free-slot hints, and "best next slot" suggestions (`FE-UNIT-GCAL-001`).
- When calendar state is stale or partial, the UI falls back to an explicit unknown-availability state instead of pretending the schedule is certain (`FE-UNIT-GCAL-002`).

## Event Contract
- `calendar:refreshed` and `schedule:suggested` events notify the client when context changes or a new slot is computed (`BE-UNIT-GCAL-003`).
- Refresh events carry the current availability state so the frontend can distinguish fresh, stale, and partial results.
