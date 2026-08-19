# TaskMint Repository Reference

This is the file-by-file map of the current TaskMint repository. Its purpose is to make the repository understandable without requiring a contributor to guess responsibilities from filenames.

The reference covers every current committed file category: root configuration/governance, GitHub automation, application source, test infrastructure, unit/component/config tests, E2E tests, benchmarks, maintenance scripts, public assets, documentation, ADRs, screenshot policy, and continuation handoffs.

When files are added, removed, or repurposed, update this reference in the same change.

---

# 1. Root repository files

## `.editorconfig`

Editor-agnostic text-format defaults.

Current contract:

- repository root config;
- UTF-8;
- LF line endings;
- final newline;
- spaces with 2-space indentation;
- trailing whitespace trimmed generally;
- Markdown trailing whitespace allowed because Markdown uses it for intentional line breaks.

This aligns editor behavior with `scripts/check-format.mjs` and Git text normalization.

## `.env.example`

Documents environment-variable expectations without committing secrets.

Current content declares that TaskMint needs no secret/backend configuration and includes only:

```text
VITE_APP_NAME=TaskMint
```

Ordinary `.env` variants are ignored by Git.

## `.gitattributes`

Repository line-ending and binary-file classification.

Current behavior:

- automatic text detection with LF normalization;
- common raster image formats explicitly treated as binary.

This complements `.editorconfig` and the formatting guard.

## `.gitignore`

Excludes generated/local/private development artifacts.

Current ignored categories include:

- `node_modules/`;
- `dist/`;
- coverage output;
- Playwright reports/results;
- log files;
- `.env` variants except `.env.example`;
- OS metadata;
- VS Code local files except an optional committed extensions recommendation.

Do not remove secret/local environment ignores without a clear security reason.

## `.prettierignore`

Prevents Prettier from traversing generated/dependency/report directories:

- `dist`
- `coverage`
- `playwright-report`
- `test-results`
- `node_modules`

## `.prettierrc.json`

Prettier formatting policy:

- single quotes;
- no trailing commas;
- 100-character print width;
- semicolons enabled.

Note that `format:check` additionally enforces repository text invariants with a dependency-free custom script.

## `CHANGELOG.md`

Human-readable Unreleased/release history.

Current Unreleased section records v0.1 implementation and hardening, including persistence safety, CSV/JSON portability, concurrency controls, accessibility, PWA update behavior, privacy diagnostics, testing, CI, and release requirements.

Behavioral changes should update this file before release.

## `CODE_OF_CONDUCT.md`

Community participation expectations and enforcement baseline for contributors/interactions.

It is a governance document, not application runtime code.

## `CONTRIBUTING.md`

Contributor workflow and architectural guardrails.

It describes:

- privacy/offline/accessibility principles;
- branch/local workflow;
- testing expectations;
- documentation/`what_changed.md` responsibility;
- commit style;
- security-report routing.

Detailed implementation guidance lives in `docs/development.md`.

## `LICENSE`

MIT license for the open-source project.

Keep repository/license claims, README license badge, and package/distribution expectations consistent with this file.

## `PRIVACY.md`

Project privacy policy/documentation.

It explains TaskMint's local-first/no-required-backend posture and should be updated if network transmission, analytics, accounts, synchronization, or other data processing is introduced.

## `README.md`

Primary repository landing page.

It provides:

- product purpose;
- major features;
- screenshot policy;
- keyboard shortcuts;
- supported platform posture;
- technology stack;
- setup and quality commands;
- architecture/security/accessibility overview;
- contribution/license/contact links.

It should remain concise enough for discovery and route deeper readers into `docs/`.

## `ROADMAP.md`

Version-oriented product/engineering plan.

It distinguishes completed v0.1 foundation/hardening from future v0.2/v0.3 ideas. It should not be used to claim release completion when verification gates are still outstanding.

## `SECURITY.md`

Security policy and vulnerability-reporting guidance.

Security-sensitive disclosures should follow this file instead of ordinary public bug-report flow when disclosure could put users at risk.

## `SUPPORT.md`

User/support routing and expected channels.

Use it for ordinary usage/help questions; use `SECURITY.md` for vulnerability reporting.

