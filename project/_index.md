---
id: project-index
title: Project Planning Index
status: ready
phase: cross-cutting
owners:
  - Documentation / DX
  - Product Manager
depends_on:
  - project-conventions
  - project-personas
  - project-test-strategy
  - project-quality-gates
  - project-parallelization
  - project-decision-log
parallel_group: foundation
source_of_truth:
  - PRD_Zuam_v0.3.md
  - AGENTS.md
last_updated: 2026-04-10
---

# Project Planning Index

## Purpose
`project/` is the canonical planning layer for Zuam. Start here before implementation. The directory is structured so a human engineer or LLM can identify the relevant phase, open a module, and begin from contracts plus failing tests instead of guessing.

## Start Here
1. Read [Planning Conventions](./_conventions.md).
2. Read [Test Strategy](./_test-strategy.md) and [Quality Gates](./_quality-gates.md).
3. Read [Parallelization Strategy](./_parallelization.md) and [Planning Personas](./_personas.md).
4. Open the relevant phase doc under [`phases/`](./phases/).
5. Open the target module under [`modules/`](./modules/).
6. Implement from `contracts.md` and the first tests listed in `work-packet.md`.

## Shared Planning Docs
| Doc | Purpose |
|---|---|
| [\_conventions.md](./_conventions.md) | authoring rules, required files, ID conventions, traceability |
| [\_personas.md](./_personas.md) | module ownership and handoff roles |
| [\_test-strategy.md](./_test-strategy.md) | test-first baseline across backend, desktop, and mobile |
| [\_quality-gates.md](./_quality-gates.md) | rules for `draft` vs `ready` and implementation entry |
| [\_parallelization.md](./_parallelization.md) | critical path, parallel streams, coordination rules |
| [\_decision-log.md](./_decision-log.md) | ADR-style record of cross-cutting decisions |
| [\_glossary.md](./_glossary.md) | shared terminology |
| [\_backend-architecture.md](./_backend-architecture.md) | NestJS module shape, DAO boundary, transactions, backend library baseline |
| [\_frontend-architecture.md](./_frontend-architecture.md) | desktop/mobile architecture, state boundaries, feature package defaults |
| [\_ai-runtime-architecture.md](./_ai-runtime-architecture.md) | Zuamy runtime split, provider adapters, planner/validator/executor baseline |
| [\_delivery-testing-architecture.md](./_delivery-testing-architecture.md) | local dev, CI, release, observability, and architecture QA gates |

## Phase Map
| Phase | Status | Goal | Doc |
|---|---|---|---|
| Phase 1 | ready | desktop-centered MVP foundation | [phase-1-foundation.md](./phases/phase-1-foundation.md) |
| Phase 2 | draft | richer desktop task experience is complete; mobile shell remains deferred | [phase-2-core-experience.md](./phases/phase-2-core-experience.md) |
| Phase 3 | ready | intelligence, insights, progression, and polish | [phase-3-polish-intelligence.md](./phases/phase-3-polish-intelligence.md) |
| Phase 4 | draft | advanced AI assistance, public sharing, and future modules | [phase-4-advanced.md](./phases/phase-4-advanced.md) |

## Shipping Track Overlay
Phase numbers stay intact, but active delivery priority is now judged against the shipping bar: a desktop-first, single-user app running on the real backend runtime.

### Shipping Bar
- real auth and durable session storage
- real Postgres-backed persistence for lists, sections, tasks, sync state, focus sessions, calendar snapshots, and nudge scheduling
- real Google Tasks sync and Google Calendar context adapters
- real focus-session logging and nudge/focus precedence
- release and observability coverage for the desktop shipping path

### Active Shipping Track
| Module | Phase | Shipping Priority | Notes |
|---|---|---|---|
| `monorepo-platform` | Phase 1 | foundational | workspace and runtime substrate |
| `auth-invite-onboarding` | Phase 1 | active critical path | real OAuth, invite consumption, session persistence |
| `core-data-model-crud` | Phase 1 | active critical path | real Prisma/Postgres CRUD runtime |
| `desktop-shell-layout` | Phase 1 | frontend dependency | depends on real auth/data contracts |
| `task-detail-basic-editor` | Phase 1 | frontend dependency | depends on real save/runtime contracts |
| `google-tasks-sync` | Phase 1 | active critical path | real provider adapter, cursors, polling, idempotency |
| `google-calendar-context` | Phase 2 | active critical path | real read model and calendar snapshot persistence |
| `focus-sessions` | Phase 2 | active critical path | real session logging and nudge deferral |
| `nudge-engine` | Phase 1 | active critical path | real schedule persistence and delivery coordination |
| `infra-release-observability` | Phase 1 | active critical path | CI/release gates for the shipping runtime |

