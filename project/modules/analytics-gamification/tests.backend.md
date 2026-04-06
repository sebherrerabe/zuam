---
id: analytics-gamification
title: Analytics and Gamification Backend Tests
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

# Backend Tests

- `BE-UNIT-AG-001`: streak calculations respect timezone boundaries and reset rules.
- `BE-UNIT-AG-002`: XP weighting reflects completion difficulty, resistance, and focus minutes.
- `BE-UNIT-AG-003`: weekly summary aggregates the documented metrics and no more.
- `BE-UNIT-AG-004`: heatmap aggregation groups completions into the correct date buckets.
- `BE-UNIT-AG-005`: milestone events are emitted only when a threshold is crossed exactly once.
- `BE-E2E-AG-001`: a user can inspect a computed summary and trace each score back to its source completion or focus event.
