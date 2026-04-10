---
id: phase-2-core-experience
title: Phase 2 Core Experience
status: ready
phase: phase-2
owners:
  - Product Manager
  - Documentation / DX
depends_on:
  - phase-1-foundation
parallel_group: phase-2
source_of_truth:
  - PRD_Zuam_v0.3.md
last_updated: 2026-04-10
---

# Phase 2 Core Experience

## Goal
Expand the MVP into the primary day-to-day product experience with richer editing, additional task views, focus sessions, Google Calendar context, full nudge coverage, tags and filters, and the first mobile shell.

## Included Modules
- `task-views`
- `focus-sessions`
- `google-calendar-context`
- `mobile-shell-core`
- `tags-filters-smart-lists`

## Entry Dependencies
- Phase 1 contracts for auth, core data, desktop shell, and release foundations are stable.

## Exit Criteria
- Rich editor and attachment direction is frozen.
- Core alternate views are specified.
- Focus-session UX and logging are specified.
- Calendar context and scheduling inputs are specified.
- Mobile shell scope for Phase 2 is frozen.

## Notes
- The desktop/non-mobile Phase 2 slices are complete in code and now serve as stable upstream inputs for Phase 3 analytics and progression work.
- `mobile-shell-core` remains the only deferred Phase 2 module. Its design and implementation should proceed independently without blocking Phase 3 desktop work.
- Phase 3 consumes the current task completion semantics, focus-session completion semantics, and Google Calendar read models from this phase as the source of truth.
- The shipping-first rebaseline pulls `focus-sessions` and `google-calendar-context` onto the active shipping track even though they remain Phase 2 modules. Their backend readiness is now judged against the real runtime path, not against mock completeness.
- `task-views` and `tags-filters-smart-lists` remain valid downstream desktop work, but they must not outrank the shipping-track backend runtime.

## Phase 2 Closure Checklist
- Desktop visual QA is active and tied to approved warm-light baselines.
- Calendar availability-state and suggestion metadata are frozen.
- Task detail persistence is backend-backed.
- Electron preload/runtime is the desktop path for privileged notification behavior.
