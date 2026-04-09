---
id: player-progression-rewards
title: Player Progression and Rewards Backend Tests
status: ready
phase: 3
owners:
  - Product Manager
depends_on:
  - core-data-model-crud
  - focus-sessions
  - analytics-insights
parallel_group: progression
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-09
---

# Backend Tests

- `BE-UNIT-PPR-001`: task completion grants deterministic XP from documented task inputs and does not reward snooze or postpone flows.
- `BE-UNIT-PPR-002`: focus-session completion grants deterministic rewards weighted higher than trivial checkbox churn.
- `BE-UNIT-PPR-003`: `ProgressionProfile` preserves earned XP, levels, and unlocked cosmetics across missed days and rejects equipping locked cosmetics.
- `BE-UNIT-PPR-004`: milestone unlocks and `progression:level-up` or `progression:unlock-earned` events fire exactly once at threshold crossing.
- `BE-UNIT-PPR-005`: progression updates never change task priority, nudge severity, or task-state semantics and optional task-start bonuses remain documented and non-farmable.
- `BE-UNIT-PPR-006`: progression share-export payloads include only allowed profile fields and exclude task-level private data or any requirement for a public URL.
- `BE-E2E-PPR-001`: task completion and focus-session completion update progression consistently while leaving core task flows and analytics semantics intact.
- `BE-E2E-PPR-002`: reward hooks are exactly-once for repeated task-update events and repeated focus-session sync events after completion.
