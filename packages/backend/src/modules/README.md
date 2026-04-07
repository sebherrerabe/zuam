# Backend Module Shape

Backend feature work should land under `src/modules/<domain>/` and follow the canonical NestJS boundary:

```text
controller -> service -> dao
```

Default domain folders for Phase 1 and later slices:

- `auth`
- `lists`
- `sections`
- `tasks`
- `googleTasksSync`
- `googleCalendarContext`
- `focusSessions`
- `nudges`
- `analyticsInsights`
- `playerProgression`
- `aiCompanion`
- `publicProfiles`

Each domain should default to:

```text
src/modules/<domain>/
  controller/
  service/
  dao/
  dto/
  types/
```
