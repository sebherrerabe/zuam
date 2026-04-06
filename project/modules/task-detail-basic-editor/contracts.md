---
id: task-detail-basic-editor
title: Task Detail Basic Editor Contracts
status: ready
phase: 1
owners:
  - Frontend Engineer
depends_on:
  - core-data-model-crud
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-1-desktop
last_updated: 2026-04-04
---

# Contracts

## UI Contracts
- Detail panel shows title, date/reminder, notes/body, subtasks, and key metadata blocks.
- The editor is plain text in Phase 1 and must preserve pasted formatting as line breaks only.
- Save feedback states are explicit: `idle`, `dirty`, `saving`, `saved`, `error`.

## Data Contracts
- `TaskDetailModel` includes `id`, `title`, `notes`, `dueDate`, `priority`, `sectionId`, `listId`, `subtasks`, and `completed`.
- `notes` is the Google-sync fallback text field in Phase 1.
- Subtask operations are scoped to the selected parent task.

## Event Contracts
- `taskDetail:open(taskId)` and `taskDetail:close()` are local shell events.
- `taskDetail:save` carries the minimal patch payload and must be idempotent.

