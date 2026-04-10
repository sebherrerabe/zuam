---
id: phase-4-advanced
title: Phase 4 Advanced
status: draft
phase: phase-4
owners:
  - Product Manager
  - Documentation / DX
depends_on:
  - phase-3-polish-intelligence
parallel_group: phase-4
source_of_truth:
  - PRD_Zuam_v0.3.md
last_updated: 2026-04-10
---

# Phase 4 Advanced

## Goal
Cover advanced capabilities such as AI companion assistance, habits, adaptive nudge copy, freeform natural-language quick-add beyond the deterministic capture grammar, wearables, offline mode, linked tasks, folders, and any higher-risk gamification experiments deferred from Phase 3.

## Included Modules
- `ai-companion-orchestrator`
- `ai-companion-runtime-governance`
- `public-progression-profiles`

## Entry Dependencies
- Earlier phases are stable enough that advanced feature work will not destabilize core product flows.
- The shipping-track desktop runtime is already real: auth/session persistence, CRUD, Google Tasks sync, Google Calendar context, focus logging, nudge scheduling, and release baseline are all in place.

## Exit Criteria
- Advanced features are decomposed into new modules with contracts and tests.
- Any new cross-cutting data or sync rules are captured in the decision log before implementation.
- AI companion behavior, runtime safety, and memory governance boundaries are split into separate module contracts.

## Deferred From Phase 3
- Punitive or loss-based progression mechanics.
- Social or party-based reward systems and leaderboards.
- Adaptive reward personalization.
- High-salience randomized loot or retention mechanics.
- Public progression profile URLs and privacy-gated profile pages.

## Shipping-First Note
- Phase 4 is explicitly outside the shipping bar.
- AI and public-sharing work may remain documented, but they must not outrank the real desktop core runtime.
