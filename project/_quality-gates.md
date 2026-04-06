---
id: project-quality-gates
title: Quality Gates
status: ready
phase: cross-cutting
owners:
  - QA / Validation
  - Documentation / DX
depends_on:
  - project-conventions
  - project-test-strategy
parallel_group: foundation
source_of_truth:
  - PRD_Zuam_v0.3.md
last_updated: 2026-04-04
---

# Quality Gates

## Module Readiness Gate
A module may be marked `ready` only if all of the following are true:
- required files exist
- requirements are explicit and scoped
- contracts define interfaces and invariants
- backend and frontend test specs exist where relevant
- work packet lists concrete implementation steps and boundaries
- dependencies are explicit and resolvable
- no unresolved questions remain

## Phase Readiness Gate
A phase may be marked implementation-ready only if:
- all critical-path modules for the phase are `ready`
- phase entry dependencies are satisfied
- test tooling baseline for the phase is locked
- release/operational expectations for the phase are defined
- phase exit criteria are concrete and testable

## Documentation Acceptance Checklist
- No placeholder wording remains in `ready` docs.
- Every requirement has test coverage.
- Every contract clause names the owning package or module.
- Every integration notes external systems, retries, and failure behavior.
- Every UI contract includes the required view states.
- Every work packet defines non-goals to reduce scope drift.

## Implementation Gate
Implementation work should begin only when:
1. the module is `ready`
2. the first failing tests are listed in `work-packet.md`
3. the module's dependencies are already `ready` or explicitly stable enough to consume
4. the ownership boundary is clear enough for parallel execution

## Review Gate
Before declaring a slice done, reviewers must confirm:
- the implemented code satisfies contract clauses
- the planned tests exist and pass
- public interfaces still match the documented contracts
- deviations from the spec are captured in `_decision-log.md`

## Release Gate
Before any milestone release:
- all phase exit criteria are satisfied
- CI gates are green
- regression e2e coverage exists for the critical user journeys
- operator runbooks and environment expectations are documented for the released scope
