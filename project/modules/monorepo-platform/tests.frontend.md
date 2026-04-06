---
id: monorepo-platform
title: Monorepo Platform Frontend Tests
status: ready
phase: 1
owners:
  - Infra / DevOps
depends_on: []
parallel_group: foundation
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-04
---

# Frontend Tests

- `FE-UNIT-MONO-001`: desktop package resolves shared theme tokens and typography tokens from the public shared entrypoint.
- `FE-UNIT-MONO-002`: mobile package resolves shared task/list types from the public shared entrypoint.
- `FE-E2E-MONO-001`: a root-level smoke launch can start the desktop app from the workspace without package-local path hacks.
- `FE-UNIT-MONO-003`: package boundary violations surface as actionable errors instead of silent build failures.
