---
id: phase-1-foundation
title: Phase 1 Foundation
status: ready
phase: phase-1
owners:
  - Product Manager
  - Documentation / DX
depends_on:
  - project-conventions
  - project-test-strategy
  - project-quality-gates
parallel_group: phase-1
source_of_truth:
  - PRD_Zuam_v0.3.md
last_updated: 2026-04-10
---

# Phase 1 Foundation

## Goal
Deliver the first desktop-centered shipping substrate: monorepo setup, real backend auth and CRUD, initial real Google Tasks sync, desktop shell, basic task detail editing, Level 1-2 desktop nudges, and release foundations.

## Included Modules
- `monorepo-platform`
- `auth-invite-onboarding`
- `core-data-model-crud`
- `desktop-shell-layout`
- `task-detail-basic-editor`
- `google-tasks-sync`
- `nudge-engine`
- `infra-release-observability`

## Entry Dependencies
- Shared planning docs in `project/_*.md` are marked `ready`.

## Exit Criteria
- Monorepo package and local dev rules are frozen.
- Google OAuth plus invite-gated auth contracts are ready for real runtime implementation.
- Prisma data model and core CRUD contracts are ready for real Postgres-backed implementation.
- Desktop shell and basic task-detail editor contracts are ready.
- Google Tasks sync ownership and reconciliation rules are ready for the real provider path.
- Level 1-2 desktop nudge behavior is ready with durable scheduling expectations.
- CI and release expectations for desktop and backend are ready.

## Shipping-First Note
- Phase 1 remains the architectural foundation, but the shipping overlay now extends into Phase 2 for `google-calendar-context` and `focus-sessions`.
- Phase 1 docs must not describe in-memory or fake-provider-only runtime paths as sufficient for completion.

## Parallelization Notes
- `monorepo-platform` unblocks every other Phase 1 module.
- `auth-invite-onboarding` and `core-data-model-crud` may proceed in parallel once platform rules are frozen.
- `desktop-shell-layout` may begin as soon as package boundaries are frozen.
- `google-tasks-sync` depends on data-model ownership decisions.
- `task-detail-basic-editor` depends on desktop shell state boundaries.
- `infra-release-observability` depends on package and release targets.

## Risks
- Google API edge cases can force schema changes if sync ownership is not frozen early.
- Electron shell decisions affect UI testing and release automation.
- Nudge scheduling semantics can spill into future phases if boundaries are not strict.
