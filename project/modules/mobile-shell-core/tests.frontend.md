---
id: mobile-shell-core
title: Mobile Shell Core Frontend Tests
status: draft
phase: 2
owners:
  - Frontend Engineer
depends_on:
  - task-views
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-2-mobile
last_updated: 2026-04-04
---

# Frontend Test Specs

## `FE-UNIT-MOB-001`
- Covers `MOB-REQ-1`.
- The navigation shell shows core tabs and keeps detail navigation reachable on narrow screens.

## `FE-UNIT-MOB-002`
- Covers `MOB-REQ-2`.
- Quick-add and share-intent entry points open the same draft surface and preserve the typed text.

## `FE-UNIT-MOB-003`
- Covers `MOB-REQ-3`.
- Permission prompts are dismissible, re-openable, and do not trap navigation.

## `FE-UNIT-MOB-004`
- Covers `MOB-REQ-4`.
- Loading and error states remain readable and accessible in single-column layouts.

## `FE-E2E-MOB-001`
- Launching the app lands on the authenticated core surface with Today visible by default.

## `FE-E2E-MOB-002`
- Sharing text into the app creates a draft task without losing the source text.

## `FE-E2E-MOB-003`
- Declining permissions still allows browsing tasks and opening detail views.

## `FE-E2E-MOB-004`
- Rotating or resizing a narrow viewport preserves navigation state and accessible focus order.

