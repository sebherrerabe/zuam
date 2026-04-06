---
id: focus-sessions
title: Focus Sessions
status: draft
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
last_updated: 2026-04-04
---

# Focus Sessions

## Objective
Define the ADHD-friendly Pomodoro-like timer flow for tracking work sessions, breaks, and focus history.

## Scope In
- Start/pause/end timer lifecycle.
- Flexible durations, break overlay, and session logging.
- Task-linked focus history and extra-time capture.

## Scope Out
- Gamification dashboards and full statistics reporting.
- Android-specific notifications and advanced background execution details.

## Requirements
- `FCS-REQ-1`: A focus session must support start/pause/end and maintain a single active timer per user. Tests: `BE-UNIT-FCS-001`, `FE-E2E-FCS-001`.
- `FCS-REQ-2`: The timer UI must show countdown, progress, and state transitions for work and break phases. Tests: `FE-UNIT-FCS-001`, `FE-E2E-FCS-002`.
- `FCS-REQ-3`: Ending a session must log tracked minutes back to the selected task and history. Tests: `BE-UNIT-FCS-002`, `BE-E2E-FCS-001`.
- `FCS-REQ-4`: Break enforcement must expose a dismissible overlay and preserve the paused session state. Tests: `FE-UNIT-FCS-002`, `FE-E2E-FCS-003`.

