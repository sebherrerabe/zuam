---
id: ai-companion-runtime-governance
title: AI Companion Runtime Governance Open Questions
status: draft
phase: 4
owners:
  - Backend Engineer
depends_on:
  - google-calendar-context
parallel_group: ai-companion
source_of_truth:
  - AI Companion for ADHD Task App.md
  - deep-research-report-ai.md
last_updated: 2026-04-07
---

# Open Questions

- What concrete local adapter contract best fits Codex CLI-, Claude Code-, and future harness-style providers without overfitting to one runtime?
- Which local storage engine should own the memory ledger and audit log in the desktop product?
- What exact retention and encryption rules should apply to audit traces, approvals, and saved memory records?
- How should the product distinguish temporary one-shot body access from persistent project-level body access in UX and policy?
- What additional evaluator or critic harness is required before any future “yolo mode” experimentation is allowed?
