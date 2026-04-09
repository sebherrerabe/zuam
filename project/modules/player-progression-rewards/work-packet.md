---
id: player-progression-rewards
title: Player Progression and Rewards Work Packet
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

# Work Packet

## Objective
Document the minimum positive-only pixel-RPG progression system that can ship without introducing punishment, social pressure, or opaque reward logic.

## Files / Packages Expected To Change
- Progression profile definitions.
- Reward event rules for task and focus completion.
- Avatar presentation and equip-surface contracts.
- Lightweight celebratory UI and reward-history read models.
- Desktop avatar-scene rendering package integration, sprite-atlas loading, and asset-export conventions.
- Share-card export payloads and native share-surface contracts.

## Contracts To Implement First
- XP and soft-currency weighting policy.
- Level-threshold and cosmetic unlock policy.
- Reward explanation policy.
- Pixel-art rendering and asset-pipeline policy.
- Share-export privacy policy.

## Tests To Create First
- `BE-UNIT-PPR-001`, `BE-UNIT-PPR-002`, `BE-UNIT-PPR-003`.
- `FE-UNIT-PPR-001`, `FE-UNIT-PPR-002`, `FE-UNIT-PPR-003`, `FE-UNIT-PPR-004`, `FE-UNIT-PPR-005`.

## Blockers / Dependencies
- Requires stable task completion semantics and focus-session completion outputs.
- Depends on analytics shapes being frozen so reporting and progression responsibilities do not overlap.
- Requires the Phase 3 Figma registry to remain anchored to `155:823`, `271:119`, `155:946`, and `155:233`.

## Parallel-Safe Boundaries
- Can be planned in parallel with analytics-insights once the shared source completion and focus data are stable.
- Must not redefine task completion, nudge, or priority semantics owned by upstream modules.

## Completion Signals
- A user can complete a task or focus session, see deterministic avatar progress rendered from curated sprite assets, inspect why a reward was granted, and continue working without any punitive state.
- The private share card and optional celebratory state are validated against the approved Phase 3 warm-light mockups.

## Non-Goals
- No leaderboards, parties, or social quests.
- No HP depletion, death, or resurrection mechanics.
- No random-drop dependency for baseline progression.
- No runtime prompt-to-sprite generation flow in the shipped app.
- No public profile page or stable public progression URL in Phase 3.

## Rollback / Risk Notes
- If progression becomes opaque or too salient, it can compete with the real task system; keep rewards deterministic, explainable, and visually lightweight.
- If asset production relies too heavily on one-shot model output, character consistency will drift; keep the exported Aseprite atlas as the production source of truth.
