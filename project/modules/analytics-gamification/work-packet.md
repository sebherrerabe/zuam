---
id: analytics-gamification
title: Analytics and Gamification Work Packet
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

# Work Packet

## Objective
Document the minimum motivational analytics that can be shipped without turning the app into a game layer.

## Files / Packages Expected To Change
- Analytics metric definitions.
- Summary aggregation rules.
- Dashboard surface contracts.

## Contracts To Implement First
- Streak policy.
- XP weighting policy.
- Weekly-summary aggregation policy.

## Tests To Create First
- `BE-UNIT-AG-001`, `BE-UNIT-AG-002`, `BE-UNIT-AG-003`.
- `FE-UNIT-AG-001`, `FE-UNIT-AG-002`.

## Blockers / Dependencies
- Requires completion and focus-session data to exist as stable inputs.

## Parallel-Safe Boundaries
- Can be planned in parallel with taxonomy and calendar-context work once task completion semantics are fixed.

## Completion Signals
- A user can inspect a summary and understand how the displayed score was produced.

## Non-Goals
- No leaderboard or social network features.
- No reward system that changes task priority semantics.

## Rollback / Risk Notes
- If scoring becomes opaque, the motivation signal will erode; keep formulas explainable and stable.
