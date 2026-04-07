---
id: player-progression-rewards
title: Player Progression and Rewards Contracts
status: draft
phase: 3
owners:
  - Product Manager
depends_on:
  - core-data-model-crud
  - focus-sessions
  - analytics-insights
parallel_group: progression
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-06
---

# Contracts

## Data Contract
- `ProgressionProfile`: `userId`, `level`, `totalXp`, `currentAvatarArchetype`, `equippedCosmetics[]`, `unlockedCosmetics[]`, `updatedAt`.
- `RewardEvent`: `id`, `userId`, `source`, `sourceId`, `xpGranted`, `softCurrencyGranted?`, `timestamp`, `explanationText`, `thresholdCrossed?`.
- `Unlockable`: `id`, `type`, `unlockThreshold`, `visualAssetRef`, `displayName`.
- `RewardSource`: `TASK_COMPLETION`, `FOCUS_SESSION_COMPLETION`, `TASK_START_BONUS`.
- Invariants: no XP or cosmetic loss on missed days, equipped cosmetics must already be unlocked, snooze and postpone flows never grant progression rewards, randomized rewards must not be required for baseline progression, and reward grants must prefer terminal meaningful actions over interaction volume such as task splitting or bookkeeping churn.

## API Contract
- Progression read surfaces expose the current `ProgressionProfile` plus the next milestone preview and explanation metadata.
- Reward-history read surfaces return `RewardEvent` records in reverse-chronological order with explanation text and source references.
- Avatar equip or update surfaces accept only unlocked cosmetics and valid archetype choices.
- Task and focus completion flows may trigger progression updates, but progression APIs must not be required to complete or edit a task.
- Baseline reward schedules must be fixed and predictable; APIs must not require probabilistic drop logic for core progression.
- Share export surfaces may generate a progression share card from current profile state, but Phase 3 does not require stable public URLs or public profile hosting.

## UI Contract
- Progression surfaces are optional side panels, profile cards, or summary widgets that never block task completion, task editing, or nudges.
- Level-up and unlock feedback must be lightweight, celebratory, and dismissible.
- Reward feed entries must explain why XP or a cosmetic unlock was granted without exposing opaque formulas.
- Static avatar badges may use standard image rendering, but animated avatar scenes and milestone states use PixiJS via `@pixi/react` on desktop.
- A `Share Progress` action may appear on the progression surface, but it opens a private export or native share flow rather than a public social feed.

## Asset And Rendering Contract
- Production avatar assets are sprite-sheet atlases exported from Aseprite as `png + metadata` pairs with stable frame names for idle, celebration, focus, and unlock states.
- Animated progression surfaces load those atlases through PixiJS and must preserve pixel-art scaling without smoothing artifacts.
- Cosmetic equipment must attach to documented sprite slots so visual layering remains deterministic across unlocks.
- Runtime clients must not depend on live model calls to generate or mutate production assets.
- Image-capable LLMs may be used offline for concept ideation, style exploration, or edit proposals, but final runtime assets are curated and normalized before export.
- Pixel-art style is chosen for product identity, delight, and visual coherence; it must not be treated in planning docs as a validated ADHD-specific causal ingredient.

## Privacy And Sharing Contract
- Phase 3 share exports may include avatar art, level, XP progress, archetype or class, and selected cosmetic unlocks.
- Phase 3 share exports must exclude task titles, list names, due dates, nudge settings, emotional-resistance fields, and analytics details that reveal private work content.
- Public progression profile URLs, public pages, and link-based sharing are deferred to a separate module.

## Event Contract
- `progression:updated` carries the new level, total XP, and last reward explanation.
- `progression:level-up` fires only when a level threshold is crossed.
- `progression:unlock-earned` carries unlockable id, type, and threshold metadata.
