---
id: focus-sessions
title: Focus Sessions
status: ready
phase: 2
owners:
  - Frontend Engineer
  - Backend Engineer
depends_on:
  - task-detail-basic-editor
  - core-data-model-crud
  - nudge-engine
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-2-focus
last_updated: 2026-04-10
---

# Focus Sessions

## Objective
Define the ADHD-friendly Pomodoro-like timer flow for tracking work sessions, breaks, and focus history on the real backend runtime. It is shipping-track ready when the session lifecycle, reconnect behavior, task rollups, and nudge deferral all survive restart against durable persistence.

## Scope In
- Start/pause/end timer lifecycle.
- Flexible durations, break overlay, and session logging.
- Task-linked focus history and extra-time capture.
- Break-vs-nudge precedence that keeps focus active unless the timer is explicitly paused or in break mode.
- Persisted `FocusSession` records, active-session recovery, and DAO-backed rollups.

## Scope Out
- Gamification dashboards and full statistics reporting.
- Android-specific notifications and advanced background execution details.
- Multi-session concurrency or shared-user focus sessions.

## Requirements
- `FCS-REQ-1`: A focus session must support start/pause/end and maintain a single active timer per user. Tests: `BE-UNIT-FCS-001`, `FE-E2E-FCS-001`.
- `FCS-REQ-2`: The timer UI must show countdown, progress, and state transitions for work and break phases. Tests: `FE-UNIT-FCS-001`, `FE-E2E-FCS-002`.
- `FCS-REQ-3`: Ending a session must log tracked minutes back to the selected task and history. Tests: `BE-UNIT-FCS-002`, `BE-E2E-FCS-001`.
- `FCS-REQ-4`: Break enforcement must expose a dismissible overlay and preserve the paused session state. Tests: `FE-UNIT-FCS-002`, `FE-E2E-FCS-003`.
- `FCS-REQ-5`: While a session is running, non-blocking nudges are deferred and blocking nudges are surfaced only after pause or break. Tests: `BE-UNIT-FCS-003`, `FE-E2E-FCS-004`.
- `FCS-REQ-6`: Active and completed sessions persist through `FocusSessionsDao` and recover correctly after backend restart or reconnect. Tests: `BE-INT-FCS-001`, `BE-E2E-FCS-002`.
- `FCS-REQ-7`: Scaffolded timer flows may support local UI work, but they do not satisfy module completion without real session logging on the shared Postgres runtime. Tests: `BE-INT-FCS-001`, `BE-E2E-FCS-001`.

