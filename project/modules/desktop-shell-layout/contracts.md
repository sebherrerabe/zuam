---
id: desktop-shell-layout
title: Desktop Shell Layout Contracts
status: ready
phase: 1
owners:
  - Frontend Engineer
depends_on:
  - monorepo-platform
  - core-data-model-crud
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-1-desktop
last_updated: 2026-04-04
---

# Contracts

## UI Contracts
- Route shell exposes three persistent regions: sidebar, task list, detail panel.
- Sidebar supports system lists, custom lists, tags, filters, and settings entry.
- Detail panel is a slide-over on desktop and a full-panel takeover only when viewport constraints force it.
- Shell preserves selection state when switching views.

## State Contracts
- `AppShellState` contains `activeView`, `activeListId`, `activeTaskId`, `sidebarCollapsed`, and `commandPaletteOpen`.
- `activeView` accepts `inbox`, `today`, `next7days`, `list`, `kanban`, `matrix`, `calendar`, `focusQueue`.
- `commandPaletteOpen` is a transient shell state only; it must not mutate task data.

## Integration Contracts
- Shell bootstrap expects authenticated user info plus list counts, active preferences, and the selected start view.
- Quick capture launches as a modal shell action and returns either `taskCreated` or `dismissed`.
- Shell-level errors must degrade to an inline recovery state rather than a blank screen.

