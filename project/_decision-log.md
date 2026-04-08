---
id: project-decision-log
title: Architectural Decision Log
status: ready
phase: cross-cutting
owners:
  - Product Manager
  - Documentation / DX
depends_on:
  - project-conventions
parallel_group: foundation
source_of_truth:
  - PRD_Zuam_v0.3.md
last_updated: 2026-04-08
---

# Architectural Decision Log

## ADR-001: Canonical Planning Surface
- Status: accepted
- Date: 2026-04-04
- Context: The repository is pre-code and needs an implementation-authoritative documentation layer for humans and LLMs.
- Decision: Use `project/` as the canonical planning directory instead of `projects/`.
- Consequences: All future planning docs must live in `project/`; any skill or script expecting `projects/` must be adapted or treated as a legacy convention.
- Supersedes: none
- Superseded by: none

## ADR-002: Planning Model
- Status: accepted
- Date: 2026-04-04
- Context: The product has multiple packages and platforms, but implementation must remain parallelizable and LLM-friendly.
- Decision: Organize planning as `phases + reusable modules`, with vertical slices as the primary planning and execution unit.
- Consequences: Phase docs become sequencing documents; module docs become implementation packets.
- Supersedes: none
- Superseded by: none

## ADR-003: Acceptance Language
- Status: accepted
- Date: 2026-04-04
- Context: Ambiguous prose creates drift during LLM implementation.
- Decision: Use contract-first documentation with executable-style test specs as the definition of done.
- Consequences: No module is `ready` without both contracts and tests.
- Supersedes: none
- Superseded by: none

## ADR-004: Testing Baseline
- Status: accepted
- Date: 2026-04-04
- Context: The project needs a consistent default toolchain across backend, desktop, and mobile.
- Decision: Use Jest for backend/shared/mobile unit layers, Vitest + React Testing Library for desktop unit layers, Playwright for desktop e2e, and Maestro for mobile e2e.
- Consequences: Module docs should assume these defaults unless a future ADR changes them.
- Supersedes: none
- Superseded by: none

## ADR-005: Positive-Only Progression Baseline
- Status: accepted
- Date: 2026-04-06
- Context: Zuam's ADHD-oriented product direction needs rewards that reinforce action without creating shame, loss spirals, or punitive retention loops.
- Decision: Treat progression as positive-only in the baseline product direction: no XP loss, no avatar death, no HP depletion, and no missed-day punishment.
- Consequences: Recovery is framed through bonuses, resumable progress, and explainable milestones rather than loss-based mechanics.
- Supersedes: none
- Superseded by: none

## ADR-006: Separate Reporting From Progression
- Status: accepted
- Date: 2026-04-06
- Context: The prior `analytics-gamification` slice mixed reporting and rewards, which made streaks, XP, summaries, and unlocks hard to reason about independently.
- Decision: Split the concern into `analytics-insights` for explainable reporting and `player-progression-rewards` for avatar, XP, and cosmetic progression.
- Consequences: Reporting stays non-gamey and explainable; progression can evolve without redefining summary or streak semantics.
- Supersedes: none
- Superseded by: none

## ADR-007: `project/` Supersedes PRD Gamification Defaults
- Status: accepted
- Date: 2026-04-06
- Context: The PRD's earlier gamification wording favors light streak-centric and variable-ratio reinforcement defaults that are now too broad for the implementation planning layer.
- Decision: When gamification wording in `PRD_Zuam_v0.3.md` implies streak-centric defaults, variable-ratio reward dependence, or otherwise ambiguous baseline mechanics, the newer `project/` module docs and ADRs take precedence.
- Consequences: Phase 3 planning now treats streaks as reporting surfaces, keeps progression deterministic by default, and defers randomized or punitive mechanics to future module decisions.
- Supersedes: none
- Superseded by: none

## ADR-008: Immediate Fixed Rewards Over Streak-First Retention
- Status: accepted
- Date: 2026-04-06
- Context: The newer evidence review supports immediacy and salience of reward feedback in ADHD-relevant motivation while also highlighting risks from fragile streaks and counterproductive gamification.
- Decision: Baseline progression uses immediate, fixed, explainable rewards tied to meaningful task completion and focus-session completion; streaks are reflective analytics only, not a primary retention mechanic.
- Consequences: Phase 3 planning prefers predictable reward schedules, de-emphasizes daily-perfect streak framing, and keeps initiation bonuses bounded and secondary to terminal actions.
- Supersedes: none
- Superseded by: none

