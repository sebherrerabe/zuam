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
last_updated: "2026-04-10"
---

# Contracts

## REST API
### Lists
- `GET /lists`
- `POST /lists`
- `PATCH /lists/:id`
- `DELETE /lists/:id`
- `PATCH /lists/:id/reorder`
- Inputs and outputs must include name, color, icon, sort order, and deletion state.
- Tests: `BE-E2E-DATA-001`, `BE-E2E-DATA-004`.

### Sections
- `GET /lists/:listId/sections`
- `POST /lists/:listId/sections`
- `PATCH /sections/:id`
- `DELETE /sections/:id`
- `PATCH /sections/:id/reorder`
- Tests: `BE-E2E-DATA-001`, `BE-E2E-DATA-003`, `BE-E2E-DATA-004`.

### Tasks
- `GET /tasks`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `POST /tasks/:id/complete`
- The list endpoint must support filter parameters for list, section, date, and completion state.
- Tests: `BE-E2E-DATA-002`, `BE-E2E-DATA-003`, `BE-E2E-DATA-004`.

## Data Contracts
- `List`: `id`, `userId`, `name`, `color`, `icon`, `sortOrder`, `isDeleted`, `createdAt`, `updatedAt`.
- `Section`: `id`, `listId`, `name`, `sortOrder`, `isCollapsed`, `createdAt`, `updatedAt`.
- `Task`: `id`, `listId`, `sectionId`, `parentTaskId`, `title`, `notes`, `dueDate`, `completed`, `completedAt`, `sortOrder`, `createdAt`, `updatedAt`.
- Invariants: a section belongs to exactly one list, a task cannot point at a section from another list, and parent task nesting must stay within the allowed depth.
- Tests: `BE-E2E-DATA-002`, `BE-E2E-DATA-003`.

## Backend Interface Contract
- `ListsDao`
  - responsibilities: list by user, create/update/delete, reorder, count active children
- `SectionsDao`
  - responsibilities: list by list, create/update/delete, reorder, validate list ownership boundaries
- `TasksDao`
  - responsibilities: query tasks, create/update/delete/complete, enforce hierarchy lookups, update task rollups
- Services consume these interfaces only. The shipping runtime path is Prisma/Postgres-backed.

## Frontend Contract
- The desktop shell consumes normalized list, section, and task DTOs for the sidebar, main list, and detail panel.
- Create, edit, reorder, complete, and delete actions must surface optimistic loading and failure states.
- Empty states must distinguish "no data yet" from "filtered to nothing".
- Tests: `FE-UNIT-DATA-001`, `FE-UNIT-DATA-002`, `FE-UNIT-DATA-003`, `FE-UNIT-DATA-004`.

## Event Contract
- `task:created`, `task:updated`, `task:deleted`, `list:updated`, `section:updated`.
- Payloads must include the canonical entity id, owning list id when relevant, and updated timestamps.
- Tests: `BE-E2E-DATA-004`, `FE-UNIT-DATA-004`.

## Runtime Notes
- Persistent CRUD behavior after restart is part of the contract.
- `CoreDataStore`-style in-memory persistence may exist for prototype UI flows only and does not satisfy completion.
