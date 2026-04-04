# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, Copilot, Cursor, etc.) when working with code in this repository.

> **Mirror**: `CLAUDE.md` contains the same guidance for Claude Code. Keep both files in sync when updating.

## Project Overview

Zuam is an ADHD-optimized task management app with psychologically-informed nudges that escalate until you act. Bidirectional Google Tasks/Calendar sync, Notion-like block editor, Kanban/Eisenhower views, Pomodoro focus sessions. "Zuam" is Mapudungun for will/intention/desire.

**Status**: Pre-code. PRD v0.3 finalized (`PRD_Zuam_v0.3.md`). Development phases defined but no code written yet.

## Tech Stack

- **Monorepo**: pnpm workspaces
- **Backend**: NestJS (TypeScript), PostgreSQL, Prisma ORM, REST + WebSocket (Socket.io)
- **Desktop**: TanStack Start (web app) + Electron wrapper + Tailwind CSS
- **Mobile**: React Native + Expo
- **Auth**: Google OAuth 2.0 + invitation token gating (single-use tokens)
- **Hosting**: Railway
- **Distribution**: GitHub Releases (Electron installer), sideloaded APK (Android)

## Monorepo Structure (Planned)

```
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
- **Sections are app-side only** — Google Tasks has no equivalent. Unsynced tasks land in "Not Sectioned". Sections double as Kanban columns when switching view.
- **Subtask nesting up to 3 levels deep**. Each subtask has full task capabilities.
- **Nudge engine has 5 escalation levels** (0=ambient through 4=nuclear). Level 2+ uses full-screen overlays/dialogs requiring explicit dismissal. Level 4 is opt-in only.
- **Invitation token gating**: signup requires Google OAuth + valid single-use invite token. Single user for v1, no multi-user/teams.
- **Smart Lists** (Today, Next 7 Days, Inbox, Completed, Won't Do, Trash) are system-generated and coexist with user-created lists.

## Key Enums (Prisma)

Priority: NONE, LOW, MEDIUM, HIGH | EnergyLevel: LOW, MEDIUM, HIGH | Resistance: NONE, MILD, HIGH, DREAD | NudgeStrategy: GENTLE, FIRM, AGGRESSIVE, CUSTOM | KanbanColumn: BACKLOG, TODO, IN_PROGRESS, DONE | MatrixQuadrant: Q1_URGENT_IMPORTANT, Q2_IMPORTANT, Q3_URGENT, Q4_NEITHER

## Design Tokens

- Accent primary: `#5B6AF0` (light) / `#7B8AF0` (dark) — calming blue-purple
- Priority colors: red (high), orange (medium), blue (low)
- Typography: Inter (sans-serif), JetBrains Mono (timers)
- Three-panel layout: sidebar (lists) | main content (task list) | detail panel (task detail)
- Light + Dark mode with system-aware detection

## Development Phases

Phase 1 (MVP): monorepo setup, auth, task/list/section CRUD, Prisma schema, Google Tasks sync, Electron shell + TanStack Start, light/dark theme, basic task detail, Level 1-2 nudges, CI/CD for desktop releases.

See `PRD_Zuam_v0.3.md` for full phase breakdown and detailed specifications.
