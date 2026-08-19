# TaskMint Documentation

This directory contains the detailed product, engineering, operations, testing, accessibility, performance, release, and historical documentation for TaskMint.

Use this page as the navigation index.

## Start here

- `../README.md` — concise repository/project overview.
- `user-guide.md` — complete end-user behavior and feature manual.
- `setup.md` — development environment, installation, browser, build, and PWA setup.
- `troubleshooting.md` — problem-oriented recovery and debugging.

## Architecture and implementation

- `architecture.md` — runtime layers, data flows, failure model, concurrency, PWA, security boundaries.
- `data-model.md` — Task/Settings/Backup schemas, limits, IndexedDB versions, JSON and CSV contracts.
- `repository-reference.md` — exhaustive file-by-file repository map.
- `development.md` — contributor implementation rules and change discipline.
- `adr/` — architecture decision records explaining why major design constraints were chosen.

## Testing and performance

- `testing.md` — testing strategy, commands, and release-critical behavior.
- `test-matrix.md` — exhaustive current test/E2E/benchmark file map.
- `performance.md` — performance model, progressive rendering, benchmark interpretation.

## Accessibility, privacy, and security

- `accessibility.md` — accessibility implementation and manual verification.
- `../PRIVACY.md` — privacy posture.
- `../SECURITY.md` — security policy and reporting guidance.
- `../SUPPORT.md` — ordinary support channels.

## Operations and releases

- `operations.md` — package scripts, CI, E2E, CodeQL, release workflow, CSP/PWA operations, exact-SHA verification.
- `release.md` — release checklist and promotion procedure.
- `github.md` — repository/branch/check/governance configuration guidance.
- `screenshots/README.md` — real release screenshot policy and intended capture set.

## Product history and project input

- `master-prompt.md` — preserved original project master specification/input.
- `handoffs/` — archived engineering continuation checkpoints.
- `../what_changed.md` — current authoritative continuation/release-status handoff.
- `../CHANGELOG.md` — user/developer-visible change history.
- `../ROADMAP.md` — current and future milestone plan.

## Architecture decisions

Current ADRs:

1. `adr/0001-local-first-pwa.md` — local-first PWA as the primary product architecture.
2. `adr/0002-dexie-repository.md` — Dexie/IndexedDB behind a repository boundary.
3. `adr/0003-validation-persistence-boundaries.md` — validate serialized data and persistence boundaries.
4. `adr/0004-exclusive-task-mutations.md` — serialize persistence-sensitive user task mutations.
5. `adr/0005-versioned-data-portability.md` — explicit JSON/CSV compatibility/versioning.

## Documentation maintenance

Documentation is part of the repository contract.

When behavior changes:

- update the relevant guide(s);
- update `repository-reference.md` if files/responsibilities change;
- update `test-matrix.md` if test files change;
- update `CHANGELOG.md` for notable behavior;
- update `what_changed.md` for continuation state;
- add an ADR for a significant architectural decision rather than rewriting old ADR history.

Validate repository-relative links with:

```bash
npm run docs:check
```

Validate deterministic text hygiene with:

```bash
npm run format:check
```
