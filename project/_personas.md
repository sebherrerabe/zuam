---
id: project-personas
title: Planning Personas
status: ready
phase: cross-cutting
owners:
  - Documentation / DX
  - Product Manager
depends_on:
  - project-conventions
parallel_group: foundation
source_of_truth:
  - .agents/skills/project-management/SKILL.md
last_updated: 2026-04-07
---

# Planning Personas

## Purpose
These personas define ownership boundaries for planning and implementation packets. Each module should have one primary owner persona even if multiple disciplines later contribute code.

## Persona Catalog
| Persona | Primary Responsibility | Outputs |
|---|---|---|
| Product Manager | Requirements, scope, priorities, user value, acceptance language | module requirements, scope boundaries, phase exit criteria |
| UX/UI Designer | User flows, interaction states, layout behavior, accessibility intent | screen states, interaction contracts, IA notes |
| Frontend Engineer | Desktop/mobile UI implementation and client-side state | UI contracts, component boundaries, FE tests, work packet |
| Backend Engineer | APIs, data model logic, sync services, scheduling, events | REST/event/data contracts, BE tests, work packet |
| Infra / DevOps | workspace shape, CI/CD, packaging, release, telemetry | platform contracts, pipeline specs, observability requirements |
| QA / Validation | test strategy, traceability, acceptance review | quality gates, test matrix, release criteria |
| Documentation / DX | docs structure, agent usability, onboarding flow | conventions, indexes, ADR hygiene, work packet quality |

## Ownership Rules
- One module has one primary persona.
- Supporting personas may be listed inside the module README when coordination is required.
- Shared modules that span multiple packages still need one clear decision owner.
- If ownership changes between phases, record it in the phase doc and decision log.

## Current Module Ownership
| Module | Primary Persona | Supporting Personas |
|---|---|---|
| monorepo-platform | Infra / DevOps | Documentation / DX, Backend Engineer, Frontend Engineer |
| auth-invite-onboarding | Backend Engineer | Product Manager, QA / Validation |
| core-data-model-crud | Backend Engineer | Product Manager, QA / Validation |
| desktop-shell-layout | Frontend Engineer | UX/UI Designer, Infra / DevOps |
| task-detail-basic-editor | Frontend Engineer | UX/UI Designer |
| google-tasks-sync | Backend Engineer | Product Manager, QA / Validation |
| google-calendar-context | Backend Engineer | Product Manager |
| nudge-engine | Backend Engineer | Product Manager, Frontend Engineer |
| focus-sessions | Frontend Engineer | Product Manager, Backend Engineer |
| task-views | Frontend Engineer | UX/UI Designer, Product Manager |
| tags-filters-smart-lists | Product Manager | Frontend Engineer, Backend Engineer |
| mobile-shell-core | Frontend Engineer | Product Manager, Infra / DevOps |
| analytics-insights | Product Manager | Backend Engineer, Frontend Engineer |
| player-progression-rewards | Product Manager | Frontend Engineer, Backend Engineer, UX/UI Designer |
| ai-companion-orchestrator | Product Manager | Frontend Engineer, Backend Engineer, UX/UI Designer |
| ai-companion-runtime-governance | Backend Engineer | Product Manager, Frontend Engineer, Infra / DevOps, QA / Validation |
| public-progression-profiles | Product Manager | Backend Engineer, Frontend Engineer, QA / Validation |
| infra-release-observability | Infra / DevOps | Backend Engineer, Frontend Engineer, QA / Validation |

## Handoff Rules
- Product Manager hands off decision-complete requirements and scope.
- Engineers hand off contracts plus test-first implementation packets.
- QA / Validation confirms traceability from requirements to tests.
- Documentation / DX confirms agent usability and navigation quality.
