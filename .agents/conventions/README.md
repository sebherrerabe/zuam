# Shared Agent Conventions

This directory is the shared agent-facing implementation baseline for Zuam.

## Purpose

Use these conventions when coding so the repository's planning decisions turn into consistent implementation choices.

`.claude/conventions/` should point to this directory via symlink or directory junction. Keep the conventions here as the single maintained copy.

## Required Reading Before Coding

1. `project/_index.md`
2. The relevant shared architecture baseline doc:
   - `project/_backend-architecture.md`
   - `project/_frontend-architecture.md`
   - `project/_ai-runtime-architecture.md`
   - `project/_delivery-testing-architecture.md`
3. The relevant phase doc
4. The target module packet

## Hard Rules

- Backend architecture is always `controller => service => dao`.
- No NestJS service may import Prisma, a DB connection, or raw SQL.
- Only DAOs may touch persistence clients.
- Shared cross-package contracts belong in `packages/shared`.
- Desktop server state belongs in TanStack Query.
- Desktop ephemeral shell state belongs in a small client store, defaulting to Zustand.
- Electron renderer code must use preload IPC for privileged/native access.
- Zuamy must follow planner -> validator -> executor -> auditor boundaries and may not bypass backend mutation boundaries.

## Package Defaults

- `packages/backend`: NestJS modular monolith, PostgreSQL, Prisma, DAO pattern
- `packages/desktop`: TanStack Start, TanStack Router, TanStack Query, TanStack Form, Tailwind, Electron
- `packages/mobile`: Expo, Expo Router, TanStack Query
- `packages/shared`: DTOs, zod schemas, enums, event names, pure helpers

## Testing Defaults

- Backend unit: Jest with mocked DAOs
- Backend integration/e2e: Jest with disposable Postgres
- Desktop unit/component: Vitest + React Testing Library
- Desktop e2e: Playwright
- Mobile e2e: Maestro

## When Adding New Conventions

- Put the agent-facing summary here.
- Put the canonical architectural decision in `project/_decision-log.md` or the relevant shared `project/_*.md` doc.
- Keep `AGENTS.md` and `CLAUDE.md` aligned when changing agent workflow instructions.
