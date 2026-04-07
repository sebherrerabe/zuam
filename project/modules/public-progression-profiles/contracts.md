---
id: public-progression-profiles
title: Public Progression Profiles Contracts
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

# Contracts

## Data Contract
- `PublicProgressionProfile`: `userId`, `publicSlug`, `isPublic`, `shareTitle`, `shareDescription?`, `showcaseUnlockIds[]`, `updatedAt`.
- `PublicProgressionSnapshot`: avatar art reference, level, total XP or progress-band, archetype or class, showcase cosmetics, and any explicitly approved decorative metadata.
- Invariants: public profiles are opt-in, disabling public visibility invalidates anonymous access, and private task-management fields never enter the public snapshot shape.

## API Contract
- Profile visibility surfaces create, update, disable, and regenerate public share links.
- Public read surfaces return only the `PublicProgressionSnapshot` plus minimal profile chrome needed for the public page.
- Public APIs must not require authenticated access for viewing a public page, but all mutating profile-visibility actions require authenticated ownership.

## UI Contract
- Public profile controls live behind explicit privacy language and preview the exact fields that will be public.
- Public page UI emphasizes avatar progression and curated cosmetic showcase, not task throughput or shame-oriented metrics.
- Public links must be revocable from the owner's settings surface.

## Privacy Contract
- Anonymous public views exclude task titles, task counts by private list, due dates, nudge settings, emotional-resistance fields, focus history detail, and analytics that reveal the user's work content or routines.
- Public pages may show only the subset of progression state that the owner explicitly approves for sharing.

## Event Contract
- `publicProfile:enabled`, `publicProfile:disabled`, and `publicProfile:updated` carry ownership-scoped metadata only.
