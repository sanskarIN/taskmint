# TaskMint Repository Reference

This guide explains what every part of the TaskMint repository owns and which files normally change together.

For the exact machine-audited tracked-path list, use `file-index.md`. `npm run docs:inventory` verifies that every `git ls-files` path appears there and that every test/E2E/benchmark path appears in `test-matrix.md`.

This document is therefore the detailed ownership/coupling reference; `file-index.md` is the exhaustive path inventory.

---

# 1. Root repository files

## `.editorconfig`

Editor-independent text defaults: UTF-8, LF, final newline, 2-space indentation, trailing-whitespace cleanup, with Markdown's intentional trailing-space exception.

Coupled with `.gitattributes` and `scripts/check-format.mjs`.

## `.env.example`

Documents the current environment shape without secrets. TaskMint currently requires no backend/API credential; the example contains only the public app-name variable.

Ordinary `.env` variants are ignored.

## `.gitattributes`

Normalizes text to LF and marks common raster images binary.

## `.gitignore`

Excludes dependencies, build/coverage/Playwright output, logs, local environment files, OS metadata, and local VS Code files except an explicitly allowed extensions recommendation path.

A future npm-generated `package-lock.json` is **not** an ignored generated artifact; it is a required release input once honestly generated.

## `.prettierignore`

Excludes generated/dependency/report directories from Prettier traversal.

## `.prettierrc.json`

Prettier style: single quotes, semicolons, no trailing commas, print width 100.

## `CHANGELOG.md`

Unreleased/release behavior history. Notable product, security, persistence, portability, accessibility, CI, and documentation changes belong here.

## `CODE_OF_CONDUCT.md`

Community conduct/governance policy.

## `CONTRIBUTING.md`

Contributor entry point. It links into setup, architecture, data model, development rules, testing, security/privacy, file inventory, and repository governance.

## `LICENSE`

MIT license. Keep README/package/distribution claims consistent with it.

## `PRIVACY.md`

Current local-storage/network/notification/export/logging privacy model. Any new analytics, cloud sync, accounts, remote AI/API task processing, or telemetry requires review/update here.

## `README.md`

Concise public repository landing page and documentation gateway. It should describe headline behavior accurately without duplicating every deep guide.

## `ROADMAP.md`

Version/milestone plan. A completed roadmap checkbox is not substitute release verification.

## `SECURITY.md`

Security design, limitations, vulnerability-reporting channel, data/import/CSP/logging/release protections.

## `SUPPORT.md`

Ordinary usage/project help routing and safe bug-report guidance. Sensitive vulnerabilities route to `SECURITY.md`.

## `eslint.config.js`

Type-aware TypeScript ESLint policy. Important protections include no floating promises and no explicit `any`; generated paths and maintenance `.mjs` scripts are intentionally excluded from the type-aware source lint profile.

## `index.html`

Production HTML shell and committed production CSP. Development-only Vite style/HMR relaxations belong in serve-mode configuration, not here.

## `package.json`

Canonical package metadata, Node engine, exact dependency versions, and npm scripts.

Current quality chain includes:

- `format:check`
- `docs:check`
- `docs:inventory`
- `secrets:check`
- `lint`
- `typecheck`
- `test`
- `build`

## `playwright.config.ts`

Production-build Chromium E2E runner. Builds/previews at `127.0.0.1:4173`, uses CI retries/trace behavior, and targets Desktop Chrome/Chromium.

## `tsconfig.json`

Project-reference root for app and Node configuration TypeScript projects.

## `tsconfig.app.json`

Strict browser/application/test project covering `src`, `tests`, `e2e`, and `bench`. It keeps tests/benchmarks inside the same strong typing discipline.

## `tsconfig.node.json`

Strict Node-side project for Vite/Playwright configuration.

## `vite.config.ts`

React/Vite build, dev-only CSP transform, Vitest setup, PWA manifest/Workbox/service-worker update configuration.

## `what_changed.md`

Current authoritative engineering continuation/release-status handoff. Historical checkpoints live under `docs/handoffs/`.

---

# 2. GitHub repository automation — `.github/`

## `.github/FUNDING.yml`

Repository funding configuration.

## `.github/PULL_REQUEST_TEMPLATE.md`

