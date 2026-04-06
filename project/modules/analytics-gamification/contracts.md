---
id: analytics-gamification
title: Analytics and Gamification Contracts
status: draft
phase: 3
owners:
  - Product Manager
depends_on:
  - core-data-model-crud
  - focus-sessions
parallel_group: metrics
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-04
---

# Contracts

## Data Contract
- `Streak` tracks the consecutive-success window, reset rules, and timezone policy (`BE-UNIT-AG-001`).
- `XPEvent` records source task, weighting inputs, and resulting points so scores are explainable (`BE-UNIT-AG-002`).
- `WeeklySummary` aggregates completions, focus minutes, hardest task, and milestone deltas (`BE-UNIT-AG-003`).

## API Contract
- Analytics endpoints must return computed values plus the inputs used for computation where the UI needs explanation (`BE-E2E-AG-001`).
- Heatmap endpoints expose a calendar-shaped aggregation, not raw task rows (`BE-UNIT-AG-003`).

## UI Contract
- Dashboard surfaces must support empty, loading, and success states for streaks, XP, weekly summaries, and unlockables (`FE-UNIT-AG-001`).
- Theme unlock messaging must remain optional and non-blocking (`FE-UNIT-AG-002`).

## Event Contract
- `streak:milestone` and `xp:earned` events can trigger lightweight celebratory UI without interrupting task flow (`BE-UNIT-AG-001`).
