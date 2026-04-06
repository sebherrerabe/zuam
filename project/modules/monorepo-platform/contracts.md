---
id: monorepo-platform
title: Monorepo Platform Contracts
status: ready
phase: 1
owners:
  - Infra / DevOps
depends_on: []
parallel_group: foundation
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-04
---

# Contracts

## Repository Contract
- `pnpm-workspace.yaml` must include every first-party package and the `project/` planning tree when workspace tooling scans the repo (`BE-UNIT-MONO-001`, `BE-UNIT-MONO-002`).
- Root `package.json` must expose canonical scripts named `dev`, `lint`, `test`, `typecheck`, and `build` so automation can target the repo uniformly (`BE-UNIT-MONO-002`).
- Public imports must flow through package entrypoints only; deep imports across package internals are forbidden (`BE-UNIT-MONO-003`).

## Environment Contract
- Environment variables are loaded from a single documented source of truth per package, with root-level overrides reserved for shared tooling (`BE-UNIT-MONO-003`).
- Missing required env vars must fail fast with a readable message that names the package and variable (`BE-UNIT-MONO-005`).

## Integration Contract
- The backend, desktop, and mobile packages each own their own runtime entrypoints, but they all obey the same workspace lifecycle commands (`BE-E2E-MONO-001`).
- Shared types and constants live in `packages/shared` and are consumed as public exports only (`BE-UNIT-MONO-003`).

## Frontend Contract
- The desktop and mobile packages must be able to resolve shared theme tokens and shared task/list types without relative-path coupling (`FE-UNIT-MONO-001`, `FE-UNIT-MONO-002`).