Default PR checklist for scope, tests, docs, accessibility/privacy/security, and verification.

## `.github/dependabot.yml`

Automated dependency/GitHub Actions update proposals. Automated PRs still require normal review/checks.

## `.github/ISSUE_TEMPLATE/bug_report.yml`

Structured public bug report form.

## `.github/ISSUE_TEMPLATE/feature_request.yml`

Structured feature proposal form.

## `.github/ISSUE_TEMPLATE/config.yml`

Issue chooser/blank-issue/contact-link policy.

## `.github/workflows/ci.yml`

Primary PR/main quality job. It installs dependencies, runs format/docs links/docs inventory/secrets/lint/type/tests/build, then high-severity npm audit.

## `.github/workflows/e2e.yml`

Chromium Playwright workflow for PR/main/manual execution; uploads Playwright report on failure.

## `.github/workflows/codeql.yml`

JavaScript/TypeScript CodeQL on PR/main plus scheduled analysis.

## `.github/workflows/release.yml`

Tag-only fail-closed release workflow: release guard -> locked install -> complete check -> audit -> Chromium E2E -> package `dist` -> SHA-256 -> GitHub Release.

See `operations.md` and `github.md` for exact expectations.

---

# 3. Benchmark — `bench/`

## `bench/task.bench.ts`

Deterministic non-gating Vitest 4 benchmark for 10,000-task filtering/sorting/statistics workloads.

It is diagnostic; correctness remains in ordinary tests.

See `performance.md`.

---

# 4. Public assets — `public/`

## `public/taskmint-icon.svg`

Product/PWA icon used by README, favicon/UI states, and manifest/PWA configuration.

Branding/PWA changes should review all those consumers together.

---

# 5. Application source — `src/`

## `src/main.tsx`

Browser React bootstrap. Mounts global styles/application-level boundaries/integration.

## `src/App.tsx`

Top-level use-case coordinator. Owns:

- startup load/fail-closed state;
- task/settings/filter/edit React state;
- theme/reduced motion;
- connectivity and current-time refresh;
- global shortcuts;
- reminder polling;
- toast/progressive rendering;
- persistence-first task lifecycle;
- App-wide exclusive task mutation gate;
- Settings/import/export/delete callbacks;
- component wiring.

New persistence-sensitive task entry points must be evaluated against the App-wide mutation gate.

## `src/config.ts`

Small product-level constants such as package-derived app version and task-page sizing that do not belong in data validation limits.

## `src/styles.css`

Global visual system: layout, themes, responsive behavior, task/forms/dialog/toast states, focus, reduced motion, touch targets, and reflow.

Significant changes require accessibility/manual responsive review.

---

# 6. React components — `src/components/`

## `src/components/ErrorBoundary.tsx`

Unexpected React failure boundary with recovery/reload path that does not intentionally rewrite local task data.

## `src/components/Onboarding.tsx`

First-run modal, focus containment, serialized completion persistence, busy/error behavior.

## `src/components/PwaUpdatePrompt.css`

Styles for the waiting-service-worker update prompt.

## `src/components/PwaUpdatePrompt.tsx`

Explicit Update now/Later flow using `virtual:pwa-register/react`; activation is serialized and safe/retryable.

## `src/components/SettingsDialog.tsx`

Theme/reduced-motion/notifications/data-management/about modal. Owns focus trap/restoration, serialized actions, no-dismiss-while-pending, safe errors, and immediate import-input clearing for same-file retry.

## `src/components/Sidebar.tsx`

Smart-view/project navigation with semantic navigation containment and `aria-current` selection.

## `src/components/StatsPanel.tsx`

Presentation for derived productivity statistics; no authoritative stats persistence.

## `src/components/TaskComposer.tsx`

Create/edit controlled form, limits/help, local synchronous submit lock, external App-wide disabled state, safe error presentation, edit reset.

## `src/components/TaskItem.tsx`

Task card lifecycle/reorder actions, metadata/tags, per-row mutation lock, drag/keyboard ordering hooks, external App-wide disabled state.

## `src/components/Toolbar.tsx`

Search/priority/tag/sort controls exposed as a named accessibility group.

---

# 7. Domain — `src/domain/`

## `src/domain/types.ts`

