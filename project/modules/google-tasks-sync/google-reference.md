---
id: google-tasks-sync-google-reference
title: Google Tasks API Reference
status: ready
phase: phase-1-foundation
owners:
  - Backend Engineer
depends_on:
  - google-tasks-sync
parallel_group: phase1-sync
source_of_truth:
  - project/modules/google-tasks-sync/README.md
  - PRD_Zuam_v0.3.md
last_updated: "2026-04-05"
---

# Google Tasks API Reference

This file translates the current public Google Tasks docs into implementation decisions for Zuam's sync layer.

## Official Docs Reviewed
- Tasks scopes: https://developers.google.com/workspace/tasks/auth
- Tasks parameters: https://developers.google.com/workspace/tasks/params
- Tasks performance: https://developers.google.com/workspace/tasks/performance
- Tasks resource: https://developers.google.com/workspace/tasks/reference/rest/v1/tasks
- `tasklists.list`: https://developers.google.com/workspace/tasks/reference/rest/v1/tasklists/list
- `tasks.list`: https://developers.google.com/workspace/tasks/reference/rest/v1/tasks/list
- `tasks.insert`: https://developers.google.com/workspace/tasks/reference/rest/v1/tasks/insert
- `tasks.move`: https://developers.google.com/workspace/tasks/reference/rest/v1/tasks/move
- Ordering guide: https://developers.google.com/workspace/tasks/order
- Node quickstart: https://developers.google.com/workspace/tasks/quickstart/nodejs

Reviewed on 2026-04-05.

## Zuam Decisions Frozen From The Docs

### 1. Change detection is polling-first
- Zuam should implement Google Tasks sync as polling plus immediate local push.
- Inference from the currently published Tasks guides and reference: unlike Calendar, the public Tasks docs reviewed here do not expose a `watch` or push-notification path.
- Therefore polling is the canonical remote-change detection mechanism for Zuam.

### 2. Full import starts with task lists, then tasks per list
- Full import flow:
  1. Call `tasklists.list` with pagination until all lists are fetched.
  2. For each list, call `tasks.list` with explicit filter flags and pagination until all tasks are fetched.
- `tasklists.list` defaults to `maxResults=1000` and supports up to 1000 per page.
- `tasks.list` defaults to `maxResults=20` and supports up to 100 per page.
- Zuam should explicitly set `maxResults=100` for task pages and paginate until `nextPageToken` is empty.

### 3. Incremental sync uses `updatedMin`, not sync tokens
- Google Tasks provides `updatedMin` for task reads.
- Zuam should store the last successful remote high-water mark per Google task list and use `updatedMin` on subsequent polls.
- Add a small safety lookback window when polling to reduce missed updates caused by clock skew or eventual consistency. Deduplicate by Google task ID plus updated timestamp locally.

This high-water-mark strategy is an implementation choice based on the current Tasks API surface.

### 4. Always set visibility flags explicitly
- Always set these parameters explicitly on every `tasks.list` call:
  - `showCompleted=true`
  - `showDeleted=true`
  - `showHidden=true`
  - `showAssigned=true`
- Reason 1: Zuam must not silently miss remote tasks that still matter for reconciliation.
- Reason 2: the current Google docs are inconsistent about the default for `showHidden`.
  - The guide page "Use Tasks Parameters" was updated 2026-04-01 and says `showHidden=true` by default.
  - The `tasks.list` reference page says `showHidden=false` by default.
- Zuam should never rely on undocumented or inconsistent defaults.

### 5. Assigned tasks must be treated as limited-support imports
- Google now exposes `assignmentInfo` and `showAssigned`.
- Assigned tasks have restrictions:
  - they cannot be inserted from the public Tasks API
  - they cannot be used as parent tasks
  - tasks assigned from Google Docs cannot have notes
  - delete semantics can affect the original assigned source
- Zuam should import assigned tasks when present so the local mirror is complete.
- Zuam Phase 1 should treat assigned tasks as read-only or restricted-edit records until explicit product rules are added.

### 6. Due dates are date-only in Google Tasks
- Google documents that only the date portion of `due` is stored and the time portion is discarded.
- Zuam must not interpret Google Tasks due times as real times of day.
- Map Google due data to Zuam's date semantics only.

### 7. Ordering and hierarchy must use `parent` and `previous`
- Google Tasks ordering is controlled by `parent` and `previous` on insert or move.
- `position` is output-only and lexicographic. Zuam may compare it for ordering, but must not try to construct it.
- `tasks.move` is the canonical reordering operation.
- Repeating tasks cannot currently be moved between lists.
- A task can have up to 2,000 subtasks.
- The special task-list value `@default` exists, but Zuam should store and use explicit task-list IDs after initial discovery.

### 8. Notes and title lengths are hard limits
- `title` maximum length: 1024 characters.
- `notes` maximum length: 8192 characters.
- Phase 1 and Phase 2 serializers must enforce safe truncation or refusal behavior before Google write calls.
- Rich editor content remains app-side canonical; Google `notes` is only a lossy fallback projection.

### 9. Capacity limits matter for seed and import planning
- A user can have up to 2000 task lists.
- A user can have up to 20,000 non-hidden tasks per list.
- A user can have up to 100,000 tasks total.
- These limits should inform seed fixtures, pagination tests, and retry/backfill jobs.

### 10. Use partial responses and patch-style writes where possible
- Google's Tasks performance guide recommends `fields` for partial responses.
- Google API performance guidance also recommends patch-style updates so only changed fields are sent.
- Zuam should request only the fields it needs on read-heavy sync paths once the mapping stabilizes.
- Zuam should prefer minimal update payloads for remote writes.

## Concrete Zuam Read Strategy

### Full import
- `tasklists.list?maxResults=1000`
- For each list:
  - `tasks.list?maxResults=100&showCompleted=true&showDeleted=true&showHidden=true&showAssigned=true`

### Incremental poll
- Per list:
  - `tasks.list?maxResults=100&updatedMin=<last_safe_watermark>&showCompleted=true&showDeleted=true&showHidden=true&showAssigned=true`

### Remote writes
- Create top-level task with `tasks.insert`.
- Create or reorder subtasks with `parent` and `previous`.
- Reorder existing tasks with `tasks.move`.

## Failure Modes Agents Must Handle
- Deleted tasks still arrive when `showDeleted=true`; reconciliation must soft-delete locally, not hard-drop immediately.
- Hidden tasks exist after completed-list clearing; they still matter to sync correctness.
- Assigned and repeating tasks have move and parent restrictions.
- Due time-of-day is not preserved by Google Tasks.
- Polling based only on exact timestamps can miss boundary updates if there is no safety overlap.

## Recommended Zuam Test Additions
- Add a backend e2e test that proves explicit `showHidden=true` is always sent.
- Add a backend e2e test for `updatedMin` overlap deduplication.
- Add a backend e2e test for assigned-task import without unsupported write behavior.
- Add a backend e2e test for date-only `due` round-tripping.

## Source Highlights
- Google Tasks supports only two scopes for this project: `tasks` and `tasks.readonly`.
- `tasklists.list` is paginated and supports up to 1000 lists per page.
- `tasks.list` is paginated and supports up to 100 tasks per page.
- `due` stores only the calendar date, not time of day.
- `notes` is limited to 8192 characters.
