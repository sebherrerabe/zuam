# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Mirror**: `AGENTS.md` contains the same guidance for other AI agents (Codex, Copilot, Cursor). Keep both files in sync when updating.

## Project Overview

Zuam is an ADHD-optimized task management app with psychologically-informed nudges that escalate until you act. Bidirectional Google Tasks/Calendar sync, Notion-like block editor, Kanban/Eisenhower views, Pomodoro focus sessions. "Zuam" is Mapudungun for will/intention/desire.

**Status**: Spec-driven, pre-implementation repository. The canonical planning layer now lives in `project/`. The PRD remains important, but implementation work should start from the `project/` docs, not from the PRD alone.

## Canonical Sources Of Truth

Read sources in this order:

1. `project/_index.md`
2. Relevant `project/_*.md` shared planning docs
3. Relevant `project/phases/*.md` phase doc
4. Relevant `project/modules/<module>/` docs
5. `PRD_Zuam_v0.3.md` for broader product context

If `PRD_Zuam_v0.3.md` conflicts with `project/`, follow `project/` and record any new cross-cutting decision in `project/_decision-log.md`.

## Planning System Structure

```text
project/
  _index.md
  _conventions.md
  _personas.md
  _decision-log.md
  _parallelization.md
  _quality-gates.md
  _test-strategy.md
  _glossary.md
  phases/
  modules/
```

### Shared Planning Docs
- `project/_index.md`: entry point, phase map, module registry, Phase 1 critical path
- `project/_conventions.md`: file requirements, frontmatter, requirement/test traceability
- `project/_test-strategy.md`: test-first baseline and acceptance language
- `project/_quality-gates.md`: what `draft` and `ready` mean
- `project/_parallelization.md`: critical path and safe parallel work rules
- `project/_personas.md`: module ownership
- `project/_decision-log.md`: ADR-style cross-cutting decisions

### Module Contract
Every module in `project/modules/<module>/` should contain:
- `README.md`
- `contracts.md`
- `tests.backend.md`
- `tests.frontend.md`
- `work-packet.md`
- `open-questions.md` only if unresolved decisions remain

## How Agents Should Work

Before implementing any feature:

1. Open `project/_index.md`.
2. Identify the relevant phase and module.
3. Read the module `README.md` for scope and requirements.
4. Read `contracts.md` to freeze interfaces and invariants.
5. Read `tests.backend.md` and `tests.frontend.md` to understand acceptance criteria.
6. Read `work-packet.md` and start by materializing the first failing tests listed there.

Do not implement directly from the PRD if a module spec already exists.

## Test-First / Spec-Driven Rules

- Zuam is intentionally spec-driven and test-gated.
- Requirements are not complete unless they map to tests.
- Implementation should begin by writing or materializing the documented failing tests for the slice.
- Backend and frontend success criteria live in the module test docs, not only in prose.
- If implementation reveals an ambiguity, update the relevant `project/` docs before or alongside code.

## Parallelization Rules

- The default execution unit is a vertical slice module, not a broad technical layer.
- Prefer parallel work across modules with explicit dependencies rather than mixing ownership inside one module.
- Respect `depends_on` and `parallel_group` metadata in the frontmatter.
- If multiple agents are working concurrently, each agent should own a disjoint module or a clearly separated write set.

## Phase Status Expectations

- Phase 1 modules are the deepest and should be treated as implementation-ready.
- Later-phase modules may be lighter and marked `draft`; if you implement them, deepen their specs first.
- A module marked `ready` should be implementable without asking product or architecture follow-up questions.

## Current Phase 1 Critical Path

1. `monorepo-platform`
2. `auth-invite-onboarding`
3. `core-data-model-crud`
4. `desktop-shell-layout`
5. `google-tasks-sync`
6. `task-detail-basic-editor`
7. `nudge-engine`
8. `infra-release-observability`

## Tech Stack

- **Monorepo**: pnpm workspaces
- **Backend**: NestJS (TypeScript), PostgreSQL, Prisma ORM, REST + WebSocket (Socket.io)
- **Desktop**: TanStack Start (web app) + Electron wrapper + Tailwind CSS
- **Mobile**: React Native + Expo
- **Auth**: Google OAuth 2.0 + invitation token gating (single-use tokens)
- **Hosting**: Railway
- **Distribution**: GitHub Releases (Electron installer), sideloaded APK (Android)

## Planned Monorepo Structure

```text
packages/
  backend/        # NestJS API (prisma/ for schema + migrations)
  shared/         # Shared types, constants, nudge copy bank
  desktop/        # TanStack Start + Electron (electron/ for main process)
  mobile/         # React Native + Expo
```

## Architecture Decisions

- **Google Tasks is source of truth for task existence**; the app extends each task with ADHD metadata (urgency score, energy level, nudge settings, emotional resistance). App-only fields (sections, body, tags, priority, ADHD extensions, attachments, focus sessions) never sync to Google.
- **Sync strategy**: polling every 2-5 min for Google Tasks, 15 min for Calendar. Local changes push immediately. Conflict resolution: last-write-wins with Google as tiebreaker for synced fields.
- **Task body uses TipTap** (ProseMirror-based) block editor stored as JSON. For Google sync, body serializes to plain-text Markdown in the `notes` field (lossy).
- **Sections are app-side only**; Google Tasks has no equivalent. Unsynced tasks land in "Not Sectioned". Sections double as Kanban columns when switching view.
- **Subtask nesting up to 3 levels deep**. Each subtask has full task capabilities.
- **Nudge engine has 5 escalation levels** (0=ambient through 4=nuclear). Level 2+ uses full-screen overlays/dialogs requiring explicit dismissal. Level 4 is opt-in only.
- **Invitation token gating**: signup requires Google OAuth + valid single-use invite token. Single user for v1, no multi-user/teams.
- **Smart Lists** (Today, Next 7 Days, Inbox, Completed, Won't Do, Trash) are system-generated and coexist with user-created lists.

## Key Enums

Priority: NONE, LOW, MEDIUM, HIGH | EnergyLevel: LOW, MEDIUM, HIGH | Resistance: NONE, MILD, HIGH, DREAD | NudgeStrategy: GENTLE, FIRM, AGGRESSIVE, CUSTOM | KanbanColumn: BACKLOG, TODO, IN_PROGRESS, DONE | MatrixQuadrant: Q1_URGENT_IMPORTANT, Q2_IMPORTANT, Q3_URGENT, Q4_NEITHER

## Design Tokens

- Accent primary: `#5B6AF0` (light) / `#7B8AF0` (dark)
- Priority colors: red (high), orange (medium), blue (low)
- Typography: Inter (sans-serif), JetBrains Mono (timers)
- Three-panel layout: sidebar | main content | detail panel
- Light + dark mode with system-aware detection
