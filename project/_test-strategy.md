---
id: project-test-strategy
title: Test Strategy
status: ready
phase: cross-cutting
owners:
  - QA / Validation
  - Documentation / DX
depends_on:
  - project-conventions
parallel_group: foundation
source_of_truth:
  - PRD_Zuam_v0.3.md
last_updated: 2026-04-10
---

# Test Strategy

## Principle
Zuam is planned as a spec-driven, test-gated project. Requirements are not complete until they are represented as tests. Implementation starts by materializing the documented failing tests for a slice.

## Testing Baseline
| Surface | Default Tooling | Notes |
|---|---|---|
| Backend unit/integration | Jest | NestJS services, policies, sync logic, scoring, DTO validation |
| Backend API e2e | Jest + Supertest | Boot real Nest app with test DB and mocked Google APIs |
| Shared package tests | Jest | types, serializers, constants, pure scoring helpers |
| Desktop unit/component | Vitest + React Testing Library | TanStack Start web app and Electron renderer code |
| Desktop/electron e2e | Playwright | app shell, overlays, list flows, focus mode, auth handoffs |
| Mobile unit/component | Jest + React Native Testing Library | Expo screens, hooks, local state |
| Mobile e2e | Maestro | Android capture flows, overlay permissions, basic core flows |

## Test Layers
- Unit tests validate deterministic business logic and pure view logic.
- Integration tests validate service boundaries and persistence behavior.
- API e2e tests validate end-to-end request flows across auth, data, and side effects.
- UI component tests validate state rendering and local interactions.
- UI e2e tests validate full workflows, cross-package contracts, and platform behavior.

## Coverage Expectations
Each module must define tests for:
- happy path
- validation failures
- authorization failures where relevant
- empty, loading, error, disabled, and success UI states where relevant
- retry and idempotency where relevant
- sync conflicts and reconciliation where relevant
- telemetry and audit events where relevant
- Electron/Android platform-specific states where relevant

## Environment Rules
- Use a disposable PostgreSQL database for backend integration and e2e.
- Shipping-bar backend modules must include DAO integration tests and API e2e coverage against that disposable Postgres runtime.
- Mock Google Tasks and Calendar APIs only at the provider seam in automated tests unless a later module explicitly defines contract tests against sandbox accounts.
- Fake or in-memory persistence is allowed only for targeted unit tests and local scaffolding; it is not an acceptable substitute for integration/e2e coverage.
- Use deterministic clocks for time-sensitive features such as nudges, deadlines, polling, and focus sessions.
- Use fixture factories rather than hand-written JSON blobs once implementation begins.

## Figma-Backed Frontend Validation
- For any frontend slice backed by mockups, fetch the exact node with the Figma plugin before implementation.
- Required plugin flow: `get_design_context` first, `get_metadata` only to disambiguate or narrow the target, then `get_screenshot`.
- Frontend unit tests and e2e tests do not replace visual comparison. Agents must compare the implemented UI against the fetched screenshot as part of completion.
- The exact node IDs used for comparison should be recorded in the relevant module doc, shared frontend architecture doc, or implementation notes.
- Agents must resolve the reference node from the documented registry first, not from whichever frame happens to look close in the file.
- If a design file contains multiple mockups for related surfaces, the docs must name which node is authoritative for the current slice. If they do not, update the docs before treating the design as implementation-ready.

## Traceability Rules
- Every requirement ID must map to tests.
- Every test doc must cite requirement IDs.
- Work packets must list the first failing tests to create.
- A module cannot be marked `ready` if test docs do not cover its primary flows and failure modes.
- Shipping-bar backend modules must cover restart recovery, durable persistence, and failure-path handling in addition to happy-path API behavior.

## Planning-System Validation
The planning layer itself must satisfy:
- `DOC-E2E-001`: a new engineer can locate the Phase 1 critical path and start from one module.
- `DOC-E2E-002`: an LLM can open `work-packet.md` and identify the contracts plus tests to implement.
- `DOC-UNIT-001`: every module listed in a phase doc exists on disk.
- `DOC-UNIT-002`: every module contains the required files.
- `DOC-UNIT-003`: every requirement references at least one test ID.
- `DOC-UNIT-004`: every test ID is unique and scoped to one module.
- `DOC-UNIT-005`: every dependency resolves to a real phase or module ID.
- `DOC-UNIT-006`: no `ready` module has unresolved open questions.
- `DOC-UNIT-007`: no `ready` shipping-track module documents its primary runtime as in-memory, stub-only, or fake-provider-only.
