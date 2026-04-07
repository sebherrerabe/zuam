---
id: infra-release-observability
title: Infra Release and Observability
status: ready
phase: 1
owners:
  - Infra / DevOps
depends_on:
  - monorepo-platform
parallel_group: foundation
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-06
---

# Infra Release and Observability

This module defines how Zuam is built, packaged, released, and monitored at the repository level. It is phase-1 ready because desktop release automation and basic observability contracts are prerequisites for the first usable build.

## Scope In
- GitHub Actions workflow shape for desktop release builds (`BE-UNIT-INFRA-001`).
- Artifact naming, version stamping, and release provenance (`BE-UNIT-INFRA-002`).
- CI summary and failure-reporting conventions for build/test/release jobs (`BE-UNIT-INFRA-003`).
- Baseline observability hooks for build logs, workflow status, and release metadata (`FE-UNIT-INFRA-001`).

## Scope Out
- Full production observability stack.
- Mobile store publishing.
- Runtime analytics product metrics, which belong to `analytics-insights`.

## Implementation Gate
- The repo is release-ready only when a tagged build can be traced from commit SHA to artifact to published release without ambiguity (`BE-E2E-INFRA-001`).
