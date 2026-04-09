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
last_updated: 2026-04-08
---

# Mobile Shell Core

## Objective
Define the Android-first app shell that exposes Zuam's core task surfaces and entry points without re-designing desktop behavior from scratch. This module should reuse the task taxonomy, focus, and detail contracts that already exist on desktop while adapting them to a narrow-screen navigation model.

## Scope In
- Authenticated mobile navigation for Today, Inbox, and task detail.
- Shared draft composer used by quick add and Android share-intent entry.
- Mobile-safe loading, empty, and error states for task browsing.
- Explicit notification and overlay permission education, request, recovery, and dismissed states.
- Narrow-screen-safe access to the existing task detail and focus entry surfaces.

## Scope Out
- Advanced overlay, alarm, and background execution behavior beyond shell-level coordination.
- Widgets, lock-screen surfaces, and OS-specific deep integrations beyond share intent and permission flows.
- New task model features that are not already frozen by Phase 1 and Phase 2 desktop modules.
- Mobile-specific redesign of smart lists, task fields, or focus-session rules.

## Frozen Product Decisions
- The authenticated landing surface is `Today`.
- Top-level mobile navigation is limited to `Today` and `Inbox`; quick add is a global action, not a peer navigation destination.
- Task detail is a pushed single-column screen, not a persistent split view.
- Quick add and share intent open the same draft composer surface and preserve the incoming text verbatim until the user edits it.
- Permission handling is always two-step when possible: in-app explainer first, then OS request, with a recoverable "open settings" path if the request is denied.
- Declining permissions must never block browsing Today, Inbox, or task detail.
- Phase 2 mobile is Android-first and light-mode-first. Dark mode can be derived after the light mockups exist.

## Screen Inventory
- Authenticated shell with Today selected by default
- Inbox list screen
- Task detail screen
- Draft composer opened from quick add
- Draft composer opened from share intent with prefilled text
- Notification permission explainer and denied-state recovery
- Overlay/blocking-surface permission explainer and denied-state recovery
- Loading state
- Empty state
- Error state

## Design Handoff Requirements
- This module stays `draft` until authoritative mobile mockups exist in Figma.
- Mockups must cover every screen in the inventory above before implementation starts.
- The mobile mockups should follow the existing light-mode Zuam desktop visual language while remaining mobile-native.
- Once mockups exist, the module packet should record the authoritative Figma file and node ids before implementation proceeds.

## Requirements
- `MOB-REQ-1`: The mobile shell must land authenticated users on a core navigation surface with Today, Inbox, and task detail access. Tests: `FE-UNIT-MOB-001`, `FE-E2E-MOB-001`.
- `MOB-REQ-2`: The shell must expose quick-add and share-intent entry points that create a draft task. Tests: `FE-UNIT-MOB-002`, `FE-E2E-MOB-002`.
- `MOB-REQ-3`: Permission flows for notifications and overlays must be explicit, dismissible, and recoverable. Tests: `FE-UNIT-MOB-003`, `FE-E2E-MOB-003`.
- `MOB-REQ-4`: Mobile views must preserve accessibility, loading, and error states across narrow screens. Tests: `FE-UNIT-MOB-004`, `FE-E2E-MOB-004`.
- `MOB-REQ-5`: Mobile task browsing must consume the same smart-list, task-detail, and focus-entry contracts already frozen for desktop, rather than defining mobile-only task rules. Tests: `BE-UNIT-MOB-001`, `FE-UNIT-MOB-001`, `FE-UNIT-MOB-004`.
- `MOB-REQ-6`: The quick-add action and share-intent action must resolve to the same draft-composer contract and the same Inbox-default creation behavior. Tests: `BE-UNIT-MOB-002`, `FE-UNIT-MOB-002`, `FE-E2E-MOB-002`.

## Dependencies
- `auth-invite-onboarding` for authenticated entry
- `core-data-model-crud` for task and list contracts
- `task-views` for Today and Inbox query behavior
- `task-detail-basic-editor` for task detail field coverage
- `focus-sessions` for the initial task-linked focus entry CTA

## Readiness Notes
- Product behavior is now substantially frozen.
- Remaining blocker is design completion, not navigation or data ambiguity.
- Once Claude delivers mockups and the node ids are recorded, this module can be upgraded from `draft` to `ready`.

