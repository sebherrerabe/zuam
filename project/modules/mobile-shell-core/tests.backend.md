---
id: mobile-shell-core
title: Mobile Shell Core Backend Tests
status: draft
phase: 2
owners:
  - Backend Engineer
depends_on:
  - core-data-model-crud
source_of_truth: PRD_Zuam_v0.3.md
parallel_group: phase-2-mobile
last_updated: 2026-04-08
---

# Backend Test Specs

## `BE-UNIT-MOB-001`
- Covers `MOB-REQ-1` and `MOB-REQ-5`.
- Assert mobile bootstrap returns only the mobile-safe navigation payload, Today as the default top-level view, and badge counts for Today and Inbox.

## `BE-UNIT-MOB-002`
- Covers `MOB-REQ-2` and `MOB-REQ-6`.
- Assert quick-add and share-intent draft creation both accept minimal content, preserve the initial text, and default to Inbox routing when no explicit destination is supplied.

## `BE-UNIT-MOB-003`
- Covers `MOB-REQ-3`.
- Assert notification and overlay permission state can be persisted and rehydrated independently of task entities.

## `BE-E2E-MOB-001`
- Covers `MOB-REQ-3`.
- Assert a user who has denied or deferred permissions can still bootstrap Today, open Inbox, and fetch task detail without permission-related request failures.

## `BE-E2E-MOB-002`
- Covers `MOB-REQ-4`.
- Assert narrow-screen payloads preserve loading/error metadata for the client.

