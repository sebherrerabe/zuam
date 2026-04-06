---
id: desktop-shell-layout
title: Desktop Shell Layout Work Packet
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

# Work Packet

## Objective
Implement the desktop shell scaffold that all desktop task flows mount into.

## Inputs
- Authenticated user bootstrap data.
- List/task counts and selection metadata.
- Shell layout tokens and breakpoint rules.

## Outputs
- Desktop shell routes and frame.
- Sidebar, main content, and detail panel containers.
- Quick-capture entry point wiring.

## Tests To Create First
- `FE-UNIT-DSK-001`
- `FE-E2E-DSK-001`
- `FE-E2E-DSK-003`

## Blockers And Dependencies
- Requires stable bootstrap response shape from backend.
- Requires task detail and list selection contracts before deep interactions.

## Parallel-Safe Boundaries
- Can be built alongside backend list/task CRUD as long as bootstrap contracts stay fixed.

## Completion Signals
- Shell renders without placeholder chrome.
- View switching and task selection preserve state.
- Quick capture opens consistently from every supported trigger.

## Non-Goals
- No rich editor or sync behavior.
- No mobile navigation.

## Rollback / Risk Notes
- Risk: layout churn if selection state is coupled to route structure.
- Risk: focus traps can break if quick-capture mounts outside the shell tree.