### Explicitly Deferred From The Shipping Bar
- `analytics-insights`
- `player-progression-rewards`
- `ai-companion-orchestrator`
- `ai-companion-runtime-governance`
- `mobile-shell-core`
- `public-progression-profiles`

These modules remain documented, but they must not outrank the work required to make the core desktop runtime real.

## Module Registry
| Module | Phase | Status | Shipping Track | Owner | Path |
|---|---|---|---|---|---|
| monorepo-platform | Phase 1 | ready | foundation | Infra / DevOps | [module](./modules/monorepo-platform/README.md) |
| auth-invite-onboarding | Phase 1 | ready | active | Backend Engineer | [module](./modules/auth-invite-onboarding/README.md) |
| core-data-model-crud | Phase 1 | ready | active | Backend Engineer | [module](./modules/core-data-model-crud/README.md) |
| desktop-shell-layout | Phase 1 | ready | dependency | Frontend Engineer | [module](./modules/desktop-shell-layout/README.md) |
| task-detail-basic-editor | Phase 1 | ready | dependency | Frontend Engineer | [module](./modules/task-detail-basic-editor/README.md) |
| google-tasks-sync | Phase 1 | ready | active | Backend Engineer | [module](./modules/google-tasks-sync/README.md) |
| nudge-engine | Phase 1 | ready | active | Backend Engineer | [module](./modules/nudge-engine/README.md) |
| infra-release-observability | Phase 1 | ready | active | Infra / DevOps | [module](./modules/infra-release-observability/README.md) |
| task-views | Phase 2 | ready | downstream | Frontend Engineer | [module](./modules/task-views/README.md) |
| focus-sessions | Phase 2 | ready | active | Frontend Engineer | [module](./modules/focus-sessions/README.md) |
| google-calendar-context | Phase 2 | ready | active | Backend Engineer | [module](./modules/google-calendar-context/README.md) |
| mobile-shell-core | Phase 2 | draft | deferred | Frontend Engineer | [module](./modules/mobile-shell-core/README.md) |
| tags-filters-smart-lists | Phase 2 | ready | downstream | Product Manager | [module](./modules/tags-filters-smart-lists/README.md) |
| analytics-insights | Phase 3 | ready | deferred | Product Manager | [module](./modules/analytics-insights/README.md) |
| player-progression-rewards | Phase 3 | ready | deferred | Product Manager | [module](./modules/player-progression-rewards/README.md) |
| ai-companion-orchestrator | Phase 4 | draft | deferred | Product Manager | [module](./modules/ai-companion-orchestrator/README.md) |
| ai-companion-runtime-governance | Phase 4 | draft | deferred | Backend Engineer | [module](./modules/ai-companion-runtime-governance/README.md) |
| public-progression-profiles | Phase 4 | draft | deferred | Product Manager | [module](./modules/public-progression-profiles/README.md) |

## Shipping Track Critical Path
1. [monorepo-platform](./modules/monorepo-platform/README.md)
2. [auth-invite-onboarding](./modules/auth-invite-onboarding/README.md)
3. [core-data-model-crud](./modules/core-data-model-crud/README.md)
4. [desktop-shell-layout](./modules/desktop-shell-layout/README.md)
5. [task-detail-basic-editor](./modules/task-detail-basic-editor/README.md)
6. [google-tasks-sync](./modules/google-tasks-sync/README.md)
7. [google-calendar-context](./modules/google-calendar-context/README.md)
8. [focus-sessions](./modules/focus-sessions/README.md)
9. [nudge-engine](./modules/nudge-engine/README.md)
10. [infra-release-observability](./modules/infra-release-observability/README.md)

## What Makes A Module Ready
- `README.md` defines objective, scope, requirements, dependencies, and readiness.
- `contracts.md` defines public interfaces and invariants.
- `tests.backend.md` and `tests.frontend.md` define the acceptance language.
- `work-packet.md` defines the first tests to write and the safe implementation boundary.
- For shipping-track backend modules, those docs must describe the real Prisma/Postgres and provider-adapter runtime path, not a scaffold-only substitute.

## Shipping Note
- The shipping-first rebaseline does not renumber phases.
- Phase 2 modules `google-calendar-context` and `focus-sessions` now sit on the active shipping path because calendar context and focus logging are part of the first real desktop shipping bar.
- Later-phase analytics, progression, AI, and mobile work stay documented but non-blocking until the shipping-track runtime closes end to end.

## LLM Usage Pattern
- Read the phase doc for sequence.
- Read the module README for scope.
- Read `contracts.md` to freeze interfaces.
- Materialize the first failing tests from `work-packet.md`.
- Do not extend scope without updating the relevant module doc and, if cross-cutting, [\_decision-log.md](./_decision-log.md).
