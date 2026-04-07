---
id: project-delivery-testing-architecture
title: Delivery, Testing, And Release Baseline
status: ready
phase: cross-cutting
owners:
  - Infra / DevOps
  - QA / Validation
depends_on:
  - project-conventions
  - project-test-strategy
  - project-decision-log
parallel_group: foundation
source_of_truth:
  - AGENTS.md
  - PRD_Zuam_v0.3.md
last_updated: 2026-04-07
---

# Delivery, Testing, And Release Baseline

## Purpose
This document translates the shared testing strategy into a concrete delivery baseline for local development, CI, release packaging, and observability.

## Monorepo Baseline
- `pnpm` workspaces
- TypeScript project references where useful
- root scripts for:
  - `dev`
  - `build`
  - `test`
  - `typecheck`
  - `lint`
- Add higher-level task orchestration only if plain workspace scripts become painful

## Local Development
- Local Postgres via Docker Compose
- Prisma migrations for schema changes
- environment loading through `@nestjs/config`
- local desktop development through TanStack Start + Electron wrapper

## Testing Baseline
- Backend unit tests: Jest
- Backend integration/e2e: Jest + disposable Postgres database
- Desktop unit/component tests: Vitest + React Testing Library
- Desktop e2e: Playwright
- Mobile e2e: Maestro

## Architecture QA Gates
- Service tests must mock DAO interfaces rather than Prisma.
- DAO integration tests own persistence verification.
- Any service importing Prisma or a database client fails architecture review.
- Companion execution flows must produce audit traces in tests, not only success UI.

## CI Baseline
Use GitHub Actions with separate concerns:
- install + typecheck
- lint
- backend tests
- desktop tests
- mobile tests as mobile work deepens
- desktop packaging only on release/tag workflows

## Release Baseline
- Backend hosting target: Railway
- Database target: Railway Postgres
- Desktop packaging target: Electron Builder + GitHub Releases
- Mobile distribution remains later-phase and should not block desktop release readiness

## Observability Baseline
- structured backend logging
- request IDs and sync trace IDs
- job summaries for Google sync loops
- companion execution audit logging in Phase 4
- release provenance from CI artifacts and tagged builds

## Phase Preview
- Phase 1: local dev bootstrap, CI skeleton, backend tests, desktop tests, packaging path
- Phase 2: broaden e2e coverage for richer task views, focus sessions, and mobile shell
- Phase 3: add regression coverage for progression, analytics, and share-card flows
- Phase 4: add AI runtime/provider tests, memory-governance tests, and permission-policy coverage

## Non-Goals
- No production microservice deployment topology by default.
- No release process that depends on manual file copying.
- No skipping architecture gates for speed once DAO and companion safety boundaries are established.