## `eslint.config.js`

Type-aware ESLint configuration.

Key behavior:

- ignores generated output/reports/dependencies, the config file itself, and maintenance `.mjs` scripts;
- uses `typescript-eslint` recommended type-checked rules;
- uses TypeScript project service;
- rejects floating promises;
- rejects explicit `any`;
- enforces interface-style type definitions;
- configures promise misuse checking for React attribute patterns.

A source/test TypeScript change is expected to pass this configuration with zero warnings.

## `index.html`

Production HTML shell and primary Content Security Policy source.

Contains:

- UTF-8/viewport/theme metadata;
- product description;
- restrictive production CSP;
- SVG favicon;
- root React mount node;
- module entry `/src/main.tsx`;
- noscript message.

Production CSP currently restricts scripts/styles/connections/forms/base/object loading to intended origins. Dev-only relaxations are injected by `vite.config.ts` only while serving development mode.

## `package.json`

Node/npm package and command manifest.

Defines:

- package name/version/description;
- ESM package mode;
- Node engine `>=22.12`;
- exact pinned runtime/development dependencies;
- all repository npm scripts.

Important scripts include development, build, preview, typecheck, lint, format, deterministic repository guards, Vitest, benchmark, Playwright, release readiness, and combined check.

A real npm-generated `package-lock.json` is intentionally required before release but is not currently fabricated/committed.

## `playwright.config.ts`

Playwright browser-test configuration.

Current behavior:

- test directory `./e2e`;
- fully parallel tests;
- two retries in CI, none locally;
- GitHub reporter in CI/list reporter locally;
- base URL `http://127.0.0.1:4173`;
- trace on first retry;
- web server runs production build then preview;
- existing local server can be reused outside CI;
- Chromium/Desktop Chrome project.

This intentionally tests built/previewed output rather than Vite HMR source behavior.

## `tsconfig.json`

Top-level TypeScript project-reference aggregator.

References:

- `tsconfig.app.json`
- `tsconfig.node.json`

No direct source files are compiled from this root config.

## `tsconfig.app.json`

Strict browser/application/test TypeScript project.

Important options include:

- ES2022 target/libs plus DOM;
- `strict`;
- `noUncheckedIndexedAccess`;
- `noFallthroughCasesInSwitch`;
- `noImplicitOverride`;
- bundler module resolution;
- isolated modules;
- no emit;
- React JSX transform;
- Vitest and PWA React types.

Includes:

- `src`
- `tests`
- `e2e`
- `bench`

Thus tests and benchmarks are part of type checking, not separate untyped scripts.

## `tsconfig.node.json`

Strict Node-side TypeScript project for configuration files.

Targets ES2023 and includes:

- `vite.config.ts`
- `playwright.config.ts`

## `vite.config.ts`

Combined Vite/Vitest/PWA configuration.

Responsibilities:

- React Vite plugin;
- dev-only CSP relaxation for Vite inline style injection/HMR WebSockets;
- `vite-plugin-pwa` prompt-mode service-worker registration;
- TaskMint manifest/icon settings;
- Workbox precache patterns/navigation fallback;
- ES2022 production build target;
- source maps and CSS splitting;
- Vitest jsdom environment and shared setup file.

Security rule: do not copy the serve-only CSP relaxations into production `index.html`.

## `what_changed.md`

Authoritative continuation/work-handoff checkpoint.

It records the exact current engineering phase, branch/PR state, completed hardening, release blockers, and next work. Older milestone history is archived under `docs/handoffs/` rather than being silently discarded.

---

# 2. GitHub repository automation — `.github/`

## `.github/FUNDING.yml`

GitHub Sponsors/Funding configuration for the repository's configured funding link(s).

## `.github/PULL_REQUEST_TEMPLATE.md`

Default pull-request checklist/template.

It guides contributors toward scoped changes, tests, documentation, accessibility/privacy review, and appropriate quality verification.

## `.github/dependabot.yml`

Dependabot update configuration.

Automated dependency update PRs remain subject to ordinary CI/E2E/security review; automation is not approval evidence by itself.

## `.github/ISSUE_TEMPLATE/bug_report.yml`

Structured GitHub issue form for bug reports.

