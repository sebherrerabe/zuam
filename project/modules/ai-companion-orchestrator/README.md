---
id: ai-companion-orchestrator
title: AI Companion Orchestrator
status: draft
phase: 4
owners:
  - Product Manager
depends_on:
  - core-data-model-crud
  - google-calendar-context
  - focus-sessions
  - tags-filters-smart-lists
  - ai-companion-runtime-governance
parallel_group: ai-companion
source_of_truth:
  - PRD_Zuam_v0.3.md
  - AI Companion for ADHD Task App.md
  - deep-research-report-ai.md
last_updated: 2026-04-10
---

# AI Companion Orchestrator

## Objective
Define the user-facing mixed-initiative planning experience for Zuamy: an invoke-only AI companion that turns conversation into reviewable task and calendar proposals without taking hidden action.

## Shipping-First Status
- This module is explicitly deferred from the shipping bar.
- It remains downstream of the real task, focus, and calendar runtime and must not consume backend priority until the desktop core runtime is real.

## User Value
- Reduce planning friction for ADHD users by converting brain dumps into structured next steps.
- Lower the burden of organizing tasks, lists, and focus time through collaborative planning rather than rigid manual setup.
- Preserve user agency with clear previews, reversible execution, and bounded companion behavior.

## Supporting Personas
- Frontend Engineer
- Backend Engineer
- UX/UI Designer

## Scope In
- Agent-style chat surface with conversational summary, action checklist, task diff, calendar preview, and rationale drill-down.
- Invoke-only draft-plan loop: request, draft, review, approval, execution, audit, undo.
- AI-assisted task decomposition, first-step prompting, scheduling support, and overwhelm-reduction strategies.
- Bundle approval for low-risk actions and elevated approval for destructive or external-impacting actions.
- Persona and tone guidance for a named companion with optional pixel-art identity under strict relational guardrails.
- Action planning for task, list, and focus-block mutations that are actually permitted by runtime governance.

## Scope Out
- Therapy, counselling, or emotional-support positioning.
- Proactive interruption, ambient background planning, or invisible automatic action.
- Voice mode, email access, and open-web browsing.
- Broad edits to third-party calendar events in V1.
- Ambient long-term memory behavior owned by runtime governance.

## Dependencies
- Consumes canonical task/list/focus/calendar shapes from `core-data-model-crud`, `focus-sessions`, and `google-calendar-context`.
- Must obey provider, permission, and memory constraints from `ai-companion-runtime-governance`.
- Uses tag/list/filter semantics from `tags-filters-smart-lists`.

## Phase Mapping
- This is a Phase 4 advanced module.
- It remains `draft` until GPT/Gemini research deltas are reconciled into explicit contracts, tests, and open-question closure.

## Requirements
- `ACO-REQ-001`: Zuamy must remain invoke-only in the baseline product and must not execute write actions until the user reviews a draft plan. Tests: `BE-UNIT-ACO-001`, `FE-E2E-ACO-001`.
- `ACO-REQ-002`: Every draft plan must render a layered review surface containing a conversational summary, structured action checklist, task diff, calendar preview, and rationale drill-down. Tests: `FE-UNIT-ACO-001`, `FE-E2E-ACO-002`.
- `ACO-REQ-003`: V1 companion flows must support task decomposition, scheduling support, first-step prompting, and overwhelm-reduction strategy suggestions without making therapy or emotional-support claims. Tests: `BE-UNIT-ACO-002`, `FE-UNIT-ACO-002`.
- `ACO-REQ-004`: Low-risk actions may be approved in bundles, while destructive task actions and higher-risk calendar actions require elevated approval with stronger review language. Tests: `BE-UNIT-ACO-003`, `FE-E2E-ACO-003`.
- `ACO-REQ-005`: Executed plans must expose audit history and reversible undo information to the user. Tests: `BE-UNIT-ACO-004`, `FE-UNIT-ACO-003`, `FE-E2E-ACO-004`.
- `ACO-REQ-006`: Zuamy may have a stable name, adjustable tone, and optional pixel-art identity, but copy and evaluation rules must reject reciprocity, guilt, romance, dependence, and retention-driven pseudo-intimacy. Tests: `BE-UNIT-ACO-005`, `FE-UNIT-ACO-004`.

## Readiness Statement
This module becomes `ready` only when the chat/review flow, approval tiers, and companion-tone constraints are explicit enough that implementation can begin without inventing new interaction or safety policy.
