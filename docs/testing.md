# TaskMint Testing Guide

TaskMint uses multiple testing layers because no single suite can prove domain correctness, browser persistence, portability, accessibility, PWA behavior, repository hygiene, and release safety at once.

For an exhaustive current file-by-file list see `test-matrix.md`.

## 1. Testing principles

- Put a regression close to the invariant it protects.
- Prefer deterministic time/data/random fixtures.
- Use real browser/IndexedDB tests where browser behavior matters.
- Treat imported/persisted data as untrusted in tests as well as production.
- Do not replace accessibility manual review with one automated smoke suite.
- Do not turn machine-specific benchmark timings into arbitrary CI thresholds.
- A test file existing in the repository does not prove it has passed for the current release SHA.

## 2. Commands

### Unit/component/property/config

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

### Browser E2E

First install Chromium and required system packages:

```bash
npm run test:e2e:install
```

Then:

```bash
npm run test:e2e
```

### Benchmark

```bash
npm run bench
```

### Full non-E2E quality suite

```bash
npm run check
```

### Additional release/security command

```bash
npm audit --audit-level=high
```

## 3. Shared test environment

`vite.config.ts` configures Vitest with:

```text
environment = jsdom
setupFiles = ./src/test/setup.ts
```

`src/test/setup.ts` performs shared cleanup after each test:

- DOM cleanup;
- restore real timers;
- clear mocks;
- un-stub globals;
- restore spies.

This prevents one test's browser/global state from contaminating later tests.

## 4. Task/domain layer

### `tests/task.test.ts`

Covers core task behavior including:

- input normalization;
- locale-independent canonical tags;
- field/tag limits;
- impossible dates;
- recurrence/month-end clamping;
- reminder-only recurrence;
- recurring next occurrence;
- explicit collision-free next-occurrence order;
- unsafe occurrence order rejection;
- smart views;
- manual visible-slot reorder transformations;
- Today -> Overdue rollover;
- productivity statistics;
- future completion timestamp exclusion from the seven-day metric.

### `tests/datetime.test.ts`

Covers strict timestamp parsing, impossible calendar values, leap dates, timezone offsets, and canonical ISO compatibility.

### `tests/order.test.ts`

Covers safe allocation, large input, overflow rejection, deterministic `(order, id)` comparison, duplicate order normalization, and reorderability after normalization.

### `tests/validation-order.test.ts`

Covers unsafe persisted order rejection and backup duplicate-order normalization.

### `tests/errors.test.ts`

Covers stable typed errors, structured details, malformed JSON wrapping, row-aware CSV failures, duplicate task-batch error contract, and safe UI fallback for unknown infrastructure errors.

## 5. Persistence layer

### `tests/repository.test.ts`

Covers repository trust/persistence boundaries:

- validated local task reads;
- malformed task rejection;
- default settings fallback;
- malformed settings rejection;
- invalid single-task write rejected before table access;
- invalid settings write rejected before table access;
- complete batch validation before transaction open;
- duplicate task IDs rejected before transaction open;
- explicit transaction wrapping for multi-task writes;
- bulk failure propagation;
- empty-batch no-op;
- full backup restore validation before destructive transaction/clear behavior.

This test uses a controlled database harness so the repository contract can be tested without making every case a browser E2E test.

## 6. JSON/CSV portability

### `tests/export.test.ts`

Broad portability suite covering:

- JSON backup round trips;
- invalid/unsupported backup rejection;
- duplicate backup IDs;
- invalid timestamps;
- field limits;
- CSV quote/multiline round trips;
- structured tag encoding;
- legacy pipe tag imports;
- formula-prefix neutralization/reversal;
- leading apostrophe behavior;
- UTF-8 BOM;
- invalid enums/dates;
- duplicate CSV columns;
- deterministic parser-stress values.

### `tests/csv-compat.test.ts`

Current compatibility/hardening coverage:

- unmarked legacy `json:` tag text stays literal;
- structured tags only decode under TaskMint marker;
- malformed structured marked tags fail;
- unknown non-empty encoding version fails;
- blank source records do not compact validation row numbers;
- caller-provided import orders remain contiguous across skipped blanks;
- blank logical records do not consume the task-count quota.

### `tests/csv-quoting.test.ts`

Rejects invalid quote placement and characters after a closed quoted field while preserving legal escaped quotes.

### `tests/csv-security.test.ts`

Protects spreadsheet formula neutralization even after leading whitespace/control characters.

### `tests/property.test.ts`

Uses fixed-seed deterministic generated values to exercise hundreds of parser-sensitive JSON/CSV round trips with Unicode, quotes, commas, line breaks, pipes, brackets, and structured-tag-like text.

### `tests/download.test.ts`

Verifies export click occurs before object URL cleanup and cleanup is deferred to the next timer turn.

## 7. Async interaction/concurrency

### `tests/TaskComposer.test.tsx`

Covers accessible submission, same-form duplicate submit suppression, pending disabled state, external App-wide lock, and edit reset.

### `tests/TaskItem.test.tsx`

Covers per-row mutation serialization and external App-wide locking of task actions/drag.

### `tests/mutation.test.ts`

Covers the reusable exclusive gate:

- competing action exclusion;
- optional safe busy error;
- cleanup after action failure;
- cleanup if entering busy UI state throws.

### `tests/AppMutation.test.tsx`

Integration-level concurrency regression involving two different task rows. It proves the application-wide lock—not merely one row's local state—prevents concurrent writes from stale task snapshots.

### `tests/SettingsDialog.test.tsx`

Covers:

- safe synchronous export failure UI;
- serialized Settings actions;
- pending busy/disabled/no-dismiss behavior;
- immediate import-input clearing while import promise remains pending;
- stale action-error cleanup after close/reopen.

### `tests/Onboarding.test.tsx`

Covers duplicate onboarding completion suppression and safe storage error UI.

### `tests/PwaUpdatePrompt.test.tsx`

Covers duplicate update activation suppression, pending UI state, safe failure, and retry.

## 8. Navigation/filter accessibility components

### `tests/Sidebar.test.tsx`

Covers:

- current smart view semantics;
- current project semantics;
- no simultaneous current smart view during project selection;
- project callback;
- project controls inside the navigation landmark.

### `tests/Toolbar.test.tsx`

Covers named filter group semantics, search shortcut metadata, and filter/sort callback wiring.

## 9. Keyboard, reminders, and diagnostics

### `tests/keyboard.test.ts`

Pure shortcut resolution:

- search/new-task bindings;
- modifier handling;
- editable target suppression;
- blocked/modal contexts.

### `tests/notifications.test.ts`

Reminder behavior:

- due notification delivery;
- constructor failure isolation;
- bounded individual title-bearing notifications;
- one title-free excess summary;
- failed summary/delivery retryability.

### `tests/logger.test.ts`

Development diagnostic privacy:

- arbitrary `Error.message` hidden;
- stable TaskMint code retained;
- safe scalar values retained;
- arbitrary strings/nested structures redacted;
- sensitive fields redacted;
- unsafe identifier strings redacted;
- lookalike words ending in `id` not treated as identifier fields;
- approved identifier key forms retain restricted safe values.

## 10. Configuration and release scripts

### `tests/security-config.test.ts`

Locks the production CSP boundary and rejects dev-only WebSocket/inline-style relaxations leaking into committed production policy.

### `tests/pwa-config.test.ts`

Checks prompt-mode PWA configuration, absence of `autoUpdate`, `workbox-window` dependency, explicit `updateServiceWorker(true)` flow, and update prompt integration.

### `tests/release-guard.test.ts`

Runs `scripts/check-release.mjs` against isolated temporary fixtures and checks exact tag/package version matching plus fail-closed missing-lockfile behavior.