Collects reproducible information more consistently than a blank issue.

## `.github/ISSUE_TEMPLATE/feature_request.yml`

Structured feature-request issue form.

Used for product enhancement proposals rather than defects.

## `.github/ISSUE_TEMPLATE/config.yml`

Issue-template chooser/config behavior, including the repository's policy for blank issues and support/security routing as configured.

## `.github/workflows/ci.yml`

Primary pull-request/main quality workflow.

Runs on:

- push to `main`;
- pull requests.

Uses read-only repository contents permission and ref-scoped concurrency cancellation.

Quality job performs dependency install, format/docs/secrets checks, lint, typecheck, Vitest, production build, and high-severity npm audit.

See `docs/operations.md`.

## `.github/workflows/e2e.yml`

Chromium Playwright workflow.

Runs on main pushes, PRs, and manual dispatch. It installs dependencies + Chromium, runs E2E, and uploads the Playwright report for seven days on failure.

## `.github/workflows/codeql.yml`

GitHub CodeQL JavaScript/TypeScript analysis.

Runs on main pushes, PRs, and weekly schedule with `security-events: write` permission for results.

## `.github/workflows/release.yml`

Tag-driven release workflow for `v*.*.*` tags.

Fail-closed sequence:

1. release guard;
2. locked `npm ci`;
3. quality suite;
4. high-severity audit;
5. Chromium E2E;
6. package `dist`;
7. SHA-256 checksum;
8. GitHub Release upload.

No `npm install` fallback is allowed in tagged releases.

---

# 3. Benchmark — `bench/`

## `bench/task.bench.ts`

Non-gating Vitest 4 benchmark for large in-memory domain work, currently centered on 10,000-task filtering/sorting/statistics scenarios.

Use `npm run bench`. Timing is diagnostic, not a hard CI threshold.

See `docs/performance.md`.

---

# 4. Public assets — `public/`

## `public/taskmint-icon.svg`

TaskMint application/logo icon.

Consumed by:

- README presentation;
- HTML favicon;
- UI onboarding/loading/fatal states;
- PWA manifest/include-assets configuration.

Changing it affects application branding and installable-PWA presentation.

---

# 5. Application source — `src/`

## `src/main.tsx`

React application bootstrap.

Responsibilities include mounting the root React tree, global styles, error boundary, and PWA update prompt/application integration as configured by the current source.

This is the browser entry referenced by `index.html`.

## `src/App.tsx`

Top-level application coordinator/use-case layer.

Responsibilities include:

- load tasks/settings from repository;
- fail-closed startup state;
- React task/settings/filter/edit state;
- theme and reduced-motion application;
- online/offline status;
- date-sensitive refresh;
- global keyboard shortcuts;
- reminder polling;
- toast lifecycle;
- progressive task rendering;
- task create/edit/lifecycle/reorder/delete/undo persistence;
- application-wide exclusive task mutation gate;
- settings/import/export/delete-all callbacks;
- JSON/CSV UI integration;
- wiring Sidebar/Toolbar/TaskComposer/TaskItem/Stats/Settings.

Important invariant: persistent changes complete successfully before corresponding React state mutation.

## `src/config.ts`

Small application-level configuration constants, including package-derived/static application constants such as current version/page sizing used by UI.

Keep true product-wide constants here when they do not belong to domain limits.

## `src/styles.css`

Global application styling.

Contains layout, responsive behavior, theme variables, typography/forms/buttons/cards/sidebar/tasks/dialog/toast/accessibility styles and reduced-motion/touch/viewport adaptations.

Accessibility/manual review must accompany significant style changes because visual focus, reflow, target size, and non-color signaling depend on this file.

---

# 6. React components — `src/components/`

## `src/components/ErrorBoundary.tsx`

React error boundary for unexpected render/runtime component errors.

Provides a safe reload/recovery path rather than intentionally mutating persisted task data.

## `src/components/Onboarding.tsx`

First-run onboarding modal.

Owns onboarding presentation, focus containment, serialized completion action, busy/disabled semantics, and safe persistence failure message.

Test: `tests/Onboarding.test.tsx`.

## `src/components/PwaUpdatePrompt.css`

