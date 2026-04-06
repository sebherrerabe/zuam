---
id: desktop-shell-layout
title: Desktop Shell Layout Frontend Tests
status: ready
phase: 1
owners:
  - Frontend Engineer
depends_on:
  - task-detail-basic-editor
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-1-desktop
last_updated: 2026-04-04
---

# Frontend Test Specs

## `FE-UNIT-DSK-001`
- Covers `DSK-REQ-1`.
- Render three persistent regions with correct desktop proportions and no overlapping chrome.

## `FE-UNIT-DSK-002`
- Covers `DSK-REQ-2`.
- Sidebar items reflect active view, unread counts, and disabled behavior for protected smart lists.

## `FE-UNIT-DSK-003`
- Covers `DSK-REQ-3`.
- Selecting a task opens the detail panel and preserves list scroll position and selection focus.

## `FE-UNIT-DSK-004`
- Covers `DSK-REQ-4`.
- Global hotkey and tray/menu action both open the same quick-capture surface.

## `FE-E2E-DSK-001`
- Desktop shell loads into authenticated state with the expected three-panel layout.

## `FE-E2E-DSK-002`
- Switching from Today to a specific list updates the main panel without a full reload.

## `FE-E2E-DSK-003`
- Narrow desktop windows collapse the detail panel cleanly and preserve accessibility focus order.

