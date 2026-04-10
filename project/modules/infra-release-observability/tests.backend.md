---
id: infra-release-observability
title: Infra Release and Observability Backend Tests
status: ready
phase: 1
owners:
  - Infra / DevOps
depends_on:
  - monorepo-platform
parallel_group: foundation
source_of_truth: PRD_Zuam_v0.3.md
last_updated: 2026-04-10
---

# Backend Tests

- `BE-UNIT-INFRA-001`: workflow lint test rejects malformed GitHub Actions YAML or missing job names.
- `BE-UNIT-INFRA-002`: release job enforces the required build order before packaging artifacts.
- `BE-UNIT-INFRA-003`: artifact metadata includes version, SHA, and channel data.
- `BE-UNIT-INFRA-004`: workflow summary contains the failing stage and package name when a job fails, including shipping-track backend suites.
- `BE-UNIT-INFRA-005`: provenance trace test can link a release back to a commit SHA and workflow run ID.
- `BE-E2E-INFRA-001`: a tagged commit can be traced from workflow run to artifact to published release entry using only documented metadata.
- `BE-E2E-INFRA-002`: tagged desktop packaging emits both installer and portable Windows artifacts before publish.
- `BE-E2E-INFRA-003`: release packaging is blocked until shipping-track backend integration/e2e suites pass against disposable Postgres.
