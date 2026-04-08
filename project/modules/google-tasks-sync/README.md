---
id: google-tasks-sync
title: Google Tasks Sync
status: ready
phase: phase-1-foundation
owners:
  - Backend Engineer
depends_on:
  - auth-invite-onboarding
  - core-data-model-crud
parallel_group: phase1-sync
source_of_truth: PRD_Zuam_v0.3.md
last_updated: "2026-04-04"
---

# Objective
Bootstrap full import plus incremental bidirectional sync between Google Tasks and the local task model.

## Scope In
- Initial full sync of Google task lists and tasks.
- Incremental polling-based sync for updated Google records.
- Immediate push of local task mutations back to Google.
- Conflict resolution using last-write-wins with Google as tiebreaker for synced fields.
- Manual sync trigger and sync status reporting.

## Scope Out
- Google Calendar sync.
- Rich body serialization beyond plain-text notes fallback.
- App-only fields such as sections, tags, priority, and nudge settings.
- Offline queueing and advanced retry orchestration.

## Requirements
- `SYNC-REQ-001`: First login performs a full import of Google task lists and tasks into the local model. Tests: `BE-E2E-SYNC-001`, `FE-UNIT-SYNC-001`.
- `SYNC-REQ-002`: Local edits push to Google immediately and Google-side updates are picked up by periodic polling. Tests: `BE-E2E-SYNC-002`, `FE-UNIT-SYNC-002`.
- `SYNC-REQ-003`: Core-field conflicts resolve deterministically with Google winning for synced fields. Tests: `BE-E2E-SYNC-003`, `FE-UNIT-SYNC-003`.
- `SYNC-REQ-004`: App-only fields are preserved and never overwritten by Google sync. Tests: `BE-E2E-SYNC-004`, `FE-UNIT-SYNC-004`.

## Phase Mapping
- This is a Phase 1 foundation module.
- It depends on the local data model and auth boundary being stable first.

## Google Reference
- Read `google-reference.md` in this module before implementing import, polling, patching, or ordering against Google Tasks.

## Figma Reference
- This module has no dedicated frozen sync-status node in the current light mockups.
- Fetch `1:19` `Desktop Shell — Today` as the host shell reference and treat sync-card placement and styling as an explicit inference until a dedicated sync-status node exists.
- Frontend work for this module must still fetch a screenshot from the Figma plugin and record that the sync surface is derived from the host shell rather than an exact node.
