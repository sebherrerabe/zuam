---
id: mobile-shell-core
title: Mobile Shell Core
status: draft
phase: 2
owners:
  - Frontend Engineer
depends_on:
  - auth-invite-onboarding
  - core-data-model-crud
  - task-views
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-2-mobile
last_updated: 2026-04-04
---

# Mobile Shell Core

## Objective
Define the Android app shell that exposes Zuam's core task surfaces and mobile entry points.

## Scope In
- Authenticated mobile navigation and core task browsing.
- Quick-add entry points, share intent entry, and permission-gated surfaces.
- Mobile-friendly detail presentation and empty states.

## Scope Out
- Advanced overlay and alarm behavior beyond shell-level coordination.
- Full widget implementation details if they require a separate platform slice.

## Requirements
- `MOB-REQ-1`: The mobile shell must land authenticated users on a core navigation surface with Today, Inbox, and task detail access. Tests: `FE-UNIT-MOB-001`, `FE-E2E-MOB-001`.
- `MOB-REQ-2`: The shell must expose quick-add and share-intent entry points that create a draft task. Tests: `FE-UNIT-MOB-002`, `FE-E2E-MOB-002`.
- `MOB-REQ-3`: Permission flows for notifications and overlays must be explicit, dismissible, and recoverable. Tests: `FE-UNIT-MOB-003`, `FE-E2E-MOB-003`.
- `MOB-REQ-4`: Mobile views must preserve accessibility, loading, and error states across narrow screens. Tests: `FE-UNIT-MOB-004`, `FE-E2E-MOB-004`.

