---
id: project-backend-architecture
title: Backend Architecture Baseline
status: ready
phase: cross-cutting
owners:
  - Backend Engineer
  - Documentation / DX
depends_on:
  - project-conventions
  - project-decision-log
parallel_group: foundation
source_of_truth:
  - AGENTS.md
  - PRD_Zuam_v0.3.md
last_updated: 2026-04-10
---

# Backend Architecture Baseline

## Purpose
This document locks the default backend implementation shape for Zuam across phases. Module docs still define behavior, but backend implementation should start from these architectural defaults unless a later ADR overrides them.

## Core Boundary
The canonical NestJS flow is:

`controller -> service -> dao`

Rules:
- Controllers handle transport, auth guards, DTO validation, and response shaping.
- Services own business rules, orchestration, conflict handling, and cross-module coordination.
- DAOs are the only layer allowed to touch Prisma, the database connection, or raw persistence queries.
- No service may import Prisma, a database connection, or raw SQL.

## Package Baseline
- `packages/backend`: NestJS modular monolith
- `packages/shared`: shared DTOs, enums, event names, zod schemas, and API-facing contracts only

## Recommended Backend Stack
- NestJS
- PostgreSQL
- Prisma ORM
- `@nestjs/config`
- `@nestjs/schedule`
- `@nestjs/websockets` with Socket.IO
- `googleapis`
- `class-validator`
- `class-transformer`
- `zod` in `packages/shared` for cross-package schemas

## Module Shape
Each backend domain module should default to:

```text
src/modules/<domain>/
  controller/
  service/
  dao/
  dto/
  types/
```

Recommended NestJS modules by product slice:
- `auth`
- `lists`
- `sections`
- `tasks`
- `googleTasksSync`
- `googleCalendarContext`
- `focusSessions`
- `nudges`
- `analyticsInsights`
- `playerProgression`
- `aiCompanion`
- `publicProfiles`

## Persistence Layer Rules
- Create one shared Prisma/Postgres bootstrap module under a common database package or folder.
- Export Prisma-backed DAO implementations, not Prisma itself, to feature services.
- Use explicit DAO interfaces for shipping-track services: `AuthDao`, `ListsDao`, `SectionsDao`, `TasksDao`, `FocusSessionsDao`, `GoogleTasksSyncDao`, `GoogleCalendarContextDao`, and `NudgesDao`.
- Keep persistence mapping close to each DAO instead of leaking Prisma models through service contracts.
- Treat in-memory DAO implementations as test-only or prototype-only scaffolding; the canonical runtime path is Prisma-backed.

## Durable Shipping Records
The shared Prisma/Postgres runtime must durably represent at least:
- `User`
- `InviteToken`
- `UserSession`
- `List`
- `Section`
- `Task`
- `TaskSyncState`
- `FocusSession`
- `CalendarContextSnapshot`
- `NudgeSchedule` and delivery history records

## Provider Adapter Rules
- External integrations must be expressed behind provider interfaces.
- Shipping-track provider interfaces include `GoogleOAuthProvider`, `GoogleTasksClient`, and `GoogleCalendarClient`.
- Fake or stub provider implementations are test-only. They do not satisfy module completion for a `ready` runtime path.
- Services orchestrate adapters plus DAOs; adapters do not reach into service logic.

## Transactions
- Transaction coordination must remain below the service boundary.
- Preferred shape:
  - a DAO transaction runner
  - transactional DAO factories
  - or a unit-of-work helper that returns DAO-scoped transactional implementations
- Services may request transactional execution, but still call DAOs inside that scope.

## Integration Rules
- Google OAuth, Tasks, and Calendar clients live in dedicated provider modules.
- Sync logic belongs in services, not DAOs.
- Conflict resolution belongs in services, not DAOs.
- WebSocket gateways should push invalidation, progress, focus, and nudge events; they should not own domain logic.

## Scheduler And Locking Rules
- Polling or scheduler-driven features must run through `@nestjs/schedule` or an equivalent scheduler boundary.
- Google Tasks sync, Google Calendar refresh, and nudge scheduling must persist lock or lease state durable enough to prevent duplicate runs after restart.
- Trigger handling must be idempotent so webhook, manual trigger, and poller signals can converge on one safe execution path.
- Restart recovery behavior must be documented in the module contracts and tested at integration/e2e level.

## Testing Expectations
- Controller tests mock services.
- Service unit tests mock DAO interfaces.
- DAO integration tests hit a real disposable Postgres database.
- Shipping-track API e2e tests boot the real Nest app against disposable Postgres with external providers mocked only at the adapter seam.
- Sync and conflict-resolution tests live at service/integration level, not DAO level.

## Phase Preview
- Phase 1: establish NestJS module skeleton, Prisma schema, DAO rule, auth, CRUD, Google Tasks sync, nudges
- Phase 2: add calendar context, focus session backend flows, richer list/filter/query endpoints
- Phase 3: add analytics summaries and progression event storage over stable task/focus contracts
- Phase 4: add AI companion orchestration endpoints, approval/audit flows, public profile APIs

## Non-Goals
- No microservice split by default.
- No raw repository pattern outside the DAO layer.
- No service-level direct persistence shortcuts for speed.
