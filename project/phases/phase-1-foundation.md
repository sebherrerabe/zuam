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
last_updated: 2026-04-04
---

# Phase 1 Foundation

## Goal
Deliver the first implementation-ready desktop-centered MVP: monorepo setup, backend auth and CRUD, initial Google Tasks sync, desktop shell, basic task detail editing, Level 1-2 desktop nudges, and release foundations.

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
- Google OAuth plus invite-gated auth contracts are ready.
- Prisma data model and core CRUD contracts are ready.
- Desktop shell and basic task-detail editor contracts are ready.
- Google Tasks sync ownership and reconciliation rules are ready.
- Level 1-2 desktop nudge behavior is ready.
- CI and release expectations for desktop and backend are ready.

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
