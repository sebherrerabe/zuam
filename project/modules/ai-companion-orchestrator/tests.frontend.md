---
id: ai-companion-orchestrator
title: AI Companion Orchestrator Frontend Tests
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

# Frontend Tests

## Test Scope Summary
Validate the chatbox UX, layered review rendering, approval/rejection controls, undo visibility, and bounded companion identity presentation.

## Test Environment Assumptions
- Desktop app shell provides an AI companion entry point.
- Mock draft-plan payloads cover task-only, mixed task/calendar, and validation-error scenarios.

## Test Cases
- `FE-UNIT-ACO-001`: draft plans render summary, checklist, task diff, calendar preview, and rationale together in one review surface. Requirements: `ACO-REQ-002`.
- `FE-UNIT-ACO-002`: overwhelm-support flows show decomposition, first tiny step, and strategy suggestions without implying therapy or diagnosis. Requirements: `ACO-REQ-003`.
- `FE-UNIT-ACO-003`: executed bundles expose audit entries and undo affordances without hiding what changed. Requirements: `ACO-REQ-005`.
- `FE-UNIT-ACO-004`: persona presentation remains supportive-but-bounded and never renders forbidden relational copy patterns. Requirements: `ACO-REQ-006`.
- `FE-E2E-ACO-001`: a user invokes Zuamy, receives a draft plan, and sees no mutations until approval. Requirements: `ACO-REQ-001`.
- `FE-E2E-ACO-002`: a user reviews a draft, edits or deselects actions, and still sees accurate checklist, diff, and preview state. Requirements: `ACO-REQ-002`, `ACO-REQ-004`.
- `FE-E2E-ACO-003`: elevated approval states are visually distinct from low-risk bundle approval and block destructive actions until confirmed. Requirements: `ACO-REQ-004`.
- `FE-E2E-ACO-004`: after execution, the user can inspect audit details and trigger a supported undo path from the companion surface. Requirements: `ACO-REQ-005`.

## Loading / Empty / Error / Success States
- Empty companion state explains that Zuamy is invoke-only and review-first.
- Loading state shows draft generation progress without implying hidden execution.
- Error state explains whether the failure happened during planning, preview generation, or approval.
- Success state confirms what changed and links to undo/audit details.
