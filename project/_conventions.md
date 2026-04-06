---
id: project-conventions
title: Planning Conventions
status: ready
phase: cross-cutting
owners:
  - Documentation / DX
  - Product Manager
depends_on: []
parallel_group: foundation
source_of_truth:
  - PRD_Zuam_v0.3.md
  - AGENTS.md
last_updated: 2026-04-04
---

# Planning Conventions

## Purpose
This file defines the authoring rules for every document in `project/`. The goal is to make the planning layer durable for humans and executable by LLMs without follow-up clarification.

## Canonical Structure
- `project/_*.md` files define shared rules, navigation, and cross-cutting policy.
- `project/phases/*.md` files define roadmap scope, ordering, readiness, and phase exit criteria.
- `project/modules/<module>/` files define implementation-ready module specs.
- Module docs hold implementation detail. Phase docs summarize and sequence modules.

## Required Frontmatter
Every phase and module doc must include:
- `id`
- `title`
- `status`: `draft | ready | blocked | superseded`
- `phase`
- `owners`
- `depends_on`
- `parallel_group`
- `source_of_truth`
- `last_updated`

## Required Files Per Module
Each `project/modules/<module>/` directory must contain:
- `README.md`
- `contracts.md`
- `tests.backend.md`
- `tests.frontend.md`
- `work-packet.md`
- `open-questions.md` only if unresolved decisions remain

## Authoring Rules
- Use Markdown as the human source of truth.
- Use YAML frontmatter as the machine-readable metadata layer.
- Write requirements as short IDs with imperative language.
- Write tests in executable-style Given/When/Then form.
- Prefer concrete defaults over open-ended prose.
- Record tradeoffs in the relevant module and in `_decision-log.md` when they affect multiple modules.
- Do not leave placeholder text such as `TBD`, `TODO`, or `decide later` in a `ready` document.

## Requirement And Test Traceability
- Requirement IDs must be stable within a module. Preferred format: `REQ-<module-short>-NNN`, but existing module-specific forms such as `<SHORT>-REQ-NNN` are acceptable.
- Backend unit tests use `BE-UNIT-<module-short>-NNN`.
- Backend integration/api e2e tests use `BE-E2E-<module-short>-NNN`.
- Frontend unit/component tests use `FE-UNIT-<module-short>-NNN`.
- Frontend UI e2e tests use `FE-E2E-<module-short>-NNN`.
- Documentation system tests use `DOC-UNIT-*` and `DOC-E2E-*`.
- Every requirement must reference at least one test ID.
- Every test must reference one or more requirement IDs or contract clauses.

## Module README Template
Each module `README.md` must include:
- objective
- user value
- scope in
- scope out
- dependencies
- phase mapping
- requirements list with IDs
- readiness statement

## Module Contracts Template
Each `contracts.md` must define:
- package ownership
- data contracts
- REST contracts where applicable
- event contracts where applicable
- UI contracts where applicable
- sync or external integration rules where applicable
- invariants
- failure modes

## Test Spec Template
Each backend/frontend test doc must include:
- test scope summary
- test environment assumptions
- numbered test cases
- happy path coverage
- error and validation coverage
- authorization coverage where relevant
- loading/empty/error/success UI states where relevant
- platform-specific cases where relevant

## Work Packet Template
Each `work-packet.md` must include:
- exact objective
- files and packages expected to change
- contracts to implement
- tests to create first
- blockers and dependencies
- parallel-safe boundaries
- completion signals
- non-goals
- rollback and risk notes

## Status Rules
- `draft`: useful, but not decision-complete.
- `ready`: implementation can begin without asking product or architecture follow-ups.
- `blocked`: known external dependency prevents implementation.
- `superseded`: replaced by a newer spec or phase direction.

## Source Of Truth Rules
- Product behavior defaults to `PRD_Zuam_v0.3.md` unless explicitly superseded by a later ADR.
- Planning-system rules default to files in `project/_*.md`.
- If a phase or module intentionally overrides the PRD, record the override in `_decision-log.md`.
