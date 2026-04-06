---
id: core-data-model-crud
title: Core Data Model and CRUD
status: ready
phase: phase-1-foundation
owners:
  - Backend Engineer
depends_on:
  - auth-invite-onboarding
parallel_group: phase1-data
source_of_truth: PRD_Zuam_v0.3.md
last_updated: "2026-04-04"
---

# Work Packet

## Objective
Establish the canonical local schema and CRUD surface for lists, sections, and tasks.

## Files and Packages Expected To Change
- `packages/backend/prisma/schema.prisma`
- `packages/backend/src/lists/*`
- `packages/backend/src/sections/*`
- `packages/backend/src/tasks/*`
- Shared DTO and type exports used by the desktop app.

## Contracts To Implement
- List CRUD and reorder routes.
- Section CRUD and reorder routes.
- Task CRUD and complete routes.
- Ownership, nesting, and soft-delete invariants.

## Tests To Create First
- `BE-E2E-DATA-001` through `BE-E2E-DATA-005`.
- `FE-UNIT-DATA-001` through `FE-UNIT-DATA-004`.

## Blockers and Dependencies
- Requires the auth boundary to define user ownership.
- Must settle the canonical task/list/section ids before Google sync is layered on top.

## Parallel-Safe Boundaries
- Prisma schema work can proceed independently of desktop UI as long as DTOs stay stable.
- List and task UI can be built against mock data while mutation contracts are finalized.

## Completion Signals
- Lists, sections, and tasks can be created and mutated end-to-end with validation.
- Invalid hierarchy and ownership errors are rejected consistently in backend and frontend.

## Non-Goals
- No rich text editor.
- No sync, tags, analytics, calendar, or focus timer behavior.

## Risks
- Ordering bugs can break list and section rendering if the schema does not lock stable sort semantics.
- Soft-delete rules must be explicit so the desktop shell does not accidentally surface deleted entities.
