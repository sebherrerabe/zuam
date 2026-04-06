---
id: google-calendar-context
title: Google Calendar Context Frontend Tests
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

# Frontend Tests

- `FE-UNIT-GCAL-001`: task detail renders busy/free context and a suggested next slot when calendar data exists.
- `FE-UNIT-GCAL-002`: calendar-aware hints degrade gracefully to an "unknown availability" state when sync is stale.
- `FE-E2E-GCAL-001`: suggested slot UI exposes the rationale string and allows user confirmation or dismissal.
