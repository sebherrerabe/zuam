---
id: analytics-insights
title: Analytics Insights
status: ready
phase: 3
owners:
  - Product Manager
depends_on:
  - core-data-model-crud
  - focus-sessions
parallel_group: metrics
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-10
---

# Analytics Insights

This module defines Zuam's explainable motivation reporting layer: consistency metrics, summaries, heatmaps, and reflective highlights. It stays non-gamey on purpose so users can inspect patterns without confusing reporting with the reward loop.

## Shipping-First Status
- This module is explicitly deferred from the shipping bar.
- It may stay documented and `ready` as a downstream consumer contract, but it must not consume backend priority until the real desktop core runtime is working end to end.

## Authoritative Desktop Reference
- `271:2` `Analytics Dashboard (light)` on the `v3 — Warm Light Mode` page is the canonical Phase 3 analytics reference.
- Use `155:3` only as the surrounding warm-light shell baseline when the analytics surface is mounted inside the existing desktop app.

## Scope In
- Non-punitive consistency reporting, including current and best streak values when enabled, with timezone-safe calculation rules (`BE-UNIT-AIN-001`).
- Weekly summary, completion heatmap, and "hardest task conquered" aggregation contracts (`BE-UNIT-AIN-002`).
- Explainable analytics payloads that trace each reported value to completion or focus inputs (`BE-E2E-AIN-001`).
- Frontend presentation for summary cards, streak insights, and reflective highlights (`FE-UNIT-AIN-001`).
- Shared fact models for task completion and focus-session completion that are read-only consumers of current Phase 2 contracts.

## Scope Out
- Avatar state, equipment, level milestones, and cosmetic unlocks.
- In-app currencies, loot tables, or randomized reward mechanics.
- Any reward system that changes task semantics or retention pressure.

## Implementation Gate
- This slice is ready when a user can inspect a reported consistency metric or summary and see how it was computed without any gameplay surface being required (`BE-E2E-AIN-001`).
- This slice must not introduce any write path that mutates task, focus, or progression state.

## Requirements
- `AIN-REQ-001`: The module must expose non-punitive consistency reporting, including `currentStreak` and `bestStreak` when present, as timezone-safe reflective values with clear reset and grace semantics. Tests: `BE-UNIT-AIN-001`, `FE-UNIT-AIN-001`.
- `AIN-REQ-002`: The module must expose `weeklySummary`, `completionHeatmap`, and `hardestTaskHighlight` using documented completion and focus inputs only. Tests: `BE-UNIT-AIN-002`, `BE-UNIT-AIN-003`, `FE-UNIT-AIN-002`.
- `AIN-REQ-003`: Analytics payloads must be explainable and traceable back to source completion or focus events. Tests: `BE-UNIT-AIN-004`, `BE-E2E-AIN-001`, `FE-UNIT-AIN-002`.
- `AIN-REQ-004`: Streaks and summaries must remain reporting surfaces only and must not mutate progression or task state. Tests: `BE-UNIT-AIN-003`, `FE-UNIT-AIN-003`, `FE-E2E-AIN-001`.
