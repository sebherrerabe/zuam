---
id: infra-release-observability
title: Infra Release and Observability Contracts
status: ready
phase: 1
owners:
  - Infra / DevOps
depends_on:
  - monorepo-platform
parallel_group: foundation
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-09
---

# Contracts

## Build / Release Contract
- `release-desktop.yml` must run install, lint, typecheck, test, build, package, and publish in that order (`BE-UNIT-INFRA-001`).
- Release artifacts must include version, git SHA, build timestamp, and package channel metadata (`BE-UNIT-INFRA-002`).
- The release process must fail if provenance metadata is missing or inconsistent with the tagged commit (`BE-UNIT-INFRA-002`).
- Tagged desktop releases must generate at least one installable Windows artifact and one portable Windows artifact before publish is allowed (`BE-E2E-INFRA-001`).
- Release publication must upload the packaged artifacts plus release metadata/event files to the matching GitHub Release entry (`BE-E2E-INFRA-001`).
- Desktop packaging must treat `electron-builder` as the primary packager and keep metadata/provenance generation in a separate post-package step (`BE-UNIT-INFRA-001`).

## Observability Contract
- Every CI job must emit a summary that names the workflow, package, and failing stage (`BE-UNIT-INFRA-003`).
- Release publication must emit a structured event/message that downstream tools can use for notifications or audit trails (`BE-E2E-INFRA-001`).

## UI Contract
- The desktop app must be able to read build metadata at runtime and display a version/update state in its about/settings surface when that surface exists (`FE-UNIT-INFRA-001`).

## Integration Contract
- A successful release trace must connect commit SHA, workflow run, artifact name, and published release entry (`BE-E2E-INFRA-001`).
