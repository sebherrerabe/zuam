---
id: mobile-shell-core
title: Mobile Shell Core Contracts
status: draft
phase: 2
owners:
  - Frontend Engineer
depends_on:
  - core-data-model-crud
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-2-mobile
last_updated: 2026-04-04
---

# Contracts

## UI Contracts
- Core navigation exposes Today, Inbox, task list, detail, and quick-add entry.
- Permission prompts must be explicit and never block app recovery.
- Mobile detail panel adapts to a single-column layout with predictable back navigation.

## Event Contracts
- `mobile:quickAddOpen`, `mobile:shareIntentReceived`, `mobile:permissionPromptShown`, and `mobile:permissionGranted`.

## Data Contracts
- Draft task creation accepts minimal payloads and stores unscheduled items in the Inbox by default.
- Permission state is stored separately from task data.

