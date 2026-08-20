# TaskMint Test and Benchmark Matrix

This document maps every current automated test/E2E/benchmark support file to the behavior it protects. It complements `testing.md`, which explains the testing strategy and commands.

If a test file is added, renamed, or removed, update this matrix in the same change.

## 1. Shared test infrastructure

### `src/test/setup.ts`

Global Vitest/Testing Library cleanup.

Responsibilities:

- Testing Library DOM cleanup after each test;
- restore real timers;
- clear mock histories;
- un-stub globals;
- restore spies.

Purpose: prevent one test's DOM/timer/global/mock state from leaking into another test.

## 2. Application/component regression tests

### `tests/AppMutation.test.tsx`

Protects the application-wide task persistence exclusion rule.

Key behavior:

- seeds multiple tasks through a mocked repository;
- holds one task write pending;
- attempts a mutation on a different task row;
- verifies only the first persistence call enters;
- verifies global task UI such as Settings is blocked while pending;
- verifies the second row becomes usable after the first mutation completes.

Primary implementation:

- `src/App.tsx`
- `src/utils/mutation.ts`
- `src/components/TaskItem.tsx`
- `src/components/TaskComposer.tsx`

### `tests/Onboarding.test.tsx`

Protects onboarding persistence behavior.

Covers:

- repeated Start activation cannot schedule duplicate completion writes;
- busy/disabled state while persistence is pending;
- raw storage failure details are not exposed to the user.

Primary implementation:

- `src/components/Onboarding.tsx`

### `tests/PwaUpdatePrompt.test.tsx`

Protects explicit PWA waiting-worker activation.

Covers:

- Update now calls the service-worker updater once while pending;
- update/later controls are blocked during activation;
- the prompt exposes busy state;
- update failure uses safe UI copy;
- retry remains available after failure.

Primary implementation:

- `src/components/PwaUpdatePrompt.tsx`
- `vite.config.ts`

### `tests/SettingsDialog.test.tsx`

Protects Settings action safety and retryability.

Covers:

- synchronous browser export exceptions are contained behind safe product copy;
- Settings operations are serialized;
- dialog exposes pending busy state;
- close/Escape competing action behavior is blocked while pending;
- selected JSON import input value is cleared before asynchronous import settles so the same file can be selected again;
- stale Settings action errors disappear after close/reopen.

Primary implementation:

- `src/components/SettingsDialog.tsx`

### `tests/Sidebar.test.tsx`

Protects navigation semantics.

Covers:

- active smart view uses `aria-current="page"`;
- active project uses `aria-current="page"`;
- smart view is not simultaneously current when a project is active;
- project selection callback behavior;
- project and smart-view selectors remain inside the navigation landmark.

Primary implementation:

- `src/components/Sidebar.tsx`

### `tests/TaskComposer.test.tsx`

Protects task form behavior.

Covers:

- accessible ordinary task submission;
- duplicate form submit suppression while save is pending;
- submit controls disable/re-enable around async persistence;
- external App-wide task mutation lock;
- stale edit values are cleared after a successful edit.

Primary implementation:

- `src/components/TaskComposer.tsx`

### `tests/TaskItem.test.tsx`

Protects per-task-row mutation safety.

Covers:

- duplicate mutation suppression while one action is pending;
- row-level `aria-busy` and control disabled state;
- external App-wide mutation lock across row actions;
- drag/drop/action callbacks cannot enter when externally locked.

Primary implementation:

- `src/components/TaskItem.tsx`

### `tests/Toolbar.test.tsx`

Protects filter/search accessibility and callback wiring.

Covers:

- search/filter controls are exposed as a named accessibility group;
- searchbox retains global shortcut metadata;
- priority/tag/sort selection calls the expected callbacks.

Primary implementation:

- `src/components/Toolbar.tsx`

## 3. Task/domain tests

### `tests/task.test.ts`

Core task-domain regression suite.

Covers:

