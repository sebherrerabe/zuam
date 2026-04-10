---
id: project-parallelization
title: Parallelization Strategy
status: ready
phase: cross-cutting
owners:
  - Product Manager
  - Documentation / DX
depends_on:
  - project-conventions
  - project-personas
parallel_group: foundation
source_of_truth:
  - PRD_Zuam_v0.3.md
last_updated: 2026-04-10
---

# Parallelization Strategy

## Core Rule
Parallel work is organized by vertical slice, not by broad technical layer. Each slice must define its own contracts and tests so an engineer or LLM can work independently without waiting for hidden decisions.

## Parallel-Safe Unit
The default unit of parallel execution is one module work packet. A module may be split further only if:
- the write set can be separated cleanly
- the interfaces between sub-packets are frozen first
- ownership is explicit

## Planning Streams
### Stream A: Foundation
1. `project-conventions`
2. `project-personas`
3. `project-test-strategy`
4. `project-quality-gates`
5. `project-parallelization`
6. `project-decision-log`
7. `project-index`

### Stream B: Shipping Track Critical Path
1. `monorepo-platform`
2. `auth-invite-onboarding`
3. `core-data-model-crud`
4. `desktop-shell-layout`
5. `task-detail-basic-editor`
6. `google-tasks-sync`
7. `google-calendar-context`
8. `focus-sessions`
9. `nudge-engine`
10. `infra-release-observability`

### Stream C: Parallel Shipping Opportunities
- `desktop-shell-layout` starts after `monorepo-platform`
- `core-data-model-crud` runs in parallel with `auth-invite-onboarding`
- `task-detail-basic-editor` starts after desktop shell states are frozen
- `google-tasks-sync` starts after initial data ownership and session persistence are defined
- `google-calendar-context` starts after task/sync identity and provider adapter boundaries are frozen
- `focus-sessions` may proceed in parallel with calendar-context once task persistence and nudge precedence are stable
- `infra-release-observability` starts after workspace and release boundaries are frozen

### Stream D: Deferred Or Downstream Specs
- `task-views`
- `mobile-shell-core`
- `tags-filters-smart-lists`
- `analytics-insights`
- `player-progression-rewards`
- `ai-companion-orchestrator`
- `ai-companion-runtime-governance`
- `public-progression-profiles`

## Dependency Rules
- A module may depend only on frozen upstream contracts, not on undocumented intent.
- Cross-module dependencies must be listed in frontmatter and repeated in the module README.
- Modules that consume the same shared types must freeze those types in the producing module contracts.
- Later-phase or deferred modules must not demand backend priority ahead of shipping-track runtime substrate work.

## LLM Coordination Rules
- Assign one owner per module.
- Define expected write paths before implementation.
- Put all first-test targets in the work packet.
- If a worker needs a new cross-cutting decision, capture it in `_decision-log.md` before continuing.
- Prototype or scaffold-only work should be labeled explicitly and kept off the authoritative completion path for shipping-track modules.
