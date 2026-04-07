---
id: ai-companion-runtime-governance
title: AI Companion Runtime Governance Frontend Tests
status: draft
phase: 4
owners:
  - Backend Engineer
depends_on:
  - core-data-model-crud
parallel_group: ai-companion
source_of_truth:
  - PRD_Zuam_v0.3.md
  - AI Companion for ADHD Task App.md
  - deep-research-report-ai.md
last_updated: 2026-04-07
---

# Frontend Tests

## Test Scope Summary
Validate provider settings, data-sharing disclosure, scoped-content consent, memory ledger controls, and recoverable runtime error states.

## Test Environment Assumptions
- Desktop settings or companion surfaces expose provider and permission controls.
- Mock responses exist for local-only, cloud-only, and degraded-provider scenarios.

## Test Cases
- `FE-UNIT-ACG-001`: provider settings clearly distinguish local harnesses from cloud providers and show fallback state. Requirements: `ACG-REQ-001`.
- `FE-UNIT-ACG-002`: body/notes access prompts require explicit scope selection and do not default to global read. Requirements: `ACG-REQ-003`.
- `FE-UNIT-ACG-003`: the memory ledger shows provenance, scope, expiry, and edit/delete/export controls for every saved memory record. Requirements: `ACG-REQ-004`.
- `FE-UNIT-ACG-004`: cloud-provider runs show a “what data will be sent” disclosure before execution and surface audit/error states on failure. Requirements: `ACG-REQ-006`.
- `FE-E2E-ACG-001`: a user grants scoped body access for one request, uses it, and sees that the grant does not expand to global ambient access. Requirements: `ACG-REQ-003`.
- `FE-E2E-ACG-002`: a user explicitly saves a memory preference, later edits or deletes it, and sees the memory ledger update deterministically. Requirements: `ACG-REQ-004`.

## Loading / Empty / Error / Success States
- Empty memory state explains that no long-term memory is stored by default.
- Provider error state blocks writes and explains whether retry, provider switch, or local fallback is available.
- Consent state shows exactly which data scopes and providers are involved before execution.