- task input normalization;
- locale-independent stored tag normalization;
- monthly recurrence month-end clamping;
- recurring next-occurrence generation;
- explicit collision-free recurring order allocation;
- unsafe recurring order rejection;
- impossible calendar date rejection;
- task field/tag count and length limits;
- recurring reminders without due dates;
- visible-slot reorder behavior;
- Today -> Overdue date rollover;
- future completion timestamp exclusion from last-seven-days statistics;
- smart-view filtering and productivity statistics.

Primary implementation:

- `src/domain/task.ts`
- `src/domain/limits.ts`

### `tests/datetime.test.ts`

Protects strict date-time parsing.

Covers strict timestamp/date semantics such as:

- malformed timestamp rejection;
- impossible calendar dates;
- valid leap-day behavior;
- timezone-offset inputs;
- canonical TaskMint ISO timestamps.

Primary implementation:

- `src/domain/datetime.ts`

### `tests/order.test.ts`

Protects manual-order invariants.

Covers:

- first/default/custom-step allocation;
- large-list allocation without argument-spread hazards;
- safe-integer overflow rejection;
- deterministic `(order, id)` comparison;
- duplicate order normalization;
- preservation of deterministic visible order;
- reorderability after normalization.

Primary implementation:

- `src/domain/order.ts`

### `tests/validation-order.test.ts`

Protects persisted/backup order validation.

Covers:

- unsafe persisted order rejection;
- normalization of duplicate safe order slots during backup validation.

Primary implementation:

- `src/domain/validation.ts`
- `src/domain/order.ts`

### `tests/errors.test.ts`

Protects typed user-safe error contracts.

Covers:

- stable TaskMint validation codes;
- duplicate task-batch ID error code/details;
- malformed JSON wrapped as safe backup error;
- row-aware CSV errors;
- frozen structured error details;
- known validation error display vs unknown infrastructure-message hiding.

Primary implementation:

- `src/domain/errors.ts`
- `src/i18n/errors.ts`

## 4. Persistence tests

### `tests/repository.test.ts`

Protects the Dexie repository boundary through a controlled database harness.

Covers:

- validated local task reads;
- malformed persisted task rejection;
- default settings when settings row is missing;
- malformed stored settings rejection;
- invalid single-task write rejected before table write;
- invalid settings write rejected before table write;
- restore backup completely validated before destructive transaction opens;
- explicit transaction for multi-task writes;
- complete batch validation before transaction open;
- duplicate task IDs rejected before transaction open;
- bulk failure propagation;
- no transaction for an empty batch.

Primary implementation:

- `src/storage/repository.ts`
- `src/domain/validation.ts`

## 5. Data portability tests

### `tests/export.test.ts`

Broad JSON/CSV portability regression suite.

Covers areas including:

- JSON backup serialize/parse round trips;
- unsupported/malformed backup rejection;
- duplicate backup task IDs;
- malformed timestamps;
- oversized fields;
- CSV multiline/quote behavior;
- structured tag round trips;
- legacy pipe-separated tag compatibility;
- spreadsheet-formula neutralization/reversal;
- leading apostrophe handling;
- deterministic parser-sensitive stress data;
- UTF-8 BOM header handling;
- invalid enums/dates;
- duplicate CSV columns.

Primary implementation:

- `src/utils/export.ts`
- `src/domain/validation.ts`

### `tests/csv-compat.test.ts`

Protects CSV version/legacy compatibility and newer RC7 record behavior.

Covers:

- legacy unmarked `json:` tag text remains ordinary tag text;
- structured tags only decode under the TaskMint encoding marker;
- malformed marked structured tags fail;
- unknown non-empty encoding versions fail;
- original CSV row number remains correct after skipped blank records;
- caller-provided import orders remain contiguous across blank records;
- blank logical records do not count toward the task-count quota.

Primary implementation:

- `src/utils/export.ts`

### `tests/csv-quoting.test.ts`

Protects strict CSV quoting syntax.

Covers invalid quote placement while preserving valid escaped quote parsing.

Primary implementation:

- `src/utils/export.ts`

### `tests/csv-security.test.ts`

Protects spreadsheet-formula neutralization for user-controlled text, including formula-like text following leading whitespace/control characters.

Primary implementation:

- `src/utils/export.ts`

