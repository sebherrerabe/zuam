---
id: focus-sessions
title: Focus Sessions Contracts
status: draft
phase: 2
owners:
  - Frontend Engineer
  - Backend Engineer
depends_on:
  - core-data-model-crud
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-2-focus
last_updated: 2026-04-04
---

# Contracts

## State Machine
- States: `idle`, `running`, `paused`, `break`, `completed`.
- Only one `running` session may exist per user at a time.
- Session transitions are explicit and must be recoverable after reconnect.

## Event Contracts
- Client to server: `focus:start`, `focus:pause`, `focus:end`.
- Server to client: `focus:tick`, `focus:sync`, `focus:break-start`, `focus:break-end`.

## Data Contracts
- `FocusSession` includes `id`, `taskId`, `startedAt`, `endedAt`, `pausedAt`, `durationMinutes`, `breakDurationMinutes`, and `extraMinutes`.
- `actualMinutes` on the task is updated from session completion totals.