## ADR-009: Pixel Art Is Presentation, Not Mechanism
- Status: accepted
- Date: 2026-04-06
- Context: The evidence review did not support pixel-art nostalgia or style as an ADHD-specific therapeutic ingredient even though avatar-based identity and cosmetic progression remain promising adjacent mechanics.
- Decision: Treat pixel art as a product presentation and identity choice, not as a validated causal mechanism for ADHD outcomes.
- Consequences: Zuam can lean into pixel-RPG aesthetics while keeping evidence claims focused on immediacy, salience, autonomy, competence, and non-punitive reward design.
- Supersedes: none
- Superseded by: none

## ADR-010: Share Cards Now, Public URLs Later
- Status: accepted
- Date: 2026-04-07
- Context: Progression benefits from outward-facing celebration, but public URLs introduce privacy, revocation, and public-surface decisions that are larger than a simple share button.
- Decision: Phase 3 progression supports private share-card export only; public progression profile URLs are deferred to a separate Phase 4 module and must be opt-in.
- Consequences: The progression UI can expose a `Share Progress` action now without forcing profile hosting, while future public pages stay privacy-gated and separately scoped.
- Supersedes: none
- Superseded by: none

## ADR-011: Deterministic Quick Capture Grammar Before Freeform NLP
- Status: accepted
- Date: 2026-04-07
- Context: The latest desktop mockups include structured quick-capture chips and parse previews, but the planning layer still deferred "natural language quick-add" broadly to Phase 4. Without clarification, the design can be misread as requiring a full AI-style parser earlier than intended.
- Decision: Phase 1/2 desktop quick capture may expose deterministic parsing feedback for explicit, documented capture grammar such as `~list`, `!priority`, `#tag`, and common date shortcuts, while freeform natural-language interpretation remains a Phase 4 capability.
- Consequences: The shell can show lightweight parse chips and grammar hints now, implementation remains deterministic and testable, and Phase 4 retains ownership of higher-risk freeform interpretation beyond the reserved token grammar.
- Supersedes: none
- Superseded by: none

## ADR-012: Quick Capture Grammar Hints Are Always Visible
- Status: accepted
- Date: 2026-04-07
- Context: Quick capture exposes deterministic grammar tokens (`~list`, `!priority`, `#tag`, date/time) per ADR-011. The design question is whether the syntax reference row should be visible only on first use, behind a help toggle, or always persistent.
- Decision: The grammar hint row is always visible while the capture modal is open. It is never hidden behind a toggle, tooltip, or onboarding-only state.
- Rationale: ADHD users have working memory deficits. Requiring them to recall shortcut syntax from a prior session introduces exactly the kind of "what was the format again?" friction that causes task-capture abandonment. A persistent, glanceable reference eliminates that friction at zero cost — the row is small and passive, never interrupts flow, and acts as a confidence anchor that the user typed the right thing. Removing it to "reduce clutter" optimizes for aesthetics over the core user need.
- Consequences: The Quick Capture UI always renders the syntax reference row beneath the input. Phase 4 freeform NLP (if added) may evolve this row but must not remove the deterministic grammar reference.
- Supersedes: none
- Superseded by: none

## ADR-013: Focus Queue Rationale Is Always Visible
- Status: accepted
- Date: 2026-04-07
- Context: The Focus Queue surface recommends a single task. The `task-views` contract specifies that `focusQueue:recommendation` carries a task ID plus scoring rationale text, but doesn't specify whether the rationale is shown by default or hidden behind a disclosure.
- Decision: The scoring rationale is always visible below the recommended task card, not collapsed or behind a "Why?" toggle. The rationale must reference concrete, user-legible factors (due date, resistance level, calendar free window, postpone count) rather than opaque scores.
- Rationale: ADHD users distrust opaque authority — if a system says "do this" without explaining why, the natural response is to ignore it. Visible, explainable rationale builds trust and buy-in. It also reduces the "but maybe I should do something else" paralysis by giving the user permission to follow the recommendation with confidence. Hiding the rationale behind a toggle adds a decision ("should I click to see why?") to a surface whose entire purpose is to eliminate decisions.
- Consequences: Focus Queue always renders the rationale section. The scoring algorithm (not yet documented) must produce human-readable factor descriptions, not just numeric weights. Calendar-aware context from `google-calendar-context` should surface free windows when available.
- Supersedes: none
- Superseded by: none

