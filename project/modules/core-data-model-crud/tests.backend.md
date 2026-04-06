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

# Backend Test Spec

## `BE-E2E-DATA-001` List and section CRUD
- Create, update, reorder, and soft-delete lists and sections for the authenticated user.
- Assert foreign-owner access is rejected and ordering remains stable after moves.

## `BE-E2E-DATA-002` Task CRUD and completion
- Create, read, update, complete, and soft-delete tasks.
- Assert completion sets `completedAt`, soft delete hides the record from active queries, and invalid IDs fail safely.

## `BE-E2E-DATA-003` Hierarchy validation
- Reject tasks whose parent section, parent task, or nesting depth violates the schema rules.
- Assert cross-list references and circular parent relationships are blocked.

## `BE-E2E-DATA-004` Mutation consistency
- After CRUD mutations, list counts, timestamps, and soft-delete flags remain internally consistent.
- Assert repeated writes are idempotent where applicable and emit the correct update events.

## `BE-E2E-DATA-005` Authorization and ownership
- Reject any mutation or read that targets another user's records.
- Assert unauthenticated requests return `401` and forbidden requests return `403` or `404` by contract.
