---
id: desktop-shell-layout
title: Desktop Shell Layout
status: ready
phase: 1
owners:
  - Frontend Engineer
depends_on:
  - monorepo-platform
  - auth-invite-onboarding
  - core-data-model-crud
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-1-desktop
last_updated: 2026-04-04
---

# Desktop Shell Layout

## Objective
Define the Electron + TanStack Start desktop shell that anchors the three-panel Zuam experience.

## Scope In
- Desktop app bootstrap, route shell, and authenticated app chrome.
- Left sidebar, main task list panel, and right detail panel layout.
- Responsive desktop behavior and a mobile-safe collapsed state for narrow windows.
- Global quick-capture trigger entry point and view switching chrome.

## Scope Out
- Task sync logic, persistence, and scoring.
- Rich task editing, focus timers, and nudge content.
- Android navigation and widget behavior.

## Requirements
- `DSK-REQ-1`: The shell must render sidebar, list, and detail regions with a stable desktop layout. Tests: `FE-UNIT-DSK-001`, `FE-E2E-DSK-001`.
- `DSK-REQ-2`: The shell must expose primary navigation for Today, Next 7 Days, Inbox, lists, and settings. Tests: `FE-UNIT-DSK-002`, `FE-E2E-DSK-002`.
- `DSK-REQ-3`: The shell must support task selection and detail-panel open/close transitions without layout shift. Tests: `FE-UNIT-DSK-003`, `FE-E2E-DSK-003`.
- `DSK-REQ-4`: The shell must support a global quick-capture entry point reachable from keyboard and tray/menu affordances. Tests: `FE-UNIT-DSK-004`, `FE-E2E-DSK-004`.

## Dependency Notes
- Consumes list/task bootstrap data from backend contracts defined in `core-data-model-crud` and `auth-invite-onboarding`.
- Shares layout state with `task-detail-basic-editor` and `task-views`.

