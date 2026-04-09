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
last_updated: 2026-04-08
---

# Frontend Test Specs

## `FE-UNIT-MOB-001`
- Covers `MOB-REQ-1` and `MOB-REQ-5`.
- The navigation shell lands on Today by default, exposes Today and Inbox as the only top-level destinations, and keeps task detail reachable on narrow screens without losing the origin context.

## `FE-UNIT-MOB-002`
- Covers `MOB-REQ-2` and `MOB-REQ-6`.
- Quick add and share intent open the same draft-composer surface, preserve the incoming text, and submit through the same creation contract.

## `FE-UNIT-MOB-003`
- Covers `MOB-REQ-3`.
- Permission prompts are dismissible, re-openable, and do not trap navigation or task detail access.

## `FE-UNIT-MOB-004`
- Covers `MOB-REQ-4` and `MOB-REQ-5`.
- Loading, empty, and error states remain readable and accessible in single-column layouts for Today, Inbox, and task detail bootstrap.

## `FE-E2E-MOB-001`
- Covers `MOB-REQ-1`.
- Launching the app lands on the authenticated shell with Today visible by default and Inbox reachable in one tap.

## `FE-E2E-MOB-002`
- Covers `MOB-REQ-2` and `MOB-REQ-6`.
- Sharing text into the app opens the draft composer with the source text preserved and creates a draft task without losing that source text.

## `FE-E2E-MOB-003`
- Declining permissions still allows browsing tasks and opening detail views.

## `FE-E2E-MOB-004`
- Rotating or resizing a narrow viewport preserves navigation state and accessible focus order.

## Figma Validation Notes
- Once the mobile mockups exist, the exact authoritative Figma node ids for Today, Inbox, task detail, composer, and permission states must be recorded here before implementation is considered complete.