Canonical unions/interfaces for Task, TaskDraft, Settings, Backup, filters, statistics, priority, recurrence, status, theme, sort, smart views.

## `src/domain/limits.ts`

Single source of truth for ID/title/notes/project/tag/import limits.

## `src/domain/datetime.ts`

Strict date-time parser/canonicalizer that rejects impossible values before JavaScript rollover can normalize them.

## `src/domain/errors.ts`

Stable `TaskMintError` codes/details/messages and `fail(...)` helper.

## `src/domain/order.ts`

Safe-integer manual-order allocation/comparison/normalization.

## `src/domain/task.ts`

Task create/update/lifecycle/recurrence/filter/sort/reorder/statistics/reminder-due business rules.

## `src/domain/validation.ts`

Persisted/backup trust-boundary validation: shape, limits, enums, lifecycle timestamps, dates, unique IDs, settings, safe order, duplicate-order normalization.

See `data-model.md` and ADR 0003.

---

# 8. Localization — `src/i18n/`

## `src/i18n/en.ts`

English visible product string catalog and dynamic labels/messages.

## `src/i18n/errors.ts`

Safe UI error formatting: known typed TaskMint error messages survive; unknown infrastructure errors become caller-provided safe fallback copy.

---

# 9. Persistence — `src/storage/`

## `src/storage/db.ts`

Dexie database `taskmint`, schema v1/v2 indexes and v1->v2 migration defaults.

## `src/storage/repository.ts`

Validated transactional application persistence boundary.

Responsibilities include:

- validated reads;
- validated task/settings writes;
- complete batch preflight;
- duplicate bulk ID rejection;
- transactional multi-task writes;
- complete backup preflight before destructive restore transaction;
- delete-all transaction.

See ADR 0002 and ADR 0003.

---

# 10. Utilities — `src/utils/`

## `src/utils/export.ts`

JSON/CSV portability and browser download helper. Owns backup v2 parsing/serialization, current CSV `safe-text-v1`, legacy compatibility, structured tags, formula neutralization, strict quoting/headers/enums, BOM, source row numbers, blank count semantics, collision-free import order base, and deferred object-URL cleanup.

## `src/utils/keyboard.ts`

Pure global shortcut resolver/editable-target detection.

## `src/utils/logger.ts`

Development-only privacy-safe diagnostics. Raw arbitrary error/user strings are not intentionally retained; event metadata is fail-closed with narrow safe identifier handling.

## `src/utils/mutation.ts`

Reusable synchronous exclusive lock + async busy-state wrapper used by App-wide task mutations.

## `src/utils/notifications.ts`

Explicit browser notification permission/due reminder delivery with bounded title-bearing notifications and title-free excess summary.

---

# 11. Shared test setup — `src/test/`

## `src/test/setup.ts`

Global Vitest/Testing Library cleanup for DOM, timers, mocks, stubbed globals, and spies.

---

# 12. Unit/component/config tests — `tests/`

The exact current test-file inventory and detailed responsibility map is enforced/documented in `test-matrix.md`.

Current suites cover these areas:

- `tests/AppMutation.test.tsx` — cross-row App mutation exclusion.
- `tests/Onboarding.test.tsx` — onboarding duplicate completion/safe error.
- `tests/PwaUpdatePrompt.test.tsx` — PWA activation serialization/retry.
- `tests/SettingsDialog.test.tsx` — Settings serialization/no-dismiss/import retry.
- `tests/Sidebar.test.tsx` — current navigation semantics.
- `tests/TaskComposer.test.tsx` — form submission/external locks/edit reset.
- `tests/TaskItem.test.tsx` — row mutation/external lock.
- `tests/Toolbar.test.tsx` — named filter group/callbacks.
- `tests/csv-compat.test.ts` — legacy/current CSV compatibility/blank/order rules.
- `tests/csv-quoting.test.ts` — strict CSV quoting.
- `tests/csv-security.test.ts` — spreadsheet formula protection.
- `tests/datetime.test.ts` — strict date-time parsing.
- `tests/download.test.ts` — download/object URL lifecycle.
- `tests/errors.test.ts` — stable typed/safe errors.
- `tests/export.test.ts` — broad JSON/CSV portability.
- `tests/keyboard.test.ts` — shortcut resolution.
- `tests/logger.test.ts` — diagnostic privacy.
- `tests/mutation.test.ts` — exclusive gate semantics.
- `tests/notifications.test.ts` — bounded reminder delivery/retry.
- `tests/order.test.ts` — order allocation/comparison/normalization.
- `tests/property.test.ts` — seeded portability property/stress data.
- `tests/pwa-config.test.ts` — prompt-mode PWA configuration.
- `tests/release-guard.test.ts` — tag/version/lockfile guard.
- `tests/repository.test.ts` — repository read/write/preflight/transactions.
- `tests/security-config.test.ts` — production CSP/dev separation.
- `tests/task.test.ts` — task lifecycle/recurrence/filter/stats/order.
- `tests/validation-order.test.ts` — persisted order validation/normalization.