## 11. End-to-end browser suite

Playwright is configured in `playwright.config.ts` to build and preview production output on `127.0.0.1:4173`, use Chromium/Desktop Chrome, run parallel tests, and collect traces on retry.

CI uses retries; local runs default to no retry.

### `e2e/task-flow.spec.ts`

Create task -> set browser context offline -> complete task -> verify Completed smart view.

### `e2e/migration.spec.ts`

Seeds actual legacy IndexedDB schema data and verifies Dexie v1->v2 migration.

### `e2e/corrupt-local-data.spec.ts`

Seeds malformed current storage and verifies fail-closed recovery without silent deletion/rewrite.

### `e2e/keyboard.spec.ts`

Browser focus behavior for `Ctrl/Cmd+K`, `N`, and editable-context protection.

### `e2e/backup-restore.spec.ts`

Real download/delete/restore file journey.

### `e2e/pagination.spec.ts`

Seeds 101 tasks and verifies 100 initial cards then explicit progressive reveal.

### `e2e/accessibility.spec.ts`

Smoke-checks landmarks, button names, form control labels, and keyboard shortcut metadata.

## 12. What E2E deliberately does not replace

Automated E2E is not sufficient proof for:

- 200% zoom/reflow quality;
- real screen-reader quality;
- visual focus clarity in every theme;
- all touch target behavior on physical devices;
- notification behavior across every browser/OS;
- installed-PWA update UX across all supported environments.

Those require manual release verification documented in `release.md`.

## 13. Benchmark

`bench/task.bench.ts` uses Vitest 4's top-level `bench()` API and runs 10,000-task domain scenarios.

Run:

```bash
npm run bench
```

Benchmark output is diagnostic because runner hardware/load vary. See `performance.md`.

## 14. Deterministic repository checks

### Formatting invariants

```bash
npm run format:check
```

Checks LF, final newline, trailing whitespace across configured tracked text paths.

### Documentation links

```bash
npm run docs:check
```

Validates repository-relative Markdown links under docs/GitHub/root documentation. External URLs are intentionally not fetched.

### Secret patterns

```bash
npm run secrets:check
```

Scans repository text for common credential/private-key shapes without intentionally printing the matched secret.

### Release guard

```bash
npm run release:check -- vX.Y.Z
```

Checks exact tag/version and requires committed `package-lock.json`.

The first three can run before npm dependencies are installed. The release guard is also dependency-free but intentionally fails until the real lockfile exists.

## 15. CI gates

Pull requests trigger:

- CI quality;
- E2E;
- CodeQL.

CI quality includes:

- format;
- docs links;
- secret patterns;
- lint;
- typecheck;
- Vitest;
- build;
- high-severity dependency audit.

E2E installs Chromium and uploads failure reports.

CodeQL analyzes JavaScript/TypeScript.

See `operations.md` for exact workflow triggers, permissions, timeouts, and install policy.

## 16. Lockfile transition behavior

Before a lockfile exists, CI/E2E can use:

```bash
npm install --ignore-scripts
```

Once `package-lock.json` is committed, they switch automatically to:

```bash
npm ci --ignore-scripts
```

Tagged Release never falls back to `npm install`; it requires the lockfile and `npm ci`.

## 17. Exact-SHA verification rule

A release candidate is verified only when required jobs complete successfully for the exact current SHA.

Not sufficient:

- queued;
- pending/in-progress;
- cancelled;
- absent;
- a successful older PR-head run;
- mergeability.

Every source/docs commit changes the PR head and makes prior check results stale for release certification.

## 18. Test maintenance

When a test file is added/removed/renamed:

1. update `test-matrix.md`;
2. update this guide if a testing layer/strategy changed;
3. ensure TypeScript includes the path;
4. keep global cleanup isolated in `src/test/setup.ts`;
5. update `repository-reference.md`;
6. run `docs:check` and `format:check`.
