---
id: ai-companion-runtime-governance
title: AI Companion Runtime Governance Backend Tests
status: draft
phase: 4
owners:
  - Backend Engineer
depends_on:
  - core-data-model-crud
  - google-calendar-context
parallel_group: ai-companion
source_of_truth:
  - PRD_Zuam_v0.3.md
  - AI Companion for ADHD Task App.md
  - deep-research-report-ai.md
last_updated: 2026-04-07
---

# Backend Tests

## Test Scope Summary
Validate provider selection, least-privilege tool access, scoped body access, explicit memory saves, dedicated focus-calendar restrictions, and audit/retry safety.

## Test Environment Assumptions
- Local harness and cloud provider adapters have mock implementations.
- Task, focus, and calendar integrations expose fake read/write surfaces with deterministic IDs.

## Test Cases
- `BE-UNIT-ACG-001`: provider adapters expose one common invocation contract regardless of local or cloud execution mode. Requirements: `ACG-REQ-001`.
- `BE-UNIT-ACG-002`: planner invocations cannot receive write tools and executor invocations cannot bypass validator checks. Requirements: `ACG-REQ-002`.
- `BE-UNIT-ACG-003`: structured metadata reads succeed by default, while body/notes reads fail unless an explicit scoped grant exists. Requirements: `ACG-REQ-003`.
- `BE-UNIT-ACG-004`: memory records can be created only for allowlisted categories and always store provenance, scope, and expiry metadata. Requirements: `ACG-REQ-004`.
- `BE-UNIT-ACG-005`: calendar write attempts outside the dedicated focus calendar or tagged focus path are blocked in V1. Requirements: `ACG-REQ-005`.
- `BE-UNIT-ACG-006`: cloud invocations require data-disclosure payloads, audit logging, and non-idempotent retry protection before writes succeed. Requirements: `ACG-REQ-006`.
- `BE-E2E-ACG-001`: a full planner-validator-executor run respects least privilege and never exposes disallowed tool scopes to the planner. Requirements: `ACG-REQ-002`.
- `BE-E2E-ACG-002`: provider fallback failures degrade to recoverable write-blocking errors while preserving audit traces. Requirements: `ACG-REQ-001`, `ACG-REQ-006`.
- `BE-E2E-ACG-003`: an approved focus-block write succeeds only on the dedicated focus calendar and never mutates an existing third-party event. Requirements: `ACG-REQ-005`.

## Error And Validation Coverage
- Invalid provider adapters are rejected at registration time.
- Missing audit events fail execution for write actions.
- Invalid memory categories or scopes fail closed.

## Authorization Coverage
- Permission grants are user-owned and scope-bound.
- Elevated calendar/write scopes cannot be reused outside their approved scope.
