---
id: public-progression-profiles
title: Public Progression Profiles Frontend Tests
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

# Frontend Tests

- `FE-UNIT-PPP-001`: public-profile settings default to private and require explicit opt-in language before enabling a share URL.
- `FE-UNIT-PPP-002`: the public profile preview renders avatar, level, XP progress, archetype or class, and approved showcase unlocks only.
- `FE-E2E-PPP-001`: a user can enable public sharing, copy a public URL, preview the public page, and disable sharing again without leaving orphaned public access.
