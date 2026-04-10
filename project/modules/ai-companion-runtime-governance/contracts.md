---
id: ai-companion-runtime-governance
title: AI Companion Runtime Governance Contracts
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
last_updated: 2026-04-10
---

# Contracts

## Shipping-First Status
- This module is explicitly downstream of the shipped core runtime.
- Governance planning may continue, but it must not outrank auth, data, sync, calendar, focus, nudge, or release work while the shipping bar remains open.

## Provider Contract
- `ProviderAdapter`: `id`, `kind`, `displayName`, `supportsLocalExecution`, `supportsCloudExecution`, `supportsStreaming`, `supportsToolCalling`, `supportsMemoryHooks`, `healthStatus`.
- `ProviderInvocation`: `providerId`, `mode`, `dataScopes[]`, `toolScopes[]`, `promptEnvelope`, `traceId`.
- `mode` accepts `localHarness`, `cloudApi`.

## Tool Contract
- `ToolCapability`: `id`, `toolKind`, `access`, `riskTier`, `scope`, `schemaVersion`.
- `access` accepts `read`, `write`.
- `riskTier` accepts `low`, `elevated`, `blocked`.
- Planner may only receive read capabilities.
- Executor may only receive validator-approved write capabilities.

## Permission Contract
- `PermissionGrant`: `id`, `userId`, `scopeType`, `scopeValue`, `accessLevel`, `grantedAt`, `expiresAt?`, `origin`.
- `scopeType` accepts `request`, `list`, `project`, `provider`, `calendar`.
- `accessLevel` accepts `read-structured`, `read-body`, `write-focus-calendar`, `write-elevated`.
- Cloud-provider invocations must surface a `DataDisclosure` payload before execution.

## Memory Contract
- `MemoryCategory`: `id`, `name`, `scopeRules`, `expiryPolicy`, `userVisible`.
- Allowed initial categories:
  - `preferred_work_times`
  - `preferred_focus_durations`
  - `scheduling_constraints`
  - `preferred_planning_style`
  - `project_context`
- `MemoryRecord`: `id`, `userId`, `categoryId`, `scope`, `value`, `createdAt`, `createdBy`, `provenance`, `expiresAt?`, `status`.
- Excluded categories must never be created implicitly:
  - inferred psychological traits
  - emotional-trigger profiling
  - unrestricted journaling memory
  - opaque hidden memory

## Calendar Contract
- `CalendarWritePolicy`: `mode`, `allowedCalendarIds[]`, `requiredApprovalTier`, `allowThirdPartyEventEdits`.
- V1 default policy:
  - `mode=focusOnly`
  - `allowThirdPartyEventEdits=false`
  - `requiredApprovalTier=elevated`

## Audit Contract
- `ExecutionEvent`: `id`, `traceId`, `providerId`, `toolId`, `actionKind`, `status`, `startedAt`, `completedAt?`, `inputHash`, `outputHash`, `policyDecisions[]`.
- `AuditLog`: append-only list of execution events and user approvals.
- Non-idempotent actions require idempotency keys and replay detection before retry.

## Invariants
- Policy checks live outside the model and cannot be bypassed by prompt content.
- Default AI access is metadata-first; body access must be explicit and scoped.
- Memory cannot be written without an allowed category and user-visible controls.
- Calendar writes cannot escape the dedicated focus-calendar boundary in V1.
- Every cloud run discloses what data is being sent.

## Failure Modes
- If provider health is degraded, the runtime must fail closed for writes and surface a recoverable error.
- If tool schema validation fails, the action is blocked before execution.
- If audit logging fails, write execution must not proceed silently.
- If memory scope or category is invalid, the save attempt is rejected and surfaced to the user.
