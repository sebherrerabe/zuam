---
id: public-progression-profiles
title: Public Progression Profiles Backend Tests
status: draft
phase: 4
owners:
  - Product Manager
depends_on:
  - player-progression-rewards
parallel_group: social-sharing
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-07
---

# Backend Tests

- `BE-UNIT-PPP-001`: public profile URLs are never created until the owner explicitly opts in.
- `BE-UNIT-PPP-002`: public snapshot payloads include only approved progression fields.
- `BE-UNIT-PPP-003`: private task-management data is excluded from all anonymous public responses.
- `BE-E2E-PPP-001`: an anonymous visitor can open a public progression URL and see only the allowed snapshot fields.
- `BE-E2E-PPP-002`: the owner can disable public visibility or regenerate the public slug and immediately invalidate the previous link.
