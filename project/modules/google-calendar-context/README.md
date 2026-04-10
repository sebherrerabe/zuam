---
id: google-calendar-context
title: Google Calendar Context
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

# Google Calendar Context

This module defines how Zuam reads calendar busy/free context and turns it into scheduling guidance on the real backend runtime. It is shipping-track ready when the app can explain why a task is suggested for a slot, what busy blocks caused that recommendation, and how the persisted calendar snapshot recovered after refresh or restart.

## Scope In
- Read-only Google Calendar context ingestion through a real `GoogleCalendarClient` adapter (`BE-UNIT-GCAL-001`).
- Busy/free window normalization for scheduling and focus-session suggestions (`BE-UNIT-GCAL-002`).
- Task detail and focus-queue calendar awareness (`FE-UNIT-GCAL-001`).
- Sync fallback and refresh rules for stale calendar state (`BE-UNIT-GCAL-003`).
- Partial-failure handling when one calendar source fails but the rest succeed (`BE-UNIT-GCAL-005`).
- Persisted `CalendarContextSnapshot` records plus refresh/lock state for restart-safe reads.

## Scope Out
- Calendar event editing and bidirectional event write-back.
- Full auto-scheduler; only context and suggestion contracts are defined here.
- Hidden event-body parsing or calendar-specific editing UIs.

## Implementation Gate
- This slice is on the active shipping track even though it remains a Phase 2 module.
- It is ready when the app can explain why a task is suggested for a slot, what busy blocks caused that recommendation, and how stale/partial snapshots are surfaced from the real backend runtime (`BE-E2E-GCAL-001`, `BE-E2E-GCAL-002`).

## Google Reference
- Read `google-reference.md` in this module before implementing calendar availability, sync tokens, or watch channels.
