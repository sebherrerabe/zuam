---
id: mobile-shell-core
title: Mobile Shell Core Work Packet
status: draft
phase: 2
owners:
  - Frontend Engineer
depends_on:
  - auth-invite-onboarding
  - task-views
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-2-mobile
last_updated: 2026-04-04
---

# Work Packet

## Objective
Create the Android shell that exposes core task access and mobile entry points.

## Inputs
- Mobile-safe task/navigation bootstrap.
- Permission model and draft creation contract.
- Share-intent and quick-add surface rules.

## Outputs
- Mobile navigation shell.
- Draft task entry flow.
- Permission prompt and recovery flow.

## Tests To Create First
- `FE-UNIT-MOB-001`
- `FE-UNIT-MOB-002`
- `FE-E2E-MOB-001`

## Blockers And Dependencies
- Requires mobile-safe bootstrap payloads and a clear permission persistence strategy.

## Parallel-Safe Boundaries
- Shell navigation can be implemented independently of widget and overlay platform work.

## Completion Signals
- App opens into a usable task surface on narrow screens.
- Quick-add and share-intent flows produce the same draft task path.

## Non-Goals
- No widget implementation details.
- No full overlay/alarm platform work.
- No separate Android-specific analytics slice.

## Rollback / Risk Notes
- Risk: permission prompts can become modal dead ends if they are not resumable.
- Risk: draft creation can diverge from desktop quick-add if the payload contract is not shared.

