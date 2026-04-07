---
id: public-progression-profiles
title: Public Progression Profiles
status: draft
phase: 4
owners:
  - Product Manager
depends_on:
  - player-progression-rewards
parallel_group: social-sharing
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-07
---

# Public Progression Profiles

This module defines opt-in public sharing for Zuam progression: public profile URLs, privacy controls, and outward-facing profile pages that let users share avatar growth without exposing private task data by default.

## Scope In
- Opt-in public progression profile URLs and page visibility controls (`BE-UNIT-PPP-001`, `FE-UNIT-PPP-001`).
- Public profile page composition for avatar, level, XP progress, and selected showcase unlocks (`FE-UNIT-PPP-002`).
- Privacy filters that separate public progression data from private task-management data (`BE-UNIT-PPP-002`, `BE-E2E-PPP-001`).
- Public-share CTA flows that start from the Phase 3 progression surfaces (`FE-E2E-PPP-001`).

## Scope Out
- Leaderboards, likes, comments, follow graphs, or social feeds.
- Public task lists, due dates, nudge settings, emotional-resistance fields, or other private productivity details.
- Team or party mechanics tied to profile visibility.

## Requirements
- `PPP-REQ-001`: Public progression profiles must be private by default and require explicit user opt-in before any public URL is created. Tests: `BE-UNIT-PPP-001`, `FE-UNIT-PPP-001`.
- `PPP-REQ-002`: Public profiles may expose avatar art, level, XP progress, archetype or class, and selected showcase cosmetics only. Tests: `BE-UNIT-PPP-002`, `FE-UNIT-PPP-002`.
- `PPP-REQ-003`: Public profiles must not expose task titles, list names, due dates, nudge settings, emotional-resistance fields, or reflective analytics that reveal private work content. Tests: `BE-UNIT-PPP-003`, `BE-E2E-PPP-001`.
- `PPP-REQ-004`: Public profile creation, update, disable, and regenerate-link flows must be reversible and user-controlled. Tests: `BE-E2E-PPP-002`, `FE-E2E-PPP-001`.

## Implementation Gate
- This slice is ready when a user can explicitly opt into a public progression page, share a stable URL, and verify that only allowed profile fields are visible to anonymous viewers (`BE-E2E-PPP-001`).