### `tests/property.test.ts`

Seeded deterministic property-style portability coverage.

Generates parser-sensitive strings containing combinations such as:

- commas;
- quotes;
- CR/LF;
- Unicode;
- pipes;
- brackets;
- structured tag-like text.

It exercises many JSON/CSV round trips while remaining reproducible through fixed seeds.

Primary implementation:

- `src/utils/export.ts`
- `src/domain/task.ts`

### `tests/download.test.ts`

Protects browser export download lifecycle.

Covers:

- anchor click occurs before object URL revocation;
- revocation is deferred to a later timer turn.

Primary implementation:

- `src/utils/export.ts`
- `src/platform/files.ts`

## 6. Keyboard, notification, logging, and utility tests

### `tests/keyboard.test.ts`

Protects pure global shortcut resolution.

Covers:

- search shortcut;
- new-task shortcut;
- supported modifier combinations;
- editable target suppression;
- modal/blocked context suppression.

Primary implementation:

- `src/utils/keyboard.ts`

### `tests/notifications.test.ts`

Protects reminder delivery privacy and boundedness.

Covers:

- one-time due notification behavior;
- individual Notification constructor failure isolation;
- bounded title-bearing notification count;
- one title-free summary for excess due reminders;
- retryability when notification delivery fails.

Primary implementation:

- `src/utils/notifications.ts`
- `src/platform/runtime.ts`

### `tests/logger.test.ts`

Protects diagnostic privacy.

Covers:

- arbitrary `Error.message` is not logged;
- TaskMint errors log only stable code/kind information;
- safe scalar diagnostics survive;
- arbitrary strings/nested data are redacted;
- sensitive fields are redacted;
- unsafe identifier values are redacted;
- ordinary words ending with `id`, such as lookalikes, are not misclassified as identifier keys;
- explicit identifier key forms can retain restricted safe identifier values.

Primary implementation:

- `src/utils/logger.ts`

### `tests/mutation.test.ts`

Protects reusable exclusive mutation gate semantics.

Covers:

- competing work cannot enter a second action;
- optional safe busy error;
- lock release after action failure;
- lock release even when entering busy UI state throws.

Primary implementation:

- `src/utils/mutation.ts`

## 7. Configuration/release tests

### `tests/security-config.test.ts`

Protects the committed production CSP boundary.

Covers prevention of dev-only inline-style/WebSocket allowances leaking into production HTML policy.

Primary implementation/configuration:

- `index.html`
- `vite.config.ts`

### `tests/pwa-config.test.ts`

Protects PWA update configuration.

Covers:

- prompt-mode registration;
- absence of `autoUpdate`;
- expected `workbox-window` dependency;
- explicit update activation path;
- mounting/integration of the update prompt.

Primary implementation/configuration:

- `vite.config.ts`
- `src/main.tsx`
- `src/components/PwaUpdatePrompt.tsx`
- `package.json`

### `tests/native-config.test.ts`

Protects the committed Tauri/native configuration and native-boundary integration.

Covers:

- expected Tauri application identifier and secure window configuration;
- desktop/mobile capability files and least-privilege plugin permissions;
- expected native build scripts and dependencies;
- native-aware PWA/update and platform adapter wiring;
- native CI presence for desktop, Android, and iOS targets.

Primary implementation/configuration:

- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/desktop.json`
- `src-tauri/capabilities/mobile.json`
- `src/platform/`
- `.github/workflows/native.yml`
- `package.json`

### `tests/release-guard.test.ts`

Executes the dependency-free release guard against isolated temporary fixtures.

Covers:

- exact `v<package version>` matching;
- missing lockfile fails closed;
- expected successful readiness conditions.

Primary implementation:

- `scripts/check-release.mjs`

## 8. Browser end-to-end tests

### `e2e/task-flow.spec.ts`

Primary task journey.

Covers creating a task, switching the browser context offline, completing the task, and verifying Completed view behavior.

### `e2e/migration.spec.ts`

Real IndexedDB migration coverage.

Seeds a legacy v1/native IndexedDB database and verifies current TaskMint/Dexie migrates the data correctly.

Primary implementation:

- `src/storage/db.ts`

### `e2e/corrupt-local-data.spec.ts`

Fail-closed local storage recovery coverage.

Seeds malformed current-schema data and verifies:

- normal editor is blocked;
- malformed stored records remain untouched;
- only recovery/reload behavior is exposed.

Primary implementation:

- `src/App.tsx`
- `src/storage/repository.ts`
- `src/domain/validation.ts`

### `e2e/keyboard.spec.ts`

Browser keyboard journey.

Covers:

- `Ctrl+K` search focus;
- `N` new-task focus;
- typing/editable-context protection.

### `e2e/backup-restore.spec.ts`

Real browser backup lifecycle.

Covers:

1. create local task;
2. download JSON backup;
3. delete local data;
4. restore through the actual file input;
5. verify task returns.

### `e2e/pagination.spec.ts`

Large-list progressive rendering.

Seeds 101 tasks and verifies:

- first 100 task cards render;
- the remaining task is progressively revealed through the load-more interaction.

### `e2e/accessibility.spec.ts`

Browser accessibility smoke coverage.

Checks areas such as:

- core landmarks;
- unnamed button avoidance;
- form control labels/names;
- shortcut metadata on search/new-task inputs.

It complements—not replaces—manual keyboard, zoom/reflow, contrast/theme, and assistive-technology review.

## 9. Benchmark

### `bench/task.bench.ts`

Non-gating Vitest 4 benchmark suite.

Exercises domain work on 10,000-task datasets, including filtering/sorting and productivity statistics.

Run:

```bash
npm run bench
```

Timing is diagnostic. Do not turn a one-machine timing into a repository-wide pass/fail threshold without controlled measurement and documented rationale.

## 10. Playwright configuration

### `playwright.config.ts`

Defines browser E2E runner configuration, base URL/server behavior, test directory, and reporter/runtime options used by `npm run test:e2e`.

See `operations.md` for the hosted E2E workflow.

## 11. Vitest/Vite test configuration

### `vite.config.ts`

The Vite/Vitest config sets:

- test environment: `jsdom`;
- setup file: `./src/test/setup.ts`.

The same file also defines build/PWA/native-development behavior protected by configuration tests.

## 12. Test execution layers

### Dependency-free repository checks

```bash
npm run format:check
npm run docs:check
npm run docs:inventory
npm run secrets:check
```

### Unit/component/property/config tests

```bash
npm test
```

### Type/lint/build

```bash
npm run lint
npm run typecheck
npm run build
npm run native:check
```

### Combined non-E2E quality suite

```bash
npm run check
```

### Browser E2E

```bash
npm run test:e2e:install
npm run test:e2e
```

### Native hosted builds

`.github/workflows/native.yml` validates desktop checks on Linux, Windows, and macOS, an Android ARM64 debug build, and an iOS simulator debug build.

### Dependency security

```bash
npm audit --audit-level=high
```

### Diagnostic benchmark

```bash
npm run bench
```

## 13. Coverage expectations for future changes

When changing:

- **domain rules** — add/update deterministic unit tests;
- **persistence** — add repository tests and browser migration/recovery coverage when schema behavior changes;
- **CSV/JSON** — add regression + property/compatibility tests;
- **React interactions** — use Testing Library and preserve accessibility semantics;
- **cross-component async behavior** — add App/integration regression rather than relying only on isolated components;
- **keyboard/accessibility journeys** — add component/unit coverage and Playwright where browser focus behavior matters;
- **PWA/update behavior** — add configuration/component/browser verification as appropriate;
- **native/platform boundaries** — add config/unit coverage plus a real native CI build on affected targets;
- **release/maintenance scripts** — execute scripts in isolated fixtures where practical;
- **security/privacy controls** — add explicit regressions that fail if the protection is removed.

Bug fixes should normally include a regression that would have failed before the fix.

## 14. Verification honesty

The existence of this test suite is not the same as a passing test run.

Release evidence must record actual successful conclusions for the exact source SHA being released. A queued, pending, cancelled, missing, or stale workflow does not count as a pass.
