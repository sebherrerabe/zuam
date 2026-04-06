---
id: monorepo-platform
title: Monorepo Platform
status: ready
phase: 1
owners:
  - Infra / DevOps
depends_on: []
parallel_group: foundation
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-04
---

# Monorepo Platform

The module defines the repository skeleton that all other Zuam work depends on: workspace layout, package boundaries, shared scripts, TypeScript aliasing, and local development conventions. It is implementation-ready because every later slice needs these decisions before code can safely land.

## Scope In
- `pnpm` workspace structure for `packages/backend`, `packages/shared`, `packages/desktop`, and `packages/mobile` (`BE-UNIT-MONO-001`).
- Root-level scripts for install, typecheck, lint, test, and build entrypoints (`BE-UNIT-MONO-002`).
- Package boundary rules for shared code, env loading, and public exports (`BE-UNIT-MONO-003`).
- Local-dev bootstrap conventions for root-first execution and package-specific overrides (`FE-UNIT-MONO-001`).

## Scope Out
- Feature implementation inside backend, desktop, or mobile packages (`BE-UNIT-MONO-004`).
- Release pipelines and artifact publishing details, which belong to `infra-release-observability`.
- Domain schema decisions beyond package boundaries and import surface contracts.

## Implementation Gate
- This slice is ready only when a future engineer can clone the repo, install once, and discover the canonical commands and package entrypoints without ambiguity (`BE-E2E-MONO-001`, `BE-E2E-MONO-002`).
