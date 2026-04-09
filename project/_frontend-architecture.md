---
id: project-frontend-architecture
title: Frontend Architecture Baseline
status: ready
phase: cross-cutting
owners:
  - Frontend Engineer
  - Documentation / DX
depends_on:
  - project-conventions
  - project-decision-log
parallel_group: foundation
source_of_truth:
  - AGENTS.md
  - PRD_Zuam_v0.3.md
last_updated: 2026-04-08
---

# Frontend Architecture Baseline

## Purpose
This document defines the default frontend architecture for Zuam's desktop and mobile clients. Module docs still own feature behavior, but UI implementation should prefer these patterns unless a module explicitly needs something different.

## Package Baseline
- `packages/desktop`: TanStack Start web app wrapped by Electron
- `packages/mobile`: Expo / React Native client
- `packages/shared`: typed contracts, zod schemas, enums, and pure helpers shared across clients and backend

## Desktop Stack
- TanStack Start
- TanStack Router
- TanStack Query
- TanStack Form
- Tailwind CSS
- Electron with preload IPC boundary
- Zustand for ephemeral UI state
- `@pixi/react` only for animated progression/avatar surfaces

## Desktop State Rules
- TanStack Query owns server state, caching, invalidation, and mutations.
- Zustand owns ephemeral shell state such as:
  - selected task
  - active center view
  - sidebar collapse state
  - modal/sheet visibility
  - AI companion panel state
- Do not put shell UI state into Query.
- Use a dedicated state machine library only for clearly stateful flows such as:
  - focus timer lifecycle
  - AI approval flow
  - auth handoff flows

## Desktop Feature Shape
Recommended package structure:

```text
src/
  routes/
  features/
    shell/
    tasks/
    views/
    focus/
    progression/
    ai-companion/
  lib/
    api/
    state/
    ipc/
electron/
```

## Desktop UI Rules
- The three-panel shell should be implemented as persistent layout routes, not duplicated per screen.
- Task views should swap within a shared center-panel route state so filters and context can persist across view changes.
- Task detail remains the primary editing surface; progression, AI, and focus affordances are secondary contextual layers.
- AI companion UI must render typed review surfaces, not markdown-only blobs.

## Figma Workflow Baseline
- Frontend agents must fetch the exact design node with the Figma plugin before implementing a Figma-backed slice.
- Required order: `get_design_context` for the target node, `get_metadata` only when the target node is ambiguous or the frame is too large, then `get_screenshot` for visual validation.
- The fetched screenshot is part of implementation context, not an optional extra. Do not mark a Figma-backed frontend slice complete without comparing the built UI against the screenshot.
- If the design file contains multiple plausible mockups, the relevant module doc or this shared architecture doc must identify which node is authoritative before implementation continues.
- Agents must check the registry below before choosing a frame. Do not default to older nodes when a newer authoritative reference exists in the registry.
- If a slice has no exact Figma node yet, use the nearest host frame as the visual baseline and explicitly record that the styling is an inference.

## Current Light Mockup Registry
- `155:2` `v3 — Warm Light Mode`: authoritative current light-mode design-system canvas for desktop and mobile brand language.
- `155:3` `Desktop Shell — Today (light)`: canonical current desktop shell reference for sidebar, progression card, quick capture, task list density, and shell tone.
- `155:233` `Detail Panel`: canonical current task detail reference inside the warm-light system.
- `198:2` `Zuamy Planning Workspace (light)`: separate planning/AI workspace reference. This is not the Phase 1 desktop shell and should not replace `155:3` when implementing `desktop-shell-layout`.
- `1:19` and `1:255` are legacy light references kept for historical comparison only. Do not use them as the default implementation baseline when `155:2` covers the slice.

## Mockup Coverage Rules
- `desktop-shell-layout` maps to `155:3`.
- `task-detail-basic-editor` maps to `155:233`.
- `google-tasks-sync` currently has no dedicated frozen sync card; use `155:3` as the shell host reference and record UI-card placement as an inference until a dedicated sync node exists.
- `nudge-engine` currently has no dedicated frozen nudge modal frame; use the `155:2` warm-light system and `155:233` detail language as the nearest reference and record the modal treatment as an inference until a dedicated node exists.
- `mobile-shell-core` should use `155:2` as the current design-system reference until authoritative mobile-specific nodes are documented.
- `198:2` should be treated as a later AI companion/planning workspace surface unless a module doc explicitly scopes it in.

## Focus And Progression
- Focus session timing should use a client-side state machine plus backend synchronization.
- Progression cards, history, and settings stay in standard React DOM.
- Use PixiJS only where avatar rendering or sprite animation materially benefits from it.

## Electron Responsibilities
Electron main process owns:
- tray/menu integration
- desktop notifications
- global quick-capture shortcut
- local AI provider adapters and secure provider runtime hooks
- native filesystem or secret access where needed

Renderer rules:
- no direct Node access from the renderer
- all privileged access goes through preload IPC

## Mobile Baseline
- Expo
- Expo Router
- TanStack Query
- shared typed API client from `packages/shared`

Mobile scope should start with:
- browsing core task views
- quick capture
- task detail
- basic focus entry points

## Testing Expectations
- Desktop unit/component tests: Vitest + React Testing Library
- Desktop e2e: Playwright
- Mobile unit tests: Jest where needed
- Mobile e2e: Maestro

## Phase Preview
- Phase 1: desktop shell, task detail editor, nudge surfaces, Google Tasks-backed core flows
- Phase 2: richer task views, focus sessions, mobile shell baseline, calendar-aware UI
- Phase 3: analytics-insights, progression surfaces, share-card export
- Phase 4: AI companion workspace, layered review UI, advanced settings, public progression profile surfaces

## Non-Goals
- No global state monolith for all UI concerns.
- No Electron-only business logic in the renderer.
- No forced PixiJS dependency for ordinary UI surfaces.
