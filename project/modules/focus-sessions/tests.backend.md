---
id: focus-sessions
title: Focus Sessions Backend Tests
status: ready
phase: 2
owners:
  - Backend Engineer
depends_on:
  - core-data-model-crud
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-2-focus
last_updated: 2026-04-10
---

# Backend Test Specs

## `BE-INT-FCS-001`
- Persist active and completed focus sessions through `FocusSessionsDao` on disposable Postgres.
- Assert active-session recovery, pause state, and completed history survive backend restart.

## `BE-UNIT-FCS-001`
- Covers `FCS-REQ-1`.
- Assert only one active session can exist and repeated starts are rejected or idempotent.

## `BE-UNIT-FCS-002`
- Covers `FCS-REQ-3`.
- Assert session completion computes logged minutes, extra minutes, and task rollups correctly.

## `BE-UNIT-FCS-003`
- Covers `FCS-REQ-5`.
- Assert running sessions defer blocking nudges and keep non-blocking nudges out of the active timer surface.

## `BE-E2E-FCS-001`
- Covers `FCS-REQ-3`.
- Assert session end persists history records and updates the linked task's tracked time.

## `BE-E2E-FCS-002`
- Covers `FCS-REQ-4`.
- Assert pause/break transitions survive reconnect and resume from persisted state.

## `BE-E2E-FCS-003`
- Covers `FCS-REQ-5`.
- Assert active focus defers nudges, break state releases only the allowed nudges, and end-of-session logging is persisted before deferred nudge release.
