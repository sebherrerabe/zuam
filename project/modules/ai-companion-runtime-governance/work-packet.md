---
id: ai-companion-runtime-governance
title: AI Companion Runtime Governance Work Packet
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

# Work Packet

## Objective
Freeze the minimum safe runtime shell for Zuamy: provider adapters, permission policy, explicit memory governance, focus-calendar write limits, and auditability.

## Files / Packages Expected To Change
- Shared AI provider/runtime adapter definitions.
- Permission and policy middleware.
- Memory ledger storage and settings surfaces.
- Audit log and execution retry infrastructure.

## Contracts To Implement First
- `ProviderAdapter`
- `ToolCapability`
- `PermissionGrant`
- `MemoryCategory`
- `MemoryRecord`
- `CalendarWritePolicy`
- `ExecutionEvent`

## Tests To Create First
- `BE-UNIT-ACG-002`
- `BE-UNIT-ACG-003`
- `BE-UNIT-ACG-005`
- `FE-UNIT-ACG-003`

## Blockers / Dependencies
- Depends on stable task/list/focus/calendar integration surfaces.
- Depends on product agreement that V1 calendar writes are limited to dedicated focus-calendar flows.
- Full provider-specific integration details remain pending future implementation discovery.

## Parallel-Safe Boundaries
- Provider/memory policy work can proceed in parallel with orchestration UX after DTO names are frozen.
- Must not redefine user-facing review semantics owned by `ai-companion-orchestrator`.

## Completion Signals
- The runtime can prove what data was accessed, what provider was used, what memory was saved, and what policy guarded each write action.

## Non-Goals
- No unrestricted background memory extraction.
- No broad third-party calendar writes.
- No provider-specific product branching in the core UX.

## Rollback / Risk Notes
- If policy lives inside prompts instead of runtime guards, safety becomes provider-dependent and non-verifiable.
- If body access or memory save defaults become ambient, privacy and trust risk increases immediately.
