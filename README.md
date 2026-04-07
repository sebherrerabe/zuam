# Zuam

Zuam is an ADHD-optimized task management app with psychologically informed nudges that escalate until you act. The repository is now scaffolded as a `pnpm` workspace so Phase 1 implementation can start from stable package boundaries instead of inventing structure ad hoc.

## Workspace Layout

```text
packages/
  backend/   NestJS modular monolith
  shared/    public shared types, schemas, tokens, and pure helpers
  desktop/   TanStack Start web app with Electron wrapper skeleton
  mobile/    Expo Router mobile client skeleton
project/     canonical planning layer
tooling/     repo-level smoke tests and workspace validation
```

## Canonical Commands

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`

Package-specific entrypoints stay targetable through workspace filters:

- `pnpm --filter @zuam/backend dev`
- `pnpm --filter @zuam/desktop dev`
- `pnpm --filter @zuam/mobile dev`

## Environment

Each runnable package owns one local env source of truth:

- `packages/backend/.env`
- `packages/desktop/.env`
- `packages/mobile/.env`

Start from the examples in [`.env.example`](/C:/Users/sebas/IdeaProjects/zuam/.env.example).

## Planning

Implementation still starts from `project/`, not from the README alone:

1. Open [`project/_index.md`](/C:/Users/sebas/IdeaProjects/zuam/project/_index.md).
2. Read the relevant shared architecture baseline.
3. Open the target module under `project/modules/`.
4. Materialize the first failing tests from that module's `work-packet.md`.
