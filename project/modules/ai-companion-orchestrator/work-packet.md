---
id: ai-companion-orchestrator
title: AI Companion Orchestrator Work Packet
status: draft
phase: 4
owners:
  - Product Manager
depends_on:
  - ai-companion-runtime-governance
parallel_group: ai-companion
source_of_truth:
  - PRD_Zuam_v0.3.md
  - AI Companion for ADHD Task App.md
  - deep-research-report-ai.md
last_updated: 2026-04-07
---

# Work Packet

## Objective
Specify the smallest safe AI companion slice that can turn a user request into a reviewable plan without hidden execution or manipulative companion framing.

## Files / Packages Expected To Change
- Desktop companion chat surface and review components.
- Shared draft-plan and approval DTOs.
- Backend orchestration service for draft creation and approval bundles.
- Audit and undo presentation hooks.

## Contracts To Implement First
- `DraftPlan`
- `ProposedAction`
- `ApprovalBundle`
- `ExecutionTrace`
- `UndoRecord`
- `CompanionPersona`

## Tests To Create First
- `BE-UNIT-ACO-001`
- `BE-UNIT-ACO-003`
- `FE-UNIT-ACO-001`
- `FE-E2E-ACO-001`

## Blockers / Dependencies
- Depends on runtime/provider policy from `ai-companion-runtime-governance`.
- Depends on stable task/list/focus/calendar contracts from earlier modules.
- GPT/Gemini evidence conflict resolution must stay captured in `open-questions.md` until closed.

## Parallel-Safe Boundaries
- UX review-surface work can proceed in parallel with provider/runtime governance once DTO names are frozen.
- Must not redefine permission or memory policy owned by `ai-companion-runtime-governance`.

## Completion Signals
- A user can ask Zuamy for planning help, inspect a layered draft, approve a bundle, and understand what changed or how to undo it.

## Non-Goals
- No proactive autonomy.
- No therapy flows.
- No unreviewed writes.
- No retention-driven companion behavior.

## Rollback / Risk Notes
- If the review surface becomes chat-only, automation bias risk increases sharply.
- If elevated approvals are underspecified, destructive or calendar-impacting actions may become too easy to approve.
