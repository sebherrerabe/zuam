---
id: project-decision-log
title: Architectural Decision Log
status: ready
phase: cross-cutting
owners:
  - Product Manager
  - Documentation / DX
depends_on:
  - project-conventions
parallel_group: foundation
source_of_truth:
  - PRD_Zuam_v0.3.md
last_updated: 2026-04-04
---

# Architectural Decision Log

## ADR-001: Canonical Planning Surface
- Status: accepted
- Date: 2026-04-04
- Context: The repository is pre-code and needs an implementation-authoritative documentation layer for humans and LLMs.
- Decision: Use `project/` as the canonical planning directory instead of `projects/`.
- Consequences: All future planning docs must live in `project/`; any skill or script expecting `projects/` must be adapted or treated as a legacy convention.
- Supersedes: none
- Superseded by: none

## ADR-002: Planning Model
- Status: accepted
- Date: 2026-04-04
- Context: The product has multiple packages and platforms, but implementation must remain parallelizable and LLM-friendly.
- Decision: Organize planning as `phases + reusable modules`, with vertical slices as the primary planning and execution unit.
- Consequences: Phase docs become sequencing documents; module docs become implementation packets.
- Supersedes: none
- Superseded by: none

## ADR-003: Acceptance Language
- Status: accepted
- Date: 2026-04-04
- Context: Ambiguous prose creates drift during LLM implementation.
- Decision: Use contract-first documentation with executable-style test specs as the definition of done.
- Consequences: No module is `ready` without both contracts and tests.
- Supersedes: none
- Superseded by: none

## ADR-004: Testing Baseline
- Status: accepted
- Date: 2026-04-04
- Context: The project needs a consistent default toolchain across backend, desktop, and mobile.
- Decision: Use Jest for backend/shared/mobile unit layers, Vitest + React Testing Library for desktop unit layers, Playwright for desktop e2e, and Maestro for mobile e2e.
- Consequences: Module docs should assume these defaults unless a future ADR changes them.
- Supersedes: none
- Superseded by: none
