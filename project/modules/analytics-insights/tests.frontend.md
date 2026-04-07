---
id: analytics-insights
title: Analytics Insights Frontend Tests
status: draft
phase: 3
owners:
  - Product Manager
depends_on:
  - core-data-model-crud
  - focus-sessions
parallel_group: metrics
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-06
---

# Frontend Tests

- `FE-UNIT-AIN-001`: dashboard cards render loading, empty, error, and success states for streaks, weekly summaries, and the heatmap.
- `FE-UNIT-AIN-002`: streak, summary, and hardest-task surfaces explain why a metric was reported without cluttering the main task flow.
- `FE-UNIT-AIN-003`: analytics UI never presents streaks as punitive progress loss, pressure warnings, or gameplay debt.
- `FE-E2E-AIN-001`: heatmap and summary widgets remain readable in both light and dark themes and behave as reporting-only surfaces.
