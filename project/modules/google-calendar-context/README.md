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
last_updated: 2026-04-08
---

# Google Calendar Context

This module defines how Zuam reads calendar busy/free context and turns it into scheduling guidance. It is implementation-ready when the app can explain why a task is suggested for a slot and what busy blocks caused that recommendation.

## Scope In
- Read-only Google Calendar context ingestion (`BE-UNIT-GCAL-001`).
- Busy/free window normalization for scheduling and focus-session suggestions (`BE-UNIT-GCAL-002`).
- Task detail and focus-queue calendar awareness (`FE-UNIT-GCAL-001`).
- Sync fallback and refresh rules for stale calendar state (`BE-UNIT-GCAL-003`).
- Partial-failure handling when one calendar source fails but the rest succeed (`BE-UNIT-GCAL-005`).

## Scope Out
- Calendar event editing and bidirectional event write-back.
- Full auto-scheduler; only context and suggestion contracts are defined here.
- Hidden event-body parsing or calendar-specific editing UIs.

## Implementation Gate
- This slice is ready when the app can explain why a task is suggested for a slot and what busy blocks caused that recommendation (`BE-E2E-GCAL-001`).

## Google Reference
- Read `google-reference.md` in this module before implementing calendar availability, sync tokens, or watch channels.
