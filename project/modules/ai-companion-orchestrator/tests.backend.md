---
id: ai-companion-orchestrator
title: AI Companion Orchestrator Backend Tests
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

# Backend Tests

## Test Scope Summary
Validate draft-plan generation, approval gating, execution tracing, undo coverage, and persona safety constraints for the orchestration layer.

## Test Environment Assumptions
- Runtime governance enforces provider, permission, and tool policies before execution.
- Test doubles exist for task, list, focus-block, and calendar preview services.

## Test Cases
- `BE-UNIT-ACO-001`: given a user request, when Zuamy proposes a plan, then the result is a `DraftPlan` with no write side effects and a non-empty rationale block. Requirements: `ACO-REQ-001`, `ACO-REQ-002`.
- `BE-UNIT-ACO-002`: given an overwhelm-style request, when Zuamy drafts support, then it can propose decomposition, first-step prompting, and scheduling strategies without therapy framing. Requirements: `ACO-REQ-003`.
- `BE-UNIT-ACO-003`: given mixed low-risk and destructive actions, when approval tiers are computed, then destructive and elevated calendar actions require elevated approval while low-risk task/list edits can be bundled. Requirements: `ACO-REQ-004`.
- `BE-UNIT-ACO-004`: given an approved bundle, when execution traces are stored, then every action records execution metadata and an undo strategy where feasible. Requirements: `ACO-REQ-005`.
- `BE-UNIT-ACO-005`: given a candidate companion reply, when persona safety checks run, then forbidden relational patterns are rejected. Requirements: `ACO-REQ-006`.
- `BE-E2E-ACO-001`: given a brain-dump request, when Zuamy responds, then a draft plan is created and nothing mutates before approval. Requirements: `ACO-REQ-001`.
- `BE-E2E-ACO-002`: given a draft with review artifacts, when the plan is hydrated for the client, then summary, checklist, diff, preview, and rationale all resolve together. Requirements: `ACO-REQ-002`.
- `BE-E2E-ACO-003`: given elevated actions inside a bundle, when the user approves only low-risk actions, then elevated actions remain blocked and unexecuted. Requirements: `ACO-REQ-004`.

## Error And Validation Coverage
- Invalid drafts without rationale are rejected.
- Drafts that reference unsupported action kinds are rejected before approval.
- Missing undo metadata on reversible actions fails validation.

## Authorization Coverage
- Approval bundles are user-owned and cannot be executed or undone by another user.
