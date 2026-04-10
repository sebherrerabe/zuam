---
id: infra-release-observability
title: Infra Release and Observability Work Packet
status: ready
phase: 1
owners:
  - Infra / DevOps
depends_on:
  - monorepo-platform
parallel_group: foundation
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-10
---

# Work Packet

## Objective
Define the release pipeline and minimum observability contract so desktop builds are reproducible, traceable, and easy to debug from the first release.

## Files / Packages Expected To Change
- GitHub Actions workflow definitions.
- Release metadata plumbing.
- Desktop build-time version injection.
- Desktop packaging brand assets and their generation script.

## Contracts To Implement First
- Workflow step order contract.
- Artifact provenance contract.
- CI summary contract.
- Runtime build-metadata contract.
- Direct package-builder invocation contract for Windows releases.
- Checked-in packaging-brand-asset contract for Windows releases.
- Shipping-track backend runtime verification gate.

## Tests To Create First
- `BE-UNIT-INFRA-001`, `BE-UNIT-INFRA-002`, `BE-UNIT-INFRA-003`.
- `BE-UNIT-INFRA-004`
- `FE-UNIT-INFRA-001`, `FE-UNIT-INFRA-003`.

## Blockers / Dependencies
- Requires the workspace shape from `monorepo-platform`.

## Parallel-Safe Boundaries
- Release workflow docs can progress in parallel with app-domain planning, but not before workspace/package names are stable.

## Completion Signals
- A tagged build can be traced end-to-end from commit to artifact to release entry.
- Tagged release automation emits real Windows installer artifacts, not metadata-only placeholders.
- Release automation proves the shipping-track backend runtime suites passed before packaging and publish.

## Non-Goals
- No production telemetry backend.
- No mobile publishing workflow.

## Rollback / Risk Notes
- Release automation should fail closed; ambiguous provenance is worse than a blocked release.