Scoped styles for the PWA update toast/prompt and action arrangement.

## `src/components/PwaUpdatePrompt.tsx`

User-controlled waiting-service-worker update prompt.

Uses `virtual:pwa-register/react`, calls `updateServiceWorker(true)` only on explicit Update now, serializes activation, exposes busy/error state, and supports Later dismissal.

Tests: `tests/PwaUpdatePrompt.test.tsx`, `tests/pwa-config.test.ts`.

## `src/components/SettingsDialog.tsx`

Settings/data-management modal.

Responsibilities:

- theme;
- reduced motion;
- notification permission trigger;
- JSON/CSV export controls;
- JSON/CSV file inputs;
- delete-all local-data trigger;
- app update reload control;
- About/support/funding links;
- focus trap/restoration;
- serialized settings/data actions;
- no-dismiss while action pending;
- safe action errors;
- immediate clearing of selected import input values for same-file retryability.

Test: `tests/SettingsDialog.test.tsx`.

## `src/components/Sidebar.tsx`

Smart-view and project navigation.

Maintains semantic navigation landmark and `aria-current` current-selection signaling for active view/project.

Test: `tests/Sidebar.test.tsx`.

## `src/components/StatsPanel.tsx`

Presentation-only productivity statistics panel for counts/rates derived by domain logic.

It does not persist statistics.

## `src/components/TaskComposer.tsx`

Create/edit task form.

Responsibilities:

- draft fields;
- controlled edit population/reset;
- input length affordances;
- task submit conversion;
- local duplicate-submit lock;
- busy/disabled UI;
- external App-wide mutation lock;
- safe known/unknown submit error handling.

Test: `tests/TaskComposer.test.tsx`.

## `src/components/TaskItem.tsx`

Task-card presentation/action controls.

Responsibilities:

- completion state UI;
- metadata/tags;
- archive/restore/delete/edit;
- keyboard reorder controls;
- drag/drop hooks;
- per-row async mutation serialization;
- App-wide external disabled state;
- task-specific accessible labels.

Test: `tests/TaskItem.test.tsx`.

## `src/components/Toolbar.tsx`

Search, priority filter, tag filter, and sort controls.

Exposes a named semantic group and keyboard-shortcut metadata on search.

Test: `tests/Toolbar.test.tsx`.

---

# 7. Domain — `src/domain/`

## `src/domain/types.ts`

Canonical TypeScript interfaces/unions for:

- Priority;
- Recurrence;
- TaskStatus;
- ThemeMode;
- SortMode;
- SmartView;
- Task;
- TaskDraft;
- AppSettings;
- TaskFilters;
- ProductivityStats;
- TaskBackup.

See `docs/data-model.md`.

## `src/domain/limits.ts`

Single source of truth for task/import bounds:

- ID;
- title;
- notes;
- project;
- tag count/length;
- backup/import task count;
- import input size.

UI, validation, JSON, and CSV logic should reference this rather than duplicating magic values.

## `src/domain/datetime.ts`

Strict date-time parsing/canonicalization helper.

Prevents permissive JavaScript Date normalization from accepting impossible calendar/time input.

Test: `tests/datetime.test.ts`.

## `src/domain/errors.ts`

Stable typed validation/import error system.

Contains:

- `TaskMintErrorCode` union;
- structured details type;
- `TaskMintError` class;
- `fail(...)` helper;
- stable safe default message mapping.

Do not expose arbitrary infrastructure errors as equivalent typed user errors.

Test: `tests/errors.test.ts`.

## `src/domain/order.ts`

Manual-order algorithms.

Responsibilities:

- deterministic `(order, id)` comparison;
- next safe order allocation;
- safe-integer arithmetic checks;
- duplicate-order normalization.

Tests: `tests/order.test.ts`, `tests/validation-order.test.ts`.

## `src/domain/task.ts`

Core task business rules.

Responsibilities include:

- create/update normalization;
- complete/reopen/archive/restore transitions;
- recurrence and next occurrence;
- strict task field handling;
- filtering/smart views;
- sorting;
- visible-slot reorder;
- statistics;
- reminder-due predicate;
- local calendar date formatting.

