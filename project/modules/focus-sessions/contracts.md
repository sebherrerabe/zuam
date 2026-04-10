---
id: focus-sessions
title: Focus Sessions Contracts
status: ready
phase: 2
owners:
  - Frontend Engineer
  - Backend Engineer
depends_on:
  - core-data-model-crud
  - nudge-engine
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-2-focus
last_updated: 2026-04-10
---

# Contracts

## State Machine
- States: `idle`, `running`, `paused`, `break`, `completed`.
- Only one `running` session may exist per user at a time.
- Session transitions are explicit and must be recoverable after reconnect.
- A blocking nudge never replaces an active `running` session surface; it is deferred until the session pauses or enters break mode.

## Event Contracts
- Client to server: `focus:start`, `focus:pause`, `focus:end`.
- Server to client: `focus:tick`, `focus:sync`, `focus:break-start`, `focus:break-end`.
- `focus:start` payload includes `taskId`, `durationMinutes`, `breakDurationMinutes`, and the intended `startedAt`.
- `focus:pause` payload includes `sessionId`, `pausedAt`, and `remainingSeconds`.
- `focus:end` payload includes `sessionId`, `endedAt`, `actualWorkMinutes`, and `extraMinutes`.
- `focus:sync` payload includes the server snapshot needed to resume after reconnect.
- `focus:break-start` and `focus:break-end` carry the session id plus phase timestamps.

## Data Contracts
- `FocusSession` includes `id`, `userId`, `taskId`, `status`, `startedAt`, `pausedAt`, `resumedAt`, `endedAt`, `durationMinutes`, `breakDurationMinutes`, `elapsedWorkMinutes`, `elapsedBreakMinutes`, `extraMinutes`, and `lastSyncedAt`.
- Ending a session updates the linked task with `actualMinutes`, `focusSessionCount`, and `lastFocusedAt`.
- Deferred nudge delivery is tracked separately from the session record so reconnect can resume the timer without replaying dismissed overlays.

## Backend Interface Contract
- `FocusSessionsDao`
  - responsibilities: create/start session, persist pauses/resumes/end state, fetch active session, persist break transitions, write history rollups
- `TasksDao`
  - responsibilities: apply focus-derived task rollups without exposing persistence details to the focus service
- `NudgesDao`
  - responsibilities: mark deferred nudges during active focus and release them after pause/break/end

## Runtime Notes
- Persistent recovery after backend restart is part of the contract.
- A purely in-memory timer/session store is scaffold-only and cannot satisfy completion.
