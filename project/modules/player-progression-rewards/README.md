---
id: player-progression-rewards
title: Player Progression and Rewards
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
last_updated: 2026-04-10
---

# Player Progression and Rewards

This module defines Zuam's positive-only pixel-RPG progression layer: avatar growth, deterministic XP, cosmetic unlocks, and explainable reward history. It exists to make completed work feel satisfying without turning failure into punishment or allowing the game loop to overtake the task system. The pixel-art direction is a presentation choice for identity and delight, not an evidence-backed therapeutic mechanism on its own.

## Shipping-First Status
- This module is explicitly deferred from the shipping bar.
- It remains downstream of the real task, focus, and calendar runtime and must not consume backend priority until that core runtime is working end to end.

## Authoritative Desktop References
- `155:823` `Progression Profile (light)` is the canonical progression surface.
- `271:119` `Level Up + Unlock (light)` is the canonical celebratory and unlock-state surface.
- `155:946` `Progress Share Card (light)` is the canonical private share export surface.
- `155:233` `Detail Panel` is the canonical host frame for Phase 3 reward explanation and focus reward preview cards.

## Scope In
- Deterministic, immediate, fixed reward grants for task completion and focus-session completion (`BE-UNIT-PPR-001`, `BE-UNIT-PPR-002`).
- Progression profile state including level, avatar archetype or class, equipped cosmetics, and unlocked cosmetics (`BE-UNIT-PPR-003`).
- Explainable reward feed and milestone unlock contracts (`BE-UNIT-PPR-004`, `FE-UNIT-PPR-003`).
- Optional initiation bonus rules only when they stay small, documented, non-farmable, and secondary to terminal actions (`BE-UNIT-PPR-005`).
- Pixel-art avatar rendering, sprite-sheet packaging, and the asset-authoring workflow for progression surfaces (`FE-UNIT-PPR-004`, `FE-E2E-PPR-003`).
- Private progression share-card export and a lightweight `Share Progress` affordance for the progression surface (`FE-UNIT-PPR-005`, `FE-E2E-PPR-004`).
- Feature-flagged reward explanation and focus reward preview cards in task detail, following ADR-014.

## Scope Out
- Pet or companion-first loops.
- HP depletion, death, resurrection, or other loss-based mechanics.
- Leaderboards, parties, guilds, or social pressure systems.
- Variable-ratio loot dependency, loot boxes, or randomized reward retention mechanics.
- Runtime generation of production sprite sheets directly from an LLM.
- Public progression profile URLs or browsable public profiles.

## Requirements
- `PPR-REQ-001`: Task completion must grant deterministic, immediate, fixed XP and any optional soft currency from documented task inputs only, with terminal completion actions rewarded more strongly than interaction volume. Tests: `BE-UNIT-PPR-001`, `FE-UNIT-PPR-001`.
- `PPR-REQ-002`: Focus-session completion must grant deterministic rewards weighted more heavily than trivial checkbox churn. Tests: `BE-UNIT-PPR-002`, `FE-E2E-PPR-001`.
- `PPR-REQ-003`: The progression profile must track level, avatar archetype or class, equipped cosmetics, and unlocked cosmetics without losing earned progress on missed days. Tests: `BE-UNIT-PPR-003`, `FE-UNIT-PPR-002`.
- `PPR-REQ-004`: Milestone unlocks and reward history must be explainable, emitted exactly once per threshold crossing, and visible without cluttering task flow. Tests: `BE-UNIT-PPR-004`, `FE-UNIT-PPR-003`, `FE-E2E-PPR-002`.
- `PPR-REQ-005`: Progression must remain optional and must not change task priority, nudge severity, or core task semantics. Tests: `BE-UNIT-PPR-005`, `BE-E2E-PPR-001`, `FE-E2E-PPR-002`.
- `PPR-REQ-006`: Animated progression surfaces must render pixel-art avatar states through PixiJS using `@pixi/react`, with production assets authored or normalized in Aseprite and exported as deterministic sprite-sheet atlases. Tests: `FE-UNIT-PPR-004`, `FE-E2E-PPR-003`.
- `PPR-REQ-007`: Image-capable LLMs may assist with concept exploration or edit proposals, but final runtime sprite assets must come from a curated asset pipeline rather than direct runtime or one-shot model output, and the pixel-art presentation must not be documented as an evidence-backed ADHD mechanism by itself. Tests: `FE-UNIT-PPR-004`, `FE-E2E-PPR-003`.
- `PPR-REQ-008`: Phase 3 progression may expose a `Share Progress` affordance that exports a private share card or shareable image from the user's current progression state, but it must not require a public URL or expose task-level private data. Tests: `BE-UNIT-PPR-006`, `FE-UNIT-PPR-005`, `FE-E2E-PPR-004`.

## Implementation Gate
- This slice is ready when a user can complete tasks or focus sessions, see deterministic avatar progress, and inspect exactly why a reward was granted without any punitive or social mechanic being required (`BE-E2E-PPR-001`).
- This slice must remain optional and must not become a dependency for completing, editing, snoozing, or re-prioritizing tasks.