## ADR-014: Progression Cards Feature-Flagged Per Phase
- Status: accepted
- Date: 2026-04-07
- Context: The detail panel mockups show Reward Explanation and Focus Reward Preview cards below the core editing surface. These depend on `player-progression-rewards` (Phase 3) and `focus-sessions` (Phase 2), but they appear in the Phase 1 detail panel design.
- Decision: Progression and focus-reward contextual cards in the detail panel are feature-flagged. Phase 1 ships the core editing surface only (title, metadata, body/notes, subtasks). Phase 2 adds the Focus Session CTA. Phase 3 adds the Reward Explanation and Focus Reward Preview. The mockups represent the final composed state; implementation phases the cards in progressively.
- Rationale: For ADHD users, showing reward previews for features that don't work yet creates broken promises — the worst possible pattern for a population that already struggles with trust in tools. Each card should only appear when its backing system actually delivers on the promise. This also keeps the Phase 1 detail panel focused on the core editing loop, which is where ADHD task execution actually happens.
- Consequences: The detail panel component accepts a feature-flag map that controls which contextual cards render. The visual hierarchy design (title → body → subtasks as primary, contextual cards as secondary) is validated now but implemented incrementally.
- Supersedes: none
- Superseded by: none

## ADR-015: Saved Filters Created From Current View State
- Status: accepted
- Date: 2026-04-07
- Context: The `tags-filters-smart-lists` contract defines `SavedFilter` as an explicit query AST. The design question is how users create these filters: a blank-slate AST builder, a form with dropdowns, or saving the current view state.
- Decision: The primary filter creation flow is "Save current view as filter" — a single action available from any filtered task list. The user applies filters inline (by list, tag, priority, date, etc.), then saves the resulting view as a named filter. There is no blank-slate filter builder in Phase 2.
- Rationale: ADHD users won't configure a multi-field form to create a filter — the setup cost is too high relative to the perceived payoff, especially when the user is mid-task and just wants to remember a useful view for later. "Save what I'm looking at" maps to how ADHD users actually discover useful views: by accident, while doing something else. Capturing that moment with one click is the difference between a feature that gets used and one that gets ignored. A formal builder can be added later for power users, but the default path must be frictionless.
- Consequences: The sidebar's Filters section shows saved filters. The primary creation entry point is a "Save view..." action in the task list header or filter bar. The saved filter stores the current view's resolved query AST. Editing or renaming a saved filter is a secondary action, not the creation flow.
- Supersedes: none
- Superseded by: none

## ADR-016: Invoke-Only Draft-First AI Companion Baseline
- Status: accepted
- Date: 2026-04-07
- Context: Research on mixed-initiative systems, ADHD scaffolding, and automation bias supports proposal-first planning more strongly than direct autonomous action for high-impact personal organization workflows.
- Decision: Zuamy starts as an invoke-only companion that always proposes a draft plan before any write action executes.
- Consequences: The AI companion is framed as planning support, not background automation. Proactive interruptions, invisible state mutation, and default autonomy remain out of scope for V1.
- Supersedes: none
- Superseded by: none

## ADR-017: Layered Review Is Mandatory For AI Plans
- Status: accepted
- Date: 2026-04-07
- Context: Explanations alone do not prevent automation bias, and scheduling/task changes are easier to trust and repair when users can inspect them from multiple angles.
- Decision: Every AI draft plan must render a conversational summary, structured action checklist, task diff, calendar preview, and rationale drill-down before execution.
- Consequences: Chat-only review is not sufficient for action-taking flows. Approval UI must support fast rejection, targeted editing, and clear recovery.
- Supersedes: none
- Superseded by: none

## ADR-018: Metadata-First Privacy Default For AI Reads
- Status: accepted
- Date: 2026-04-07
- Context: Contextual privacy research and the GPT memo indicate that users reveal more than they expect in conversational systems and that global full-body access creates unnecessary blast radius.
- Decision: The AI companion may read structured task, list, focus, and calendar context by default, but task bodies/notes require explicit scoped access per request, list, or project.
- Consequences: AI planning remains useful without treating every note body as ambient context. Future broader note access must remain explicit, inspectable, and revocable.
- Supersedes: none
- Superseded by: none

