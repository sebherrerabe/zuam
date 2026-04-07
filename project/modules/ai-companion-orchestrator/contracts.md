---
id: ai-companion-orchestrator
title: AI Companion Orchestrator Contracts
status: draft
phase: 4
owners:
  - Product Manager
depends_on:
  - ai-companion-runtime-governance
  - core-data-model-crud
  - google-calendar-context
parallel_group: ai-companion
source_of_truth:
  - PRD_Zuam_v0.3.md
  - AI Companion for ADHD Task App.md
  - deep-research-report-ai.md
last_updated: 2026-04-07
---

# Contracts

## Data Contract
- `CompanionSession`: `id`, `userId`, `status`, `providerId`, `createdAt`, `updatedAt`, `lastUserMessageAt`, `activeDraftPlanId?`.
- `DraftPlan`: `id`, `sessionId`, `goalSummary`, `understandingSummary`, `proposedOptions[]`, `actionChecklist[]`, `taskDiff[]`, `calendarPreview`, `rationale[]`, `riskTier`, `status`.
- `ProposedAction`: `id`, `kind`, `targetType`, `targetId?`, `before?`, `after`, `riskClass`, `requiresElevatedApproval`, `undoStrategy`, `dependsOnActionIds[]`.
- `ApprovalBundle`: `id`, `draftPlanId`, `actionIds[]`, `approvalTier`, `approvedAt?`, `approvedBy`, `rejectedAt?`, `rejectionReason?`.
- `ExecutionTrace`: `id`, `draftPlanId`, `approvalBundleId`, `executorRunId`, `status`, `startedAt`, `completedAt?`, `events[]`.
- `UndoRecord`: `id`, `executionTraceId`, `actionId`, `undoKind`, `undoDeadline?`, `reversalPayload`, `status`.

## UI Contract
- The companion surface is a mixed UI, not chat-only.
- Before execution, the UI must show:
  - conversational summary
  - structured checklist
  - task diff
  - calendar preview
  - rationale drill-down
- The user must be able to:
  - reject the whole draft
  - edit or deselect specific actions
  - approve a bundle
  - inspect why each action was proposed
- The chat surface must clearly indicate that Zuamy is a planning companion and not a therapist or autonomous operator.

## Action Contract
- Allowed `kind` values for initial planning:
  - `task.create`
  - `task.edit`
  - `task.move`
  - `task.reorder`
  - `task.complete`
  - `task.archive`
  - `task.delete`
  - `list.create`
  - `list.edit`
  - `list.delete`
  - `focusBlock.create`
  - `focusBlock.move`
- `task.archive`, `task.delete`, `list.delete`, and any calendar-impacting action outside low-risk focus-block creation must set `requiresElevatedApproval=true`.

## Persona Contract
- `CompanionPersona`: `name`, `toneProfile`, `avatarStyle?`, `humanLikenessLevel`, `forbiddenPatterns[]`.
- Default `toneProfile` is supportive, bounded, and competence-oriented.
- `forbiddenPatterns` must include:
  - reciprocity language
  - guilt language
  - romance cues
  - emotional-need framing
  - therapy or clinical authority claims

## Invariants
- No write action is executed before approval in baseline mode.
- Explanations never replace approval, preview, or undo surfaces.
- Every proposed action must be attributable to a human-readable rationale.
- Every executed action must produce auditability and, where feasible, a reversible undo path.
- Zuamy cannot silently expand its role from planner to therapist or autonomous life operator.

## Failure Modes
- If a draft cannot be rendered completely, the UI must degrade to a recoverable error rather than partial hidden execution.
- If any action preview cannot be computed, the draft remains non-executable.
- If the companion cannot produce a compliant tone or rationale block, the response is suppressed and surfaced as a bounded error.