Test: `tests/task.test.ts` plus property/import/E2E consumers.

## `src/domain/validation.ts`

Trust-boundary validation for persisted/backup TaskMint data.

Validates:

- backup envelope/version/app;
- task count;
- task shape/enums/limits/timestamps/order/lifecycle invariants;
- duplicate IDs;
- tags;
- settings;
- export timestamp.

Also normalizes duplicate safe order slots in a validated backup.

Tests: `tests/validation-order.test.ts`, `tests/repository.test.ts`, `tests/export.test.ts`.

---

# 8. Localization — `src/i18n/`

## `src/i18n/en.ts`

English visible product string catalog.

Contains labels, status text, dynamic string functions, error fallback copy, navigation names, onboarding/settings text, statistics labels, reminders, import/export messages, and support/about copy.

New visible product text should normally be added here rather than embedded independently in components.

## `src/i18n/errors.ts`

Small UI error boundary/formatter that returns known TaskMint typed error messages while substituting a caller-provided safe fallback for unknown infrastructure errors.

Tested through `tests/errors.test.ts` and component flows.

---

# 9. Persistence — `src/storage/`

## `src/storage/db.ts`

Dexie database definition.

Database:

```text
taskmint
```

Tables:

- tasks;
- settings.

Defines schema v1 and current v2 indexes plus v1->v2 migration defaults for reminder/tags/project/recurrence fields.

Browser migration test: `e2e/migration.spec.ts`.

## `src/storage/repository.ts`

Application persistence facade/trust boundary.

Responsibilities:

- validated task reads;
- validated single/batch/replacement writes;
- duplicate ID batch rejection;
- explicit multi-task transactions;
- default/validated settings;
- full backup preflight before restore transaction;
- delete-all transactional cleanup.

Tests: `tests/repository.test.ts`; browser corruption coverage in `e2e/corrupt-local-data.spec.ts`.

---

# 10. Utilities — `src/utils/`

## `src/utils/export.ts`

JSON backup and CSV portability implementation.

Responsibilities:

- create/serialize/parse backup;
- CSV export/import;
- current version marker `safe-text-v1`;
- structured lossless tag cells;
- legacy CSV compatibility;
- strict quote/header/enum/task validation;
- spreadsheet-formula neutralization;
- BOM handling;
- source-record row numbers;
- blank-record count handling;
- caller-provided import order rebasing;
- browser text download helper and deferred object URL cleanup.

Tests: `export`, `csv-compat`, `csv-quoting`, `csv-security`, `property`, `download` suites.

## `src/utils/keyboard.ts`

Pure global keyboard shortcut resolver and editable-target detection.

Keeps shortcut decision logic deterministic/testable and outside DOM-heavy App handlers.

Test: `tests/keyboard.test.ts` and browser `e2e/keyboard.spec.ts`.

## `src/utils/logger.ts`

Development-only diagnostic helpers with privacy-preserving redaction.

`logError` keeps coarse/stable error metadata rather than raw arbitrary messages.

`logEvent` fail-closes arbitrary strings/objects and only retains explicitly safe scalar/identifier forms.

Test: `tests/logger.test.ts`.

## `src/utils/mutation.ts`

Reusable exclusive async mutation gate.

Coordinates synchronous lock + UI busy state and guarantees cleanup in `finally`. Used by `App.tsx` to prevent cross-task stale-snapshot writes.

Test: `tests/mutation.test.ts` and `tests/AppMutation.test.tsx`.

## `src/utils/notifications.ts`

Browser Notification API helper.

Responsibilities:

- explicit permission request;
- identify due active reminders;
- bounded individual notifications;
- title-free excess summary;
- delivery retryability via notified-ID state.

Test: `tests/notifications.test.ts`.

---

# 11. Shared test setup — `src/test/`

## `src/test/setup.ts`

Vitest/Testing Library cleanup hook used by `vite.config.ts`.

Resets DOM, timers, mocks, globals, and spies after tests to prevent cross-test contamination.

---

# 12. Unit/component/config tests — `tests/`

The detailed behavior matrix lives in `docs/test-matrix.md`. Every current file is listed below.

## `tests/AppMutation.test.tsx`

