---
id: analytics-insights
title: Analytics Insights Backend Tests
status: ready
phase: 3
owners:
  - Product Manager
depends_on:
  - core-data-model-crud
  - focus-sessions
parallel_group: metrics
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-09
---

# Backend Tests

- `BE-UNIT-AIN-001`: consistency calculations respect timezone boundaries, documented grace behavior, and separate `currentStreak` from `bestStreak` without turning missed days into punitive state changes.
- `BE-UNIT-AIN-002`: weekly summary and hardest-task highlight aggregate the documented metrics and no more.
- `BE-UNIT-AIN-003`: heatmap aggregation groups completions into the correct date buckets and does not mutate progression state.
- `BE-UNIT-AIN-004`: analytics explanation payloads contain only reporting values and traceable source references.
- `BE-E2E-AIN-001`: a user can inspect an analytics summary and trace `currentStreak`, `bestStreak`, `weeklySummary`, `completionHeatmap`, and `hardestTaskHighlight` back to source completion or focus events.
- `BE-E2E-AIN-002`: summary and heatmap endpoints stay read-only and do not emit task, focus, or progression mutations as a side effect of being queried.
