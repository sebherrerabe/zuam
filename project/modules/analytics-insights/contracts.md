---
id: analytics-insights
title: Analytics Insights Contracts
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

# Contracts

## Shipping-First Status
- This module is a downstream consumer of shipped task, focus, and calendar facts.
- It remains non-blocking until the shipping-track runtime is real end to end and must not introduce new core-backend requirements ahead of that work.

## Data Contract
- `TaskCompletionFact`: derived from persisted task rows only, keyed by task id and completion timestamp, and carrying the task metadata needed for explainable analytics without becoming a mutation surface.
- `FocusSessionCompletionFact`: derived from completed focus sessions only, keyed by session id and carrying task id, ended timestamp, work minutes, and extra minutes.
- `AnalyticsSnapshot`: read-only payload composed of `currentStreak`, `bestStreak`, `weeklySummary`, `completionHeatmap`, `hardestTaskHighlight`, and explanation references.
- `currentStreak`: optional current consecutive completion window with documented timezone and grace behavior, treated as a reflective consistency metric rather than a punishment trigger (`BE-UNIT-AIN-001`).
- `bestStreak`: optional historical maximum streak under the same calculation rules as `currentStreak` (`BE-UNIT-AIN-001`).
- `weeklySummary`: aggregate of completions, focus minutes, and reflection highlights for a defined week window (`BE-UNIT-AIN-002`).
- `completionHeatmap`: calendar-shaped aggregation keyed by date bucket, not raw task rows (`BE-UNIT-AIN-003`).
- `hardestTaskHighlight`: the explainable summary highlight for the most effortful completed task in a window (`BE-UNIT-AIN-002`).

## API Contract
- `GET /analytics/summary?window=this-week|last-28-days` returns the primary analytics snapshot plus explanation references and generation metadata.
- `GET /analytics/heatmap?window=last-90-days` returns date-bucket aggregates plus enough explanation context to render the documented heatmap legend.
- Analytics read surfaces must return computed values plus the documented inputs used for computation where the UI needs explanation (`BE-E2E-AIN-001`).
- Heatmap endpoints expose date-bucket aggregates only and do not return progression or avatar state (`BE-UNIT-AIN-003`).
- Summary payloads must clearly distinguish reporting values from actionable task mutations (`BE-UNIT-AIN-004`).

## UI Contract
- Dashboard surfaces must support loading, empty, error, and success states for consistency metrics, weekly summaries, heatmaps, and hardest-task highlights (`FE-UNIT-AIN-001`).
- Analytics UI must explain why a metric exists without introducing reward pressure, unlock prompts, or punitive streak copy; weekly and rolling-window consistency should be preferred over fragile daily-perfect framing (`FE-UNIT-AIN-002`, `FE-UNIT-AIN-003`).

## Event Contract
- Analytics consumes completion and focus inputs but does not own celebratory gameplay events in Phase 3 (`BE-UNIT-AIN-004`).
