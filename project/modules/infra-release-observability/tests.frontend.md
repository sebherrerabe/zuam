---
id: infra-release-observability
title: Infra Release and Observability Frontend Tests
status: ready
phase: 1
owners:
  - Infra / DevOps
depends_on:
  - monorepo-platform
parallel_group: foundation
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-04
---

# Frontend Tests

- `FE-UNIT-INFRA-001`: desktop runtime can surface build metadata in an about/settings surface without hardcoding version strings.
- `FE-UNIT-INFRA-002`: update-available state renders a clear CTA instead of a silent failure when release metadata changes.
- `FE-UNIT-INFRA-003`: the desktop shell accepts injected build metadata from the workspace environment at startup.
