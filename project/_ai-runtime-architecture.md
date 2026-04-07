---
id: project-ai-runtime-architecture
title: AI Runtime Architecture Baseline
status: ready
phase: cross-cutting
owners:
  - Backend Engineer
  - Frontend Engineer
  - Product Manager
depends_on:
  - project-conventions
  - project-decision-log
parallel_group: future
source_of_truth:
  - AGENTS.md
  - PRD_Zuam_v0.3.md
last_updated: 2026-04-07
---

# AI Runtime Architecture Baseline

## Purpose
This document defines the default technical architecture for Zuamy and related agentic functionality. It complements the Phase 4 AI companion modules by locking implementation patterns that should remain consistent across providers and phases.

## Product Baseline
Zuamy is:
- invoke-only in V1
- draft-first before any write action
- review-driven through layered previews
- bounded by explicit memory, privacy, and calendar-write policies

## Runtime Split
- Electron main process hosts local-first provider adapters, local harness bridges, secrets, and provider/runtime policy hooks.
- Backend remains the canonical source of truth for all durable task, list, focus, and calendar mutations.
- Desktop renderer hosts the companion UI and review flows, but does not execute privileged actions directly.

## Provider Strategy
Default provider model:
- local-first where possible
- local CLI harness adapters for users who already have supported agent runtimes available
- API-backed provider adapters for cloud models when the user opts in

Provider selection must sit behind a shared adapter contract.

## Execution Pipeline
Preferred companion execution model:
1. planner
2. validator
3. executor
4. auditor

Responsibilities:
- Planner converts user intent into a structured draft plan.
- Validator checks schemas, permissions, policy boundaries, and obvious conflicts.
- Executor performs only approved actions through backend APIs or companion application endpoints.
- Auditor records approval source, execution trace, and undo metadata.

## Tooling Rules
- Policy enforcement must live outside model prompts.
- Tool schemas must be narrow, typed, and explicit.
- Models must not receive direct database access.
- AI actions must ultimately resolve through service-backed mutation boundaries, never DAOs or raw persistence.

## Default Data Access
- Structured metadata is readable by default where product policy allows.
- Task body/note access is scoped and explicit.
- Memory is empty by default and created only through explicit save actions.
- Calendar context may be read according to the connected account's granted permissions.

## Calendar Safety
- V1 calendar writes are restricted to a dedicated focus calendar or clearly tagged focus events.
- Existing third-party events remain read-only by default.
- Calendar proposals must always render conflict-aware previews before execution.

## Memory Model
- Use an explicit memory ledger, not hidden ambient recall.
- Each memory record must include:
  - category
  - provenance
  - scope
  - optional expiry
- Memory must be inspectable, editable, deletable, and exportable by the user.

## Recommended Technical Pieces
- local provider bridge in Electron main process
- shared adapter interface for local and cloud providers
- structured JSON plan format for planner output
- validation layer that runs before approval and again before execution
- audit/event store for executed bundles and undo metadata
- encrypted local storage for provider/runtime settings where appropriate

## UI Expectations
The review surface should combine:
- conversational summary
- structured checklist
- task diff
- calendar preview
- rationale

These are typed product UI components, not freeform markdown output.

## Phase Preview
- Phase 4 introduces the first companion runtime, approval flow, memory ledger, and provider settings
- later phases may broaden autonomy only through new ADRs and tighter governance, not by default drift

## Non-Goals
- No background autonomous life management in V1.
- No unrestricted memory extraction.
- No broad calendar-edit authority by default.
- No direct coupling between provider implementation details and business logic contracts.
