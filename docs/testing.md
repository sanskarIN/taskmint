# TaskMint Testing Guide

TaskMint uses multiple verification layers because no single suite can prove domain correctness, browser persistence, portability, accessibility, PWA behavior, repository documentation completeness, security hygiene, and release safety at once.

For an exhaustive current file-by-file test list see `test-matrix.md`.

## 1. Testing principles

- Put a regression close to the invariant it protects.
- Prefer deterministic time/data/random fixtures.
- Use real browser/IndexedDB tests where browser behavior matters.
- Treat imported/persisted data as untrusted in tests as well as production.
- Do not replace accessibility manual review with one automated smoke suite.
- Do not turn machine-specific benchmark timings into arbitrary CI thresholds.
- Treat repository documentation completeness as a checkable invariant, not an informal promise.
- A test file existing in the repository does not prove it passed for the current release SHA.

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

```bash
npm run test:e2e:install
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

### Additional dependency security gate

```bash
npm audit --audit-level=high
```

## 3. Shared test environment

`vite.config.ts` configures Vitest with:

```text
environment = jsdom
setupFiles = ./src/test/setup.ts
```

`src/test/setup.ts` cleans after each test:

- DOM;
- timers;
- mocks;
- stubbed globals;
- spies.

This prevents cross-test contamination.

## 4. Task/domain layer

### `tests/task.test.ts`

Covers:

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
- visible-slot reorder transformations;
- Today -> Overdue rollover;
- productivity statistics;
- future completion timestamp exclusion from the seven-day metric.

### `tests/datetime.test.ts`

Strict timestamp parsing, impossible calendar values, leap dates, timezone offsets, and canonical ISO compatibility.

### `tests/order.test.ts`

Safe allocation, large input, overflow rejection, deterministic `(order, id)` comparison, duplicate normalization, and reorderability after normalization.

### `tests/validation-order.test.ts`

Unsafe persisted order rejection and backup duplicate-order normalization.

### `tests/errors.test.ts`

Stable typed errors, structured details, malformed JSON wrapping, row-aware CSV failures, duplicate task-batch error contract, and safe fallback for unknown infrastructure errors.

## 5. Persistence layer

### `tests/repository.test.ts`

Covers:

- validated local task reads;
- malformed task rejection;
- default settings fallback;
- malformed settings rejection;
- invalid single-task/settings writes rejected before table access;
- complete batch validation before transaction open;
- duplicate task IDs before transaction open;
- explicit transaction wrapping;
- bulk failure propagation;
- empty-batch no-op;
- complete backup validation before destructive restore transaction/clear behavior.

## 6. JSON/CSV portability

### `tests/export.test.ts`

Broad backup/CSV round-trip, validation, formula-neutralization, legacy compatibility, BOM, quote/multiline, enum/date, structured-tag, and parser-stress coverage.

### `tests/csv-compat.test.ts`

Covers:

- literal unmarked legacy `json:` tag behavior;
- structured tags only under the marked encoding;
- malformed marked tags;
- unknown encoding version;
- original row numbers across blank records;
- contiguous caller-provided import orders;
- blank records excluded from task-count quota.

### `tests/csv-quoting.test.ts`

Strict quote placement and legal escaped quotes.

### `tests/csv-security.test.ts`

Spreadsheet formula-prefix neutralization after leading whitespace/control characters.

### `tests/property.test.ts`

Fixed-seed generated JSON/CSV round trips with parser-sensitive Unicode, quotes, commas, lines, pipes, brackets, and structured-tag-like text.

### `tests/download.test.ts`

Download click-before-revoke and deferred object URL cleanup.

## 7. Async interaction/concurrency

### `tests/TaskComposer.test.tsx`

Accessible submit, local duplicate-submit lock, pending state, external App lock, edit reset.

### `tests/TaskItem.test.tsx`

Per-row mutation serialization and external App-wide task lock.

### `tests/mutation.test.ts`

Exclusive gate competing-call behavior, optional safe busy error, action-failure cleanup, and busy-state-entry cleanup.

### `tests/AppMutation.test.tsx`

Two different task cards prove the App-wide gate prevents cross-row stale-snapshot writes and re-enables subsequent actions after completion.

### `tests/SettingsDialog.test.tsx`

Safe export failure UI, serialized Settings actions, no-dismiss pending state, immediate same-file import input reset, and stale error cleanup.

### `tests/Onboarding.test.tsx`

Duplicate completion suppression and safe persistence failure copy.

### `tests/PwaUpdatePrompt.test.tsx`

Duplicate service-worker activation suppression, busy state, safe failure, retry.

## 8. Navigation/filter accessibility components

### `tests/Sidebar.test.tsx`

Smart-view/project `aria-current`, exclusive current selection, project callback, and navigation landmark containment.

### `tests/Toolbar.test.tsx`

Named filter group, search shortcut metadata, and priority/tag/sort callback wiring.

## 9. Keyboard, reminders, diagnostics

### `tests/keyboard.test.ts`

Search/new-task shortcut resolution, modifiers, editable-target suppression, blocked contexts.

### `tests/notifications.test.ts`

Due delivery, constructor failure isolation, bounded title-bearing notifications, title-free excess summary, and retryability.

### `tests/logger.test.ts`

Arbitrary exception/user metadata redaction, stable TaskMint code handling, safe scalar/identifier retention, sensitive/unsafe/lookalike key handling.

## 10. Configuration and release scripts

### `tests/security-config.test.ts`

Protects restrictive production CSP and prevents dev WebSocket/inline-style allowances from leaking into production policy.

### `tests/pwa-config.test.ts`

Protects prompt-mode PWA update configuration, absence of `autoUpdate`, pinned runtime dependency, explicit update activation, and prompt integration.

### `tests/release-guard.test.ts`

Executes the dependency-free release guard in isolated fixtures and verifies exact tag/version + lockfile fail-closed behavior.

## 11. End-to-end browser suite

`playwright.config.ts` builds/previews production output at `127.0.0.1:4173`, runs Chromium/Desktop Chrome, uses CI retries, and traces first retry.

### `e2e/task-flow.spec.ts`

Create -> offline -> complete -> Completed view journey.

### `e2e/migration.spec.ts`

Real legacy IndexedDB schema -> current Dexie migration.

### `e2e/corrupt-local-data.spec.ts`

Malformed current storage -> fail-closed recovery without silent deletion.

### `e2e/keyboard.spec.ts`

Real focus behavior for `Ctrl/Cmd+K`, `N`, and editable-context protection.

### `e2e/backup-restore.spec.ts`

Real download/delete/file-restore journey.

### `e2e/pagination.spec.ts`

101 tasks -> 100 initial cards -> explicit final reveal.

### `e2e/accessibility.spec.ts`

Landmark/control-name/form-label/shortcut-metadata accessibility smoke coverage.

## 12. What E2E does not replace

Manual review remains required for:

- 200% zoom/reflow quality;
- real screen-reader experience;
- visible focus/theme contrast;
- physical touch targets;
- browser/OS notification variations;
- installed-PWA update UX across environments.

See `accessibility.md` and `release.md`.

## 13. Benchmark

`bench/task.bench.ts` exercises deterministic 10,000-task domain workloads with Vitest 4 `bench()`.

```bash
npm run bench
```

Benchmark output is diagnostic. See `performance.md`.

## 14. Dependency-free repository checks

These are executable quality gates even though they are not Vitest files.

### Formatting invariants

```bash
npm run format:check
```

Checks LF, final newline, and trailing whitespace across configured tracked text paths.

### Documentation links

```bash
npm run docs:check
```

Checks repository-relative Markdown targets and repository-bound paths. External URLs are intentionally not fetched.

### Documentation inventory

```bash
npm run docs:inventory
```

Runs `scripts/check-doc-inventory.mjs` against the real tracked file set from `git ls-files`.

It requires:

- every tracked path in `docs/file-index.md`;
- required subsystem sections in `docs/repository-reference.md`;
- every tracked test/E2E/benchmark/shared-test-setup path in `docs/test-matrix.md`.

This is the automated “no skipped files” documentation guard.

### Secret patterns

```bash
npm run secrets:check
```

Scans configured repository text for common credential/private-key shapes without intentionally printing the matched secret text.

### Release guard

```bash
npm run release:check -- vX.Y.Z
```

Checks exact tag/version and requires committed `package-lock.json`.

The first four checks are dependency-free Node/Git repository checks. The release guard is also dependency-free and intentionally fails before the real lockfile exists.

## 15. Combined `npm run check`

Current order:

1. format invariants;
2. documentation links;
3. documentation inventory;
4. secret patterns;
5. lint;
6. typecheck;
7. Vitest;
8. production build.

This intentionally does not hide audit/E2E inside the combined script; CI/release invoke those as explicit additional gates.

## 16. CI gates

Pull requests trigger:

- CI quality;
- E2E;
- CodeQL.

CI quality currently includes:

- format;
- docs links;
- docs inventory;
- secret patterns;
- lint;
- typecheck;
- Vitest;
- build;
- high-severity audit.

E2E installs Chromium and uploads failure reports.

CodeQL analyzes JavaScript/TypeScript.

See `operations.md` for exact triggers, permissions, timeouts, and install policy.

## 17. Lockfile transition behavior

Before a lockfile exists, CI/E2E may use:

```bash
npm install --ignore-scripts
```

After committed lockfile:

```bash
npm ci --ignore-scripts
```

Tagged Release always requires lockfile + `npm ci`.

## 18. Exact-SHA verification

A candidate is verified only when required jobs complete successfully for its exact SHA.

Not sufficient:

- queued;
- pending/in progress;
- cancelled;
- missing;
- successful older-head run;
- mergeability.

Every documentation commit changes the head and makes older results stale for release certification.

## 19. Test/documentation maintenance

When a test file is added/removed/renamed:

1. update `test-matrix.md`;
2. update `file-index.md`;
3. update this strategy if a testing layer changed;
4. ensure TypeScript includes the path;
5. keep shared cleanup in `src/test/setup.ts`;
6. update `repository-reference.md` if responsibilities changed;
7. run `docs:inventory`, `docs:check`, and `format:check`.
