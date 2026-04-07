# Desktop Feature Boundaries

Renderer feature work should follow the frontend baseline:

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

State ownership stays split:

- TanStack Query for server state
- Zustand for ephemeral shell state
- preload IPC for privileged Electron access
