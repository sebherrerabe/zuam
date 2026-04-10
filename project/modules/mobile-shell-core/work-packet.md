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
last_updated: 2026-04-10
---

# Work Packet

## Shipping-First Status
- This packet is explicitly non-blocking until the desktop shipping bar is complete.
- Mobile work consumes the shipped auth/data contracts; it must not drive backend scope before the desktop core runtime is real.

## Objective
Create the Android-first shell that exposes Today, Inbox, task detail, and the shared draft composer while preserving permission recovery and narrow-screen accessibility.

## Inputs
- Mobile-safe task/navigation bootstrap.
- Shared draft-composer contract for quick add and share intent.
- Notification and overlay permission persistence strategy.
- Authoritative Figma mobile mockups once design handoff is complete.

## Outputs
- Mobile navigation shell for Today and Inbox.
- Shared draft-composer flow reached from quick add and share intent.
- Recoverable notification and overlay permission flows.
- Mobile module packet updated with Figma node references after design handoff.

## Tests To Create First
- `FE-UNIT-MOB-001`
- `FE-UNIT-MOB-002`
- `FE-UNIT-MOB-003`
- `FE-E2E-MOB-001`

## Blockers And Dependencies
- Requires authoritative Figma mobile mockups before visual implementation starts.
- Requires mobile-safe bootstrap payloads and a clear permission persistence strategy.
- Requires the current desktop-backed task query and task-detail contracts to remain stable.

## Parallel-Safe Boundaries
- Shell navigation, draft-composer state, and permission persistence can be implemented independently of widgets, alarms, and advanced overlay platform work.
- Share-intent ingestion can be implemented independently from final visual polish as long as it targets the shared draft-composer contract.

## Completion Signals
- App opens into a usable Today surface on narrow screens.
- Inbox and task detail remain reachable without permission acceptance.
- Quick add and share intent produce the same draft-composer path and the same creation contract.
- The module packet records authoritative Figma mobile node ids for the implemented surfaces.

## Non-Goals
- No widget implementation details.
- No full overlay/alarm platform work.
- No separate Android-specific analytics slice.
- No mobile-only task semantics that diverge from desktop.

## Rollback / Risk Notes
- Risk: permission prompts can become modal dead ends if they are not resumable.
- Risk: draft creation can diverge from desktop quick-add if the payload contract is not shared.
- Risk: starting implementation before the mockups land will cause avoidable navigation and spacing churn.

