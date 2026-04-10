---
id: analytics-insights
title: Analytics Insights Work Packet
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

# Work Packet

## Shipping-First Status
- This packet is non-blocking until the shipping-track desktop runtime is real.
- Planning may continue, but implementation must not outrank auth/data/sync/calendar/focus/nudge closeout.

## Objective
Document the minimum explainable motivation analytics that can ship without becoming the reward layer itself.

## Files / Packages Expected To Change
- Analytics metric definitions.
- Summary aggregation rules.
- Dashboard surface contracts.
- Reporting read models that consume task completion and focus-session outputs.

## Contracts To Implement First
- Streak policy.
- Weekly-summary aggregation policy.
- Heatmap and hardest-task explanation policy.

## Tests To Create First
- `BE-UNIT-AIN-001`, `BE-UNIT-AIN-002`, `BE-UNIT-AIN-003`.
- `FE-UNIT-AIN-001`, `FE-UNIT-AIN-002`, `FE-UNIT-AIN-003`.

## Blockers / Dependencies
- Requires completion and focus-session data to exist as stable inputs.
- Depends on the Phase 2 closure rule that analytics consumes current task-completion, focus-session completion, and calendar-context contracts without redefining them.

## Parallel-Safe Boundaries
- Can be planned in parallel with progression rewards once completion and focus-session semantics are fixed and the analytics output shapes are frozen.

## Completion Signals
- A user can inspect a streak or summary and understand how the displayed metric was produced without seeing game-specific progression state.
- The desktop analytics surface is visually aligned to Figma node `271:2` and remains read-only end to end.

## Non-Goals
- No leaderboard or social network features.
- No avatar progression, equipment, or unlock economy.
- No reward system that changes task priority semantics.

## Rollback / Risk Notes
- If reporting becomes opaque or drifts into game logic, users will stop trusting both analytics and rewards; keep formulas explainable and stable.
