---
id: ai-companion-runtime-governance
title: AI Companion Runtime Governance
status: draft
phase: 4
owners:
  - Backend Engineer
depends_on:
  - core-data-model-crud
  - google-tasks-sync
  - google-calendar-context
  - focus-sessions
parallel_group: ai-companion
source_of_truth:
  - PRD_Zuam_v0.3.md
  - AI Companion for ADHD Task App.md
  - deep-research-report-ai.md
last_updated: 2026-04-07
---

# AI Companion Runtime Governance

## Objective
Define the provider, tool, memory, permission, and audit boundaries that make Zuamy safe enough to plan and execute user-approved actions.

## User Value
- Preserve privacy and agency while still allowing useful AI-assisted organization.
- Make provider choice flexible without forcing users into one model vendor or trust model.
- Keep every AI action inspectable, reversible, and policy-constrained.

## Supporting Personas
- Product Manager
- Frontend Engineer
- Infra / DevOps
- QA / Validation

## Scope In
- Local-first hybrid provider model with local CLI adapters and API-backed providers.
- Planner / validator / executor role separation and least-privilege tool access.
- Permission grants, risk tiers, and data-sharing disclosures.
- Structured explicit memory ledger with provenance, scope, expiry, and user controls.
- Audit logging, retry protection, and policy enforcement outside the model.
- Calendar read/write boundaries for V1, including dedicated focus-calendar restrictions.

## Scope Out
- Ambient autonomous memory extraction.
- Broad third-party calendar write access in V1.
- Model-specific prompt engineering as the primary safety mechanism.
- Hidden memory or opaque user-profile inference.
- Final production choice of a single provider runtime.

## Dependencies
- Uses task/list/focus/calendar contracts from earlier modules.
- Supplies policy and tool boundaries consumed by `ai-companion-orchestrator`.
- Must interoperate with local desktop runtime and any later API provider integrations.

## Phase Mapping
- This is a Phase 4 advanced module.
- It remains `draft` until provider adapter boundaries, memory governance, and permission rules are explicit enough for implementation.

## Requirements
- `ACG-REQ-001`: The AI companion runtime must support a local-first hybrid provider model with plugin adapters for local harnesses and API-backed models under one policy-enforced interface. Tests: `BE-UNIT-ACG-001`, `FE-UNIT-ACG-001`.
- `ACG-REQ-002`: Planner, validator, and executor responsibilities must be separated so that read access, write access, schema validation, and policy checks are not delegated to one unrestricted model call. Tests: `BE-UNIT-ACG-002`, `BE-E2E-ACG-001`.
- `ACG-REQ-003`: Default AI read scope must include structured task/list/focus/calendar context while keeping task bodies/notes opt-in and scope-limited. Tests: `BE-UNIT-ACG-003`, `FE-UNIT-ACG-002`.
- `ACG-REQ-004`: Long-term memory must default to empty and may be created only through explicit user-saved structured records with provenance, scope, expiry, and edit/delete/export controls. Tests: `BE-UNIT-ACG-004`, `FE-UNIT-ACG-003`, `FE-E2E-ACG-002`.
- `ACG-REQ-005`: Calendar writes in V1 must be restricted to dedicated focus-calendar or tagged focus-block flows; existing third-party events remain read-only by default. Tests: `BE-UNIT-ACG-005`, `BE-E2E-ACG-003`.
- `ACG-REQ-006`: Policy enforcement must provide least privilege, constrained tool schemas, explicit data-sharing disclosure for cloud providers, immutable audit logs, and non-idempotent retry protection. Tests: `BE-UNIT-ACG-006`, `BE-E2E-ACG-002`, `FE-UNIT-ACG-004`.

## Readiness Statement
This module becomes `ready` only when provider selection, permission enforcement, memory controls, and audit behavior are frozen tightly enough that downstream implementation cannot accidentally create hidden autonomy or privacy leakage.