App-level cross-row exclusive task mutation regression.

## `tests/Onboarding.test.tsx`

Onboarding duplicate completion lock and safe failure behavior.

## `tests/PwaUpdatePrompt.test.tsx`

PWA update activation lock, busy state, safe failure/retry.

## `tests/SettingsDialog.test.tsx`

Settings serialization, no-dismiss behavior, safe export errors, stale error reset, immediate same-file import selection clearing.

## `tests/Sidebar.test.tsx`

`aria-current`, project callback, and navigation landmark semantics.

## `tests/TaskComposer.test.tsx`

Accessible task submission, local duplicate-submit lock, external App lock, edit reset.

## `tests/TaskItem.test.tsx`

Per-row mutation lock and external App-wide lock.

## `tests/Toolbar.test.tsx`

Named search/filter group, shortcut metadata, and filter callback wiring.

## `tests/csv-compat.test.ts`

Legacy/marked CSV compatibility, encoding versions, structured tags, blank-row row numbering, import-order rebasing, blank-record count limit.

## `tests/csv-quoting.test.ts`

Strict CSV quote placement/escaped quote parser behavior.

## `tests/csv-security.test.ts`

Spreadsheet formula-prefix neutralization edge cases.

## `tests/datetime.test.ts`

Strict timestamp/calendar parsing and canonicalization.

## `tests/download.test.ts`

Export object URL/download lifecycle.

## `tests/errors.test.ts`

Typed error codes/details and safe user error boundary.

## `tests/export.test.ts`

Broad JSON/CSV round-trip/validation/compatibility/stress coverage.

## `tests/keyboard.test.ts`

Pure shortcut resolution and editable/modal safeguards.

## `tests/logger.test.ts`

Diagnostic privacy/redaction/identifier allowlist.

## `tests/mutation.test.ts`

Exclusive mutation utility semantics and cleanup.

## `tests/notifications.test.ts`

Reminder delivery, bounding, privacy summary, failure retryability.

## `tests/order.test.ts`

Safe allocation, deterministic comparison, normalization, overflow, large lists.

## `tests/property.test.ts`

Seeded deterministic portability property/stress round trips.

## `tests/pwa-config.test.ts`

Prompt-mode PWA configuration and explicit waiting-worker activation integration.

## `tests/release-guard.test.ts`

Release tag/version/lockfile guard via isolated fixtures.

## `tests/repository.test.ts`

Validated repository reads/writes, transactions, preflight, duplicate IDs, failure propagation.

## `tests/security-config.test.ts`

Production CSP invariants and dev-relaxation separation.

## `tests/task.test.ts`

Core task normalization/lifecycle/recurrence/filter/sort/stats/date/order behavior.

## `tests/validation-order.test.ts`

Persisted unsafe order rejection and duplicate-order backup normalization.

---

# 13. End-to-end browser tests — `e2e/`

## `e2e/accessibility.spec.ts`

Browser accessibility smoke checks for landmarks, control names/labels, and shortcut metadata.

## `e2e/backup-restore.spec.ts`

Real browser JSON backup -> local delete -> file restore journey.

## `e2e/corrupt-local-data.spec.ts`

Seeds malformed current IndexedDB data and verifies fail-closed editor blocking without destructive cleanup.

## `e2e/keyboard.spec.ts`

Browser focus behavior for `Ctrl/Cmd+K`, `N`, and typing-context safeguards.

## `e2e/migration.spec.ts`

Seeds legacy IndexedDB v1/native schema data and verifies current Dexie migration.

## `e2e/pagination.spec.ts`

Seeds 101 tasks and verifies 100 initial cards + progressive reveal.

## `e2e/task-flow.spec.ts`

Primary task/offline/completion user journey.

---

# 14. Maintenance scripts — `scripts/`

## `scripts/check-doc-links.mjs`

Dependency-free repository-relative Markdown link validator.

Walks `docs/` and `.github/` plus explicit root Markdown files. Rejects missing local targets, repository escapes, and invalid percent-encoding. External links are intentionally not fetched.

## `scripts/check-format.mjs`

Dependency-free deterministic text hygiene guard.

Checks LF, final newline, and trailing whitespace across source/tests/E2E/bench/docs/GitHub/scripts and explicit root files.

