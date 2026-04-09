---
id: mobile-shell-core
title: Mobile Shell Core Contracts
status: draft
phase: 2
owners:
  - Frontend Engineer
depends_on:
  - core-data-model-crud
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-2-mobile
last_updated: 2026-04-08
---

# Contracts

## UI Contracts
- Persisted mobile shell state is `MobileShellState` and includes `activeTopLevelView`, `selectedTaskId`, `draftComposer`, and `permissionPrompts`.
- `activeTopLevelView` is one of `today` or `inbox`. No third top-level destination is required in this wave.
- Quick add opens a shared draft composer from a global action; share intent opens the same composer with prefilled source text.
- Task detail is rendered as a full-screen pushed route with predictable back navigation to the originating top-level view.
- Permission prompts must be explicit, dismissible, and never block recovery to Today, Inbox, or task detail.
- Loading, empty, and error states must be defined for Today, Inbox, detail bootstrap, and permission recovery surfaces.

## Event Contracts
- `mobile:quickAddOpen`, `mobile:shareIntentReceived`, `mobile:permissionPromptShown`, and `mobile:permissionGranted`.
- `mobile:permissionDeferred` records an explicit user dismissal without mutating task state.
- `mobile:detailOpened` carries `taskId` and `originView`.
- `mobile:draftSubmitted` carries `entrySource`, `initialText`, `finalText`, and `targetListId`.

## Data Contracts
- `MobileShellBootstrap` includes:
  - authenticated user identity needed for the header/shell
  - top-level badge counts for Today and Inbox
  - the default `activeTopLevelView`
  - recoverable loading/error metadata for narrow-screen clients
- `MobileTaskListQuery` reuses the existing desktop-backed task query contracts and cannot redefine smart-list semantics.
- `MobileDraftComposerInput` includes `entrySource`, `initialText`, `targetListId`, `dueDate`, `priority`, and `tagSlugs`.
- Draft task creation accepts minimal payloads and routes unscheduled tasks to Inbox by default.
- `MobilePermissionState` is stored separately from task data and includes notification and overlay permission status, dismissal timestamps, and whether the user has already seen the explainer copy.
- Share-intent ingestion preserves the source text until the user edits or submits the draft.

## Integration Contracts
- Mobile consumes shared task, focus, and calendar-aware hint contracts from `packages/shared`.
- Mobile permission persistence belongs in a shell/preferences boundary, not inside task entities.
- The first implementation pass must be anchored to authoritative Figma mobile nodes once the design handoff is complete.

