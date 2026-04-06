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
last_updated: 2026-04-04
---

# Backend Test Specs

## `BE-UNIT-MOB-001`
- Covers `MOB-REQ-1`.
- Assert mobile bootstrap returns only the mobile-safe navigation payload and selected defaults.

## `BE-UNIT-MOB-002`
- Covers `MOB-REQ-2`.
- Assert quick-add draft creation accepts minimal content and defaults to Inbox routing.

## `BE-E2E-MOB-001`
- Covers `MOB-REQ-3`.
- Assert permission state can be persisted and rehydrated without blocking core navigation.

## `BE-E2E-MOB-002`
- Covers `MOB-REQ-4`.
- Assert narrow-screen payloads preserve loading/error metadata for the client.

