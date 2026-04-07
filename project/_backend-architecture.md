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
last_updated: 2026-04-07
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
- Create one shared Prisma bootstrap module under a common database package or folder.
- Export Prisma-backed DAO implementations, not Prisma itself, to feature services.
- Use DAO interfaces where service tests need mocking stability.
- Keep persistence mapping close to each DAO instead of leaking Prisma models through service contracts.

## Transactions
- Transaction coordination must remain below the service boundary.
- Preferred shape:
  - a DAO transaction runner
  - transactional DAO factories
  - or a unit-of-work helper that returns DAO-scoped transactional implementations
- Services may request transactional execution, but still call DAOs inside that scope.

## Integration Rules
- Google Tasks and Calendar clients live in dedicated provider modules.
- Sync logic belongs in services, not DAOs.
- Conflict resolution belongs in services, not DAOs.
- WebSocket gateways should push invalidation, progress, focus, and nudge events; they should not own domain logic.

## Testing Expectations
- Controller tests mock services.
- Service unit tests mock DAO interfaces.
- DAO integration tests hit a real disposable Postgres database.
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