## `scripts/check-release.mjs`

Dependency-free release readiness guard.

Requires exact tag/package version match and presence of a real committed `package-lock.json`.

## `scripts/check-secrets.mjs`

Dependency-free common credential/private-key pattern guard.

Scans repository text and reports file/line/category without intentionally printing matched credential material.

---

# 15. Documentation — `docs/`

## `docs/user-guide.md`

Complete end-user manual for task lifecycle, views, filters, Settings, imports/exports, reminders, offline/PWA behavior, recovery, accessibility, and privacy boundaries.

## `docs/data-model.md`

Normative human-readable reference for Task/Settings/Backup shapes, enum values, lifecycle invariants, limits, IndexedDB versions/migration, JSON v2, CSV `safe-text-v1`, strict parser rules, normalization, and compatibility policy.

## `docs/operations.md`

Maintainer handbook for package scripts, CI/E2E/CodeQL/release workflows, dependency/lockfile policy, CSP/PWA operational boundaries, exact-SHA verification, release evidence, and incident/debug flow.

## `docs/test-matrix.md`

Exhaustive mapping of current tests/E2E/benchmark/support files to the behavior and implementation they protect.

## `docs/repository-reference.md`

This file. Exhaustive repository structure/responsibility reference.

## `docs/accessibility.md`

Accessibility design/verification guide covering keyboard, focus, semantics, reduced motion, target sizing, reflow, status messaging, and manual review expectations.

## `docs/architecture.md`

Layered system architecture: domain, persistence, utilities, localization, presentation/App orchestration, data flow, offline/PWA model, CSP, and failure/recovery model.

## `docs/development.md`

Developer rules and important commands. Describes where business rules, persistence, limits, ordering, strings, shortcuts, diagnostics, PWA behavior, and portability logic belong.

## `docs/github.md`

GitHub repository governance/automation guidance: branch protection, PR/check expectations, Dependabot/Actions practices, and repository settings relevant to healthy maintenance.

## `docs/master-prompt.md`

Preserved project master prompt/specification used to guide the original TaskMint implementation scope.

It is historical/product-input documentation, not executable source or proof that a feature is verified. Current implementation/reference docs are authoritative for actual repository behavior.

## `docs/performance.md`

Performance expectations and benchmark interpretation, including large-list rendering and measured-before-optimizing guidance.

## `docs/release.md`

Manual and automated release checklist, lockfile/tag requirements, quality/security/browser verification, screenshots, and release artifact expectations.

## `docs/setup.md`

Environment/install/build/PWA setup instructions for developers.

## `docs/testing.md`

Testing strategy and detailed discussion of unit/component/property/E2E/repository/configuration checks. `test-matrix.md` is the exhaustive file list.

## `docs/troubleshooting.md`

Problem-oriented recovery guide for setup, IndexedDB, imports, notifications, PWA updates, offline behavior, and verification failures.

---

# 16. Architecture Decision Records — `docs/adr/`

## `docs/adr/0001-local-first-pwa.md`

Records the architectural decision to make TaskMint a local-first web/PWA product rather than requiring a backend/cloud account for core operation.

## `docs/adr/0002-dexie-repository.md`

Records the use of Dexie/IndexedDB behind a repository abstraction rather than coupling UI components directly to browser persistence APIs.

Additional architectural decisions that materially alter persistence, data portability, task concurrency, networking, or distribution should receive new ADRs rather than rewriting historical decisions.

---

# 17. Screenshot policy — `docs/screenshots/`

## `docs/screenshots/README.md`

Defines the release screenshot capture policy/set while intentionally avoiding fabricated product screenshots before a verified browser build exists.

Real screenshots should be added here only after release verification and should contain fictional/demo user data.

---

# 18. Continuation history — `docs/handoffs/`

## `docs/handoffs/what_changed-rc6-2026-08-19.md`

Archived complete RC6 continuation handoff.

Preserved verbatim so the root `what_changed.md` can remain current without deleting engineering history.

This file is historical context, not current release verification evidence.

---

# 19. Dependency/consumer map

A useful mental model for changing TaskMint:

