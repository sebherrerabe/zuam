---
id: analytics-gamification
title: Analytics and Gamification
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

# Analytics and Gamification

This module defines lightweight motivation metrics: streaks, XP, summaries, heatmaps, and milestone feedback. It intentionally stays small and non-social; the purpose is reinforcement, not leaderboard pressure.

## Scope In
- Completion streak rules and milestone thresholds (`BE-UNIT-AG-001`).
- XP weighting based on task difficulty/resistance/focus time (`BE-UNIT-AG-002`).
- Weekly summary and heatmap aggregation contracts (`BE-UNIT-AG-003`).
- Frontend presentation for summary cards, streak progress, and unlock states (`FE-UNIT-AG-001`).

## Scope Out
- Leaderboards.
- Social sharing.
- Any reward system that changes task semantics.

## Implementation Gate
- This slice is ready when the app can explain how a streak or XP value was computed for a given time window (`BE-E2E-AG-001`).
