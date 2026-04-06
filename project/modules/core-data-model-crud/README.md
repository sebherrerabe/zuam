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

# Objective
Define the canonical local data model for users, lists, sections, and tasks, then expose the CRUD surface that the rest of the app builds on.

## Scope In
- Prisma schema for the core task system.
- CRUD, soft delete, and reorder operations for lists and sections.
- CRUD and completion flows for tasks.
- Validation for ownership, hierarchy, and ordering rules.
- Shared DTOs that downstream UI and sync code consume.

## Scope Out
- Google sync logic.
- Rich task body editing.
- Tags, attachments, analytics, calendar, focus sessions, and nudge delivery.
- Multi-user collaboration or sharing.

## Requirements
- `DATA-REQ-001`: A user can create, read, update, reorder, and soft-delete lists and sections. Tests: `BE-E2E-DATA-001`, `FE-UNIT-DATA-001`.
- `DATA-REQ-002`: Tasks can be created, edited, completed, and soft-deleted with stable ownership and ordering rules. Tests: `BE-E2E-DATA-002`, `FE-UNIT-DATA-002`.
- `DATA-REQ-003`: Section assignment and parent-task hierarchy are validated so invalid nesting cannot be persisted. Tests: `BE-E2E-DATA-003`, `FE-UNIT-DATA-003`.
- `DATA-REQ-004`: Core timestamps, completion state, and list counts remain consistent after mutations. Tests: `BE-E2E-DATA-004`, `FE-UNIT-DATA-004`.

## Phase Mapping
- This is a Phase 1 foundation module.
- It is the canonical schema and CRUD contract for later sync, views, and nudge modules.