```text
index.html
  -> src/main.tsx
      -> ErrorBoundary
      -> App
      -> PwaUpdatePrompt

App
  -> components
  -> domain rules
  -> repository
  -> import/export
  -> keyboard
  -> notifications
  -> mutation gate
  -> logging

repository
  -> Dexie db
  -> validation
  -> order normalization

domain
  -> types
  -> limits
  -> datetime
  -> errors
  -> order

CSV/JSON
  -> export utility
  -> task creation
  -> validation
  -> limits
  -> typed errors
```

Tests mirror these boundaries rather than relying on one end-to-end suite for every invariant.

---

# 20. Files that must move together

## Changing Task fields or persistence

Usually inspect/update:

- `src/domain/types.ts`
- `src/domain/task.ts`
- `src/domain/validation.ts`
- `src/storage/db.ts`
- `src/storage/repository.ts`
- `src/utils/export.ts`
- relevant UI strings/forms/components
- unit/property/repository/migration/E2E tests
- `docs/data-model.md`
- `docs/architecture.md`
- `CHANGELOG.md`

## Changing imports/exports

Inspect/update:

- `src/utils/export.ts`
- `src/domain/limits.ts`
- `src/domain/validation.ts`
- `src/domain/errors.ts`
- `src/i18n/en.ts` / `src/i18n/errors.ts`
- Settings/App import callbacks
- CSV/JSON/property/download tests
- browser backup/restore E2E
- `docs/data-model.md`
- `docs/user-guide.md`
- `docs/testing.md`

## Changing async task mutations

Inspect/update:

- `src/App.tsx`
- `src/utils/mutation.ts`
- `TaskComposer.tsx`
- `TaskItem.tsx`
- repository transaction behavior
- `tests/mutation.test.ts`
- `tests/AppMutation.test.tsx`
- component tests
- architecture/development docs.

## Changing PWA behavior

Inspect/update:

- `vite.config.ts`
- `src/components/PwaUpdatePrompt.tsx`
- `PwaUpdatePrompt.css`
- `src/main.tsx`
- `tests/pwa-config.test.ts`
- `tests/PwaUpdatePrompt.test.tsx`
- E2E/manual release verification
- `docs/architecture.md`
- `docs/user-guide.md`
- `docs/operations.md`
- `docs/release.md`

## Changing CSP/security configuration

Inspect/update:

- `index.html`
- `vite.config.ts`
- `tests/security-config.test.ts`
- `SECURITY.md`
- `PRIVACY.md` if data/network behavior changes
- `docs/architecture.md`
- `docs/development.md`
- `docs/operations.md`.

## Changing accessibility behavior

Inspect/update:

- affected component(s);
- `src/styles.css`;
- i18n labels;
- component tests;
- `e2e/accessibility.spec.ts` when browser semantics matter;
- `docs/accessibility.md`;
- `docs/user-guide.md`;
- manual release checklist.

## Changing repository quality/release tooling

Inspect/update:

- `package.json`
- relevant `scripts/*.mjs`
- `.github/workflows/*.yml`
- workflow/script tests;
- `docs/operations.md`
- `docs/testing.md`
- `docs/release.md`
- `CONTRIBUTING.md`
- `CHANGELOG.md` when behavior changes.

---

# 21. Generated/local paths intentionally not committed

The repository intentionally ignores or generates paths such as:

- `node_modules/`
- `dist/`
- `coverage/`
- `playwright-report/`
- `test-results/`
- local `.env` files
- logs
- OS metadata.

Do not document these as missing source files; they are build/test/local artifacts.

A future real `package-lock.json` is different: it is a required release input that must be generated by npm and committed before release.

---

# 22. Documentation authority order

When documents differ, use this interpretation:

1. executable source/config/tests define actual current behavior;
2. `docs/data-model.md` / `docs/architecture.md` / `docs/operations.md` explain implementation contracts;
3. `docs/user-guide.md` explains user-facing behavior;
4. `README.md` is the concise entry point;
5. `what_changed.md` records current continuation/release status;
6. archived handoffs/master prompt are historical context rather than newer implementation authority.

Documentation drift is a bug. If implementation changes invalidate this map, fix the docs in the same pull request.
