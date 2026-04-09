---
id: player-progression-rewards
title: Player Progression and Rewards Frontend Tests
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

# Frontend Tests

- `FE-DESIGN-PPR-001`: the progression profile matches Figma node `155:823` after plugin-based screenshot comparison.
- `FE-DESIGN-PPR-002`: the unlock state matches Figma node `271:119` and the private share card matches node `155:946`.
- `FE-UNIT-PPR-001`: task-completion reward UI shows deterministic XP or soft-currency gains with clear explanation text.
- `FE-UNIT-PPR-002`: progression profile UI renders level, avatar archetype or class, equipped cosmetics, unlocked cosmetics, and empty or loading states without blocking task workflows.
- `FE-UNIT-PPR-003`: level-up, unlock, and reward-feed surfaces stay lightweight, dismissible, and explainable without shame or social pressure copy.
- `FE-UNIT-PPR-004`: animated avatar surfaces load deterministic sprite-sheet atlas data through the PixiJS renderer, preserve pixel-art scaling, and never require live model calls at runtime.
- `FE-UNIT-PPR-005`: the `Share Progress` affordance exports a private progression card using allowed profile fields only and does not imply that the profile is public by default.
- `FE-E2E-PPR-001`: completing a focus session yields the documented higher-value reward and updates the profile without requiring navigation away from the core task flow.
- `FE-E2E-PPR-002`: progression surfaces remain optional, do not change task priority or nudge behavior, and never present missed days as progress loss.
- `FE-E2E-PPR-003`: the desktop progression scene renders the documented avatar states from exported sprite atlases and falls back cleanly when an optional animated scene is unavailable.
- `FE-E2E-PPR-004`: exporting a share card succeeds without creating a public URL and never includes task-level private data.