## ADR-019: Explicit Memory Ledger Over Ambient Long-Term Memory
- Status: accepted
- Date: 2026-04-07
- Context: Long-term memory improves continuity but introduces false-memory, privacy, and control risks, especially when the system stores inferred preferences without visibility.
- Decision: Zuamy uses explicit user-saved memory only in V1. Memory must be stored as structured records with provenance, scope, expiry, and inspect/edit/delete/export controls.
- Consequences: There is no hidden ambient long-term memory by default. Memory categories are allowlisted and exclude inferred psychological traits and unrestricted journaling recall.
- Supersedes: none
- Superseded by: none

## ADR-020: Local-First Hybrid Provider Model For AI Companion
- Status: accepted
- Date: 2026-04-07
- Context: The product wants to reuse existing local CLI harnesses where possible while still supporting cloud providers when users opt in for capability reasons.
- Decision: The AI companion runtime is local-first by default, with provider plugins for local harnesses and API-backed models behind a shared adapter layer and common safety policy.
- Consequences: Policy enforcement, permission checks, memory governance, and audit logging must live outside the model. Provider choice becomes a pluggable runtime concern rather than a product rewrite.
- Supersedes: none
- Superseded by: none

## ADR-021: Relational Agent Guardrails For Zuamy
- Status: accepted
- Date: 2026-04-07
- Context: A named companion and pixel-art identity may improve engagement, but anthropomorphic framing also increases over-trust, dependency, and pseudo-intimacy risks.
- Decision: Zuamy may have a stable name, adjustable tone, and optional pixel-art identity, but must not use therapy framing, guilt, neediness, romance cues, reciprocity language, or retention-driven pseudo-intimacy.
- Consequences: The assistant remains a bounded planning companion. UX, copy, and evaluation checks must explicitly reject manipulative relational patterns.
- Supersedes: none
- Superseded by: none

## ADR-022: V1 Calendar Writes Restricted To Dedicated Focus Calendar
- Status: accepted
- Date: 2026-04-07
- Context: Calendar mutations carry higher real-world risk than task mutations, and the GPT memo recommends narrowly scoped write access for early versions.
- Decision: Zuamy may read calendar context by default, but V1 writes are limited to creating or moving focus blocks in a dedicated focus calendar or clearly tagged focus events. Existing third-party events are read-only unless a later module adds broader, separately consented write policies.
- Consequences: Calendar-aware planning is allowed immediately, but broad scheduling autonomy is not. Approval, diffing, and conflict preview remain mandatory even for dedicated focus-calendar writes.
- Supersedes: none
- Superseded by: none

## ADR-023: Services Reach Persistence Only Through DAOs
- Status: accepted
- Date: 2026-04-07
- Context: Zuam's backend needs a stable architectural boundary that keeps domain logic testable, persistence interchangeable, and database access auditable as the module count grows.
- Decision: The canonical NestJS backend flow is `controller -> service -> dao`. Services may orchestrate one or more DAOs, but no service may import Prisma, a database connection, raw SQL, or any direct persistence client. Only DAO classes may touch Prisma or other persistence drivers.
- Consequences: Service tests mock DAO interfaces instead of database clients, DAO integration tests own persistence verification, and transaction helpers must live below the service boundary so services still coordinate DAOs rather than raw database handles.
- Supersedes: none
- Superseded by: none

## ADR-024: Separate The Current Phase 1 Shell From The Zuamy Planning Workspace Mockup
- Status: accepted
- Date: 2026-04-08
- Context: The active Figma file contains at least two distinct light-mode desktop surfaces: `1:19` `Desktop Shell — Today` and `198:2` `Zuamy Planning Workspace (light)`. Without an explicit decision, frontend agents can incorrectly treat the planning workspace as the replacement for the Phase 1 shell.
- Decision: Treat `1:19` as the canonical Phase 1 desktop shell, `1:255` as the canonical Phase 1 task-detail panel, and `198:2` as a separate planning/AI workspace surface that is not in scope for `desktop-shell-layout` unless a later module explicitly adopts it.
- Consequences: Frontend docs must name the authoritative node IDs for Figma-backed slices. Agents implementing shell or task-detail work must fetch `1:19` and `1:255`. Work against `198:2` belongs to a separate planning/AI workspace slice rather than the core shell.
- Supersedes: none
- Superseded by: none
