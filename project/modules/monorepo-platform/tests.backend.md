---
id: monorepo-platform
title: Monorepo Platform Backend Tests
status: ready
phase: 1
owners:
  - Infra / DevOps
depends_on: []
parallel_group: foundation
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-04
---

# Backend Tests

- `BE-UNIT-MONO-001`: workspace validation rejects a missing or malformed `pnpm-workspace.yaml`.
- `BE-UNIT-MONO-002`: root scripts resolve to the documented command names and execute the expected package selectors.
- `BE-UNIT-MONO-005`: package bootstrap fails clearly when a required env var is absent.
- `BE-UNIT-MONO-004`: backend package can import only from `packages/shared` public exports, not deep internal files.
- `BE-UNIT-MONO-003`: CI-type smoke test validates that root test/typecheck/build targets exist for every first-party package.
- `BE-E2E-MONO-001`: a fresh checkout can install and enumerate all workspace packages using the documented root workflow.
- `BE-E2E-MONO-002`: a package runner can target backend, desktop, and mobile independently without cross-package path hacks.
