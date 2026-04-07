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
last_updated: 2026-04-07
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
