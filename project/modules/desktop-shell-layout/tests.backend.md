---
id: desktop-shell-layout
title: Desktop Shell Layout Backend Contracts
status: ready
phase: 1
owners:
  - Frontend Engineer
depends_on:
  - core-data-model-crud
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-1-desktop
last_updated: 2026-04-04
---

# Backend Test Specs

## `BE-UNIT-DSK-001`
- Covers `DSK-REQ-1` and shell bootstrap contract.
- Assert bootstrap payload includes user, lists, smart-list counts, and preference flags.

## `BE-UNIT-DSK-002`
- Covers `DSK-REQ-2`.
- Assert list metadata includes names, counts, icons/colors, and disabled state for non-deletable smart lists.

## `BE-UNIT-DSK-003`
- Covers `DSK-REQ-3`.
- Assert task selection payload includes task id, list id, section id, and detail-ready fields.

## `BE-E2E-DSK-001`
- Covers `DSK-REQ-4`.
- Assert quick-capture entry point resolves to a create-task flow and surfaces validation errors without leaving the shell.