If any path changes, update both `test-matrix.md` and `file-index.md`.

---

# 13. End-to-end browser tests — `e2e/`

- `e2e/accessibility.spec.ts` — browser accessibility smoke.
- `e2e/backup-restore.spec.ts` — real JSON download/delete/file restore.
- `e2e/corrupt-local-data.spec.ts` — fail-closed malformed IndexedDB recovery.
- `e2e/keyboard.spec.ts` — real shortcut/focus behavior.
- `e2e/migration.spec.ts` — real legacy IndexedDB v1->v2 migration.
- `e2e/pagination.spec.ts` — 100-card progressive rendering boundary.
- `e2e/task-flow.spec.ts` — main task/offline/completion journey.

Playwright runs these against built/previewed production output, not only dev HMR.

---

# 14. Maintenance scripts — `scripts/`

## `scripts/check-doc-inventory.mjs`

Dependency-free Git-backed documentation completeness guard.

It uses `git ls-files` and verifies:

- every tracked file path appears in `docs/file-index.md`;
- required ownership-guide subsystem headings remain in this repository reference;
- every test/E2E/benchmark/shared test setup path appears in `docs/test-matrix.md`.

## `scripts/check-doc-links.mjs`

Dependency-free repository-relative Markdown link validator.

## `scripts/check-format.mjs`

Dependency-free LF/final-newline/trailing-whitespace invariant checker.

## `scripts/check-release.mjs`

Dependency-free exact tag/package version + required committed lockfile readiness guard.

## `scripts/check-secrets.mjs`

Dependency-free common credential/private-key pattern scanner that reports location/category without intentionally printing matched secret content.

---

# 15. Documentation — `docs/`

## `docs/README.md`

Documentation navigation index and documentation-completeness maintenance rules.

## `docs/file-index.md`

Exact compact tracked-file inventory enforced against `git ls-files`. This is the definitive “no tracked file skipped” path list.

## `docs/user-guide.md`

Complete end-user manual.

## `docs/data-model.md`

Normative human-readable Task/Settings/Backup/IndexedDB/JSON/CSV/limit/normalization compatibility reference.

## `docs/operations.md`

Package scripts, CI/E2E/CodeQL/release, lockfile, docs-inventory, CSP/PWA operations, exact-SHA verification.

## `docs/test-matrix.md`

Exhaustive current automated test/E2E/benchmark/shared-test-setup map.

## `docs/repository-reference.md`

This ownership/coupling guide.

## `docs/accessibility.md`

Accessibility semantics/keyboard/focus/reflow/theme/reduced-motion/pending-state/manual release review.

## `docs/architecture.md`

Runtime boundaries, data flow, persistence, mutation serialization, PWA/security/failure model.

## `docs/development.md`

Contributor implementation rules and change discipline.

## `docs/github.md`

GitHub branch protection/check/merge/template/Actions/Dependabot/tag/repository-governance guidance.

## `docs/master-prompt.md`

Preserved original project master specification/input. Historical/product-input material, not runtime verification evidence.

## `docs/performance.md`

Current in-memory/progressive-rendering performance model, benchmarks, measurement rules, future optimization criteria.

## `docs/release.md`

Deep exact-source release checklist and manual browser/security/accessibility/import/PWA verification.

## `docs/setup.md`

Developer environment/install/build/preview/E2E/PWA/storage setup.

## `docs/testing.md`

