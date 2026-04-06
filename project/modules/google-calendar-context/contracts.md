---
id: google-calendar-context
title: Google Calendar Context Contracts
status: draft
phase: 2
owners:
  - Backend Engineer
depends_on:
  - core-data-model-crud
  - google-tasks-sync
parallel_group: calendar-context
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-04
---

# Contracts

## Data Contract
- `BusyBlock` captures start, end, source calendar, and confidence level (`BE-UNIT-GCAL-001`).
- `FreeWindow` is derived from busy blocks and user work hours, not stored as raw Google state (`BE-UNIT-GCAL-002`).
- `ScheduleSuggestion` records candidate slot, rationale, and blocking busy windows (`BE-E2E-GCAL-001`).

## API Contract
- `GET /sync/google/calendar` or an equivalent sync read path returns normalized busy blocks and refresh metadata (`BE-UNIT-GCAL-003`).
- Suggestion endpoints return a deterministic list of candidate slots with a human-readable reason string (`BE-E2E-GCAL-001`).

## UI Contract
- Task detail and focus-queue surfaces may display calendar-busy warnings, free-slot hints, and "best next slot" suggestions (`FE-UNIT-GCAL-001`).

## Event Contract
- `calendar:refreshed` and `schedule:suggested` events notify the client when context changes or a new slot is computed (`BE-UNIT-GCAL-003`).