Testing/verification strategy including documentation inventory as a first-class gate.

## `docs/troubleshooting.md`

Symptom-oriented setup/storage/import/PWA/CI/release recovery guide.

## `docs/screenshots/README.md`

Policy/intended set for **real** verified release screenshots using fictional/demo data.

## `docs/handoffs/what_changed-rc6-2026-08-19.md`

Archived RC6 engineering continuation history.

### ADRs

- `docs/adr/0001-local-first-pwa.md` — local-first PWA decision.
- `docs/adr/0002-dexie-repository.md` — Dexie behind repository boundary.
- `docs/adr/0003-validation-persistence-boundaries.md` — validate serialization/persistence boundaries.
- `docs/adr/0004-exclusive-task-mutations.md` — serialize persistence-sensitive user task writes.
- `docs/adr/0005-versioned-data-portability.md` — explicit JSON/CSV version compatibility.

ADRs are historical decisions. Add a new ADR for a materially new competing decision rather than rewriting accepted history to make it look as though the old decision never existed.

---

# 16. Dependency/consumer map

```text
index.html
  -> src/main.tsx
      -> ErrorBoundary
      -> App
      -> PwaUpdatePrompt

App
  -> components
  -> domain
  -> TaskRepository
  -> import/export
  -> keyboard
  -> reminders
  -> mutation gate
  -> safe diagnostics

TaskRepository
  -> Dexie db
  -> validation
  -> order normalization

Domain
  -> types
  -> limits
  -> datetime
  -> errors
  -> order

JSON/CSV
  -> export utility
  -> task creation
  -> validation
  -> limits
  -> typed errors
```

Tests mirror these boundaries rather than relying on one huge browser suite.

---

# 17. Files that normally move together

## Persisted Task/Settings schema change

Review/update:

- domain types/limits/task/validation;
- Dexie db/migration;
- repository;
- JSON/CSV behavior where applicable;
- UI/i18n if exposed;
- repository/unit/property/migration/E2E tests;
- `data-model.md`, `architecture.md`, changelog, ADR if architectural.

## Import/export change

Review/update:

- `src/utils/export.ts`;
- domain limits/validation/errors;
- App/Settings integration;
- CSV/JSON/property/download/browser restore tests;
- user/data/testing docs and compatibility ADR.

## Async task mutation change

Review/update:

- `src/App.tsx`;
- `src/utils/mutation.ts`;
- TaskComposer/TaskItem;
- repository transaction behavior;
- mutation/App/component regressions;
- architecture/development/user/release docs.

## PWA change

Review/update:

- `vite.config.ts`;
- PwaUpdatePrompt component/style;
- bootstrap/integration;
- PWA config/component/browser/manual release tests;
- architecture/user/operations/release docs.

## CSP/security change

Review/update:

- `index.html`;
- `vite.config.ts`;
- security config test;
- `SECURITY.md`/`PRIVACY.md` as applicable;
- architecture/development/operations docs.

## Accessibility/UI structure change

Review/update:

- component/style/i18n;
- component/browser accessibility tests;
- `accessibility.md`, user guide, release manual checks.

## CI/release/repository tooling change

Review/update:

- `package.json`;
- scripts;
- workflows;
- script/config tests;
- operations/testing/release/contributing/github docs;
- `file-index.md` for new/renamed paths.

---

# 18. Generated/local paths not tracked as source

Examples:

- `node_modules/`
- `dist/`
- `coverage/`
- `playwright-report/`
- `test-results/`
- local `.env` files
- logs/OS metadata.

These should not be mistaken for missing repository documentation paths.

A real npm-generated `package-lock.json` is a future tracked release input, not an artifact to fabricate manually.

---

# 19. Documentation authority order

When something appears inconsistent:

1. executable source/config/tests define current implementation behavior;
2. `file-index.md` defines the audited tracked-path inventory;
3. `data-model.md` / `architecture.md` / `operations.md` explain technical contracts;
4. this file explains ownership/coupling;
5. `user-guide.md` explains user-facing behavior;
6. `README.md` is the concise entry point;
7. `what_changed.md` records current continuation/release status;
8. archived handoffs/master prompt are historical context.

Documentation drift is a repository bug. Fix it with the behavior that causes the drift.
