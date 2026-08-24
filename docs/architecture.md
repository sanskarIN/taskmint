# TaskMint Architecture

TaskMint is a client-side modular monolith. Its primary product constraint is local-first, privacy-friendly task management without requiring an account or application backend.

This document explains the runtime boundaries and invariants. For exact persisted/imported shapes see `data-model.md`; for architectural rationale see `adr/`; for every repository file see `repository-reference.md`.

## 1. System context

At runtime the ordinary TaskMint data path is entirely inside the browser:

```text
User
  -> React UI
  -> domain rules
  -> repository
  -> Dexie
  -> IndexedDB
```

Optional browser/platform integrations are:

```text
Notification API
Service Worker / Cache Storage
File download / file selection
navigator.onLine
prefers-color-scheme
```

There is no required TaskMint application server, remote database, account service, analytics endpoint, or synchronization API in v0.1.

## 2. Entry/build shell

### `index.html`

The committed production HTML provides:

- metadata and root mount element;
- favicon/theme information;
- restrictive production Content Security Policy;
- module entry `/src/main.tsx`.

The production CSP keeps scripts/styles/connections tied to the application origin, blocks objects, and restricts base/form behavior.

### `vite.config.ts`

Vite owns build/dev behavior, React integration, Vitest configuration, and PWA generation.

Development mode injects only the relaxations required for Vite development behavior:

- inline style allowance for injected development styles;
- WebSocket connection allowance for HMR.

Those changes are applied by a plugin with `apply: 'serve'` and must not be copied into production `index.html`.

The same config sets:

- build target ES2022;
- source maps;
- CSS splitting;
- Vitest `jsdom` environment;
- shared test setup;
- PWA prompt-mode registration;
- manifest;
- Workbox precache/navigation fallback.

## 3. React bootstrap

### `src/main.tsx`

The browser entry mounts the React application and global styles. It composes application-level protection/integration such as the error boundary and PWA update experience around the main App tree.

### `src/components/ErrorBoundary.tsx`

Unexpected React rendering failures are separated from expected validation/persistence failures.

The error boundary provides a recovery/reload path without intentionally deleting or rewriting persisted task data.

## 4. Domain layer — `src/domain/`

The domain layer owns pure/business constraints that should not depend on React component timing.

### Types — `types.ts`

Canonical TypeScript shapes/unions for tasks, drafts, settings, filters, stats, backup, priorities, recurrence, status, theme, sort, and smart views.

### Limits — `limits.ts`

Central source for content/count/import limits. Interactive creation, persisted validation, JSON restore, CSV import, and UI affordances should share these constants.

### Strict date-time parsing — `datetime.ts`

Performs strict validation before JavaScript `Date` normalization can roll impossible calendar values into another date.

Due dates are local calendar dates. Reminder/lifecycle/export timestamps are instant-like strings canonicalized to ISO at validation boundaries.

### Typed errors — `errors.ts`

Owns stable `TaskMintError` codes, structured details, and safe default messages.

This lets validation/import code communicate known user-actionable failures without leaking arbitrary browser/IndexedDB parser/infrastructure messages.

### Manual ordering — `order.ts`

Owns:

- deterministic comparison by `(order, id)`;
- safe-integer allocation;
- overflow checks;
- duplicate-slot normalization.

All manual-order arithmetic belongs here. Do not reimplement order logic independently in components/import code.

### Task rules — `task.ts`

Owns:

- create/update normalization;
- complete/reopen/archive/restore transitions;
- recurrence;
- next occurrence generation;
- smart-view filtering;
- sorting;
- visible-slot reorder transformations;
- productivity stats;
- reminder-due predicate.

Time is supplied explicitly where practical so tests remain deterministic.

### Persisted/backup validation — `validation.ts`

Treats serialized data as untrusted.

Validates:

- backup envelope/version;
- complete task shapes;
- enum values;
- field limits;
- lifecycle timestamp invariants;
- strict dates/timestamps;
- unique IDs;
- settings;
- safe order integers.

Validated backups normalize duplicate safe order slots while preserving deterministic visible order.

## 5. Persistence layer — `src/storage/`

### Dexie database — `db.ts`

`TaskMintDatabase` wraps IndexedDB database `taskmint`.

Current tables:

- `tasks`;
- `settings`.

Schema v1 is retained as migration history. Schema v2 adds reminder/update/tag indexing and initializes fields introduced after v1.

See `data-model.md` for exact indexes/default migration fields.

### Repository boundary — `repository.ts`

`TaskRepository` is the application persistence facade. React components do not directly issue IndexedDB writes.

The repository implements both persistence and trust-boundary guarantees.

#### Reads

- all task rows are validated before entering the application;
- settings are validated before use;
- duplicate safe task-order slots are normalized in memory;
- malformed data rejects loading rather than returning an empty-looking replacement state.

#### Writes

- single task writes validate immediately before persistence;
- settings writes validate before persistence;
- complete task batches validate before transaction open;
- complete replacement arrays validate before current tasks are cleared;
- duplicate IDs in bulk batches are rejected;
- multi-task writes use explicit Dexie transactions.

#### Backup restore

The full backup is validated/normalized before the destructive clear/write transaction opens. This protects the current database even if a future runtime caller hands `restoreBackup` a malformed object without using the ordinary file parser first.

This design is captured in `adr/0003-validation-persistence-boundaries.md`.

## 6. Utilities — `src/utils/`

### Portability — `export.ts`

Owns JSON/CSV serialization/import and browser text downloads.

JSON is the full-fidelity TaskMint backup format.

CSV is versioned human-readable interchange:

- current marker `safe-text-v1`;
- reversible spreadsheet-formula neutralization;
- structured lossless JSON tag representation;
- legacy unmarked pipe-tag compatibility;
- strict quoting;
- strict enum/task validation;
- BOM handling;
- true source record numbers across blank records;
- task-count limit applied to nonblank records;
- caller-provided collision-free import order base.

Versioning rationale is recorded in `adr/0005-versioned-data-portability.md`.

### Keyboard — `keyboard.ts`

Pure shortcut resolver plus editable-target detection.

Separating shortcut eligibility from React event side effects makes modifier/editable/modal rules unit-testable.

### Notifications — `notifications.ts`

Optional local browser reminder delivery.

One polling pass is bounded:

- a small fixed number of title-bearing individual notifications;
- one title-free count summary for additional due tasks.

Failed delivery remains retryable by not permanently suppressing undelivered IDs.

### Logging — `logger.ts`

Development diagnostics are privacy-constrained.

`logError` emits only coarse error kind or stable TaskMint error code—not arbitrary raw exception messages.

`logEvent` is fail-closed:

- `null`, booleans, and numbers may be retained;
- strings are retained only for narrowly recognized identifier-key forms and restricted identifier characters;
- arbitrary strings, objects, arrays, sensitive-key fields, unsafe IDs, and lookalike ordinary `...id` keys are redacted.

### Exclusive mutations — `mutation.ts`

Reusable synchronous lock + async busy-state wrapper.

It prevents competing persistence operations from entering while another protected action is pending and releases the lock in `finally`, including failure paths.

Rationale: `adr/0004-exclusive-task-mutations.md`.

## 7. Localization — `src/i18n/`

### `en.ts`

Externalized English visible product copy, dynamic labels, status messages, onboarding/settings strings, navigation names, reminder/import/export copy, and support/about labels.

English is the only shipped locale in v0.1, but components consume a catalog rather than duplicating user-facing strings throughout source.

### `errors.ts`

UI error formatting boundary:

- known `TaskMintError` -> safe typed message;
- unknown error -> caller-provided safe fallback.

This prevents raw infrastructure messages from becoming user-facing content accidentally.

## 8. Presentation components — `src/components/`

### TaskComposer

Controlled create/edit form with local synchronous submit serialization and an external App-wide disabled state.

### TaskItem

Task card/action layer with per-row synchronous mutation serialization plus external App-wide disabling.

### Sidebar

Smart-view/project navigation, including `aria-current` semantics and navigation landmark containment.

### Toolbar

Search/filter/sort controls exposed as a named group.

### StatsPanel

Pure presentation for domain-derived productivity statistics.

### SettingsDialog

Focus-contained settings/data modal with serialized actions and no-dismiss-during-action behavior. File selections are cleared after the `File` object is captured and before asynchronous import processing, making same-file retry reliable.

### Onboarding

First-run dialog with serialized completion persistence and safe failure UI.

### PwaUpdatePrompt

Waiting-service-worker prompt. Update activation is explicit and serialized rather than automatic.

## 9. App orchestration — `src/App.tsx`

`App.tsx` is the use-case coordinator between presentation, domain, repository, and browser utilities.

It owns:

- startup loading/failure state;
- tasks/settings/filter/edit state;
- theme/reduced-motion resolution;
- online/offline status;
- periodic/focus/visibility current-time refresh;
- reminder polling;
- global shortcuts;
- toast actions;
- statistics/derived task sets;
- progressive rendering;
- task mutation workflows;
- settings/import/export/delete callbacks.

### Persistence-first UI rule

Task create/edit/lifecycle/reorder/delete operations persist before updating corresponding React state.

If persistence fails, the visible state should not claim the write succeeded.

### App-wide task mutation serialization

Local component locks cannot prevent two different rendered task cards from racing calculations from one stale `tasks` snapshot.

`App.tsx` therefore owns an App-wide synchronous lock via `runExclusiveMutation(...)`.

It covers:

- create/edit;
- complete/reopen;
- archive/restore;
- delete/Undo;
- keyboard reorder;
- drag/drop reorder.

While pending:

- task composer is disabled;
- rendered task rows are disabled;
- task list exposes busy state;
- Settings cannot open;
- global task/search shortcuts are blocked;
- competing Undo cannot enter.

This favors correctness over parallel human-triggered local writes.

### Recurrence ordering

When completing a recurring task, App supplies `nextTaskOrder(tasks)` to the domain so the new occurrence gets a collision-free manual order rather than relying on current-clock milliseconds.

### CSV append ordering

When importing CSV, App supplies `nextTaskOrder(tasks)` as the first import order. Nonblank imported records receive contiguous order values after existing tasks.

## 10. Runtime data flow

### Ordinary task mutation

```text
User action
  -> component local lock / App-wide gate
  -> domain validates/transforms
  -> repository validates again at persistence boundary
  -> IndexedDB transaction/write
  -> success
  -> React state update
  -> toast/log safe diagnostic
```

If persistence fails, the flow stops before corresponding React success-state mutation.

### Startup

```text
App mount
  -> repository.listTasks + getSettings
  -> validate persisted rows
  -> normalize duplicate safe order slots
  -> success -> populate React state
  -> failure -> fail-closed recovery UI
```

### JSON restore

```text
File selection
  -> read size-bounded text
  -> parse JSON
  -> validate backup envelope/tasks/settings
  -> user replacement confirmation when needed
  -> repository validates again
  -> transactional clear/write
  -> React state replacement
```

### CSV import

```text
File selection
  -> read size-bounded text
  -> parse strict CSV
  -> validate header/encoding/rows
  -> normalize task data
  -> rebase order after existing max
  -> repository validates full batch
  -> transactional bulk write
  -> append React state
```

## 11. Progressive rendering

Task filtering/sorting operates on the validated in-memory task set, but UI mounting is bounded.

Only the first configured page (currently 100 matching tasks) mounts initially. Users explicitly reveal subsequent pages.

Changing filters/search/sort resets the rendering limit.

This reduces unnecessary React card work without changing the filtered task count or domain query semantics.

## 12. Offline model

Task content persists in IndexedDB and ordinary operations require no network.

The generated PWA service worker precaches build assets. After those assets are available, the application shell is designed to reload offline.

The web/PWA build is the primary distribution target.

## 13. PWA update model

TaskMint uses:

```text
registerType = prompt
```

New workers wait rather than automatically reloading the page.

User chooses Update now -> `updateServiceWorker(true)` activates the waiting worker.

This protects unsaved task composer content from surprise automatic reloads.

Update activation itself has a synchronous lock to prevent duplicate calls.

## 14. Reminder model and limitation

TaskMint uses local browser notifications only after explicit permission request.

The browser does not provide a reliable portable background scheduler for a closed PWA, so reminder checks occur while TaskMint is open.

This is an explicit platform limitation, not a hidden background service.

## 15. Security model

Layers include:

- no required backend/account/secret;
- restrictive production CSP;
- dev-only CSP relaxation separated from build output;
- strict serialized-data validation;
- spreadsheet-formula neutralization;
- strict CSV quoting/version checks;
- safe error boundaries;
- privacy-restricted development diagnostics;
- dependency audit/CodeQL;
- dependency-free secret-pattern guard;
- exact-tag/lockfile release guard.

Security policy: `../SECURITY.md`.

## 16. Failure classes

### Validation failure

Known typed TaskMint error -> safe user message.

### Persistence failure during a user action

Raw failure is logged only through privacy-safe diagnostics; UI gets safe product fallback; React success state is not applied.

### Corrupt/unreadable startup data

Normal editor is blocked. Stored records are not silently removed/repaired.

### Unexpected React failure

ErrorBoundary provides reload path.

### Service-worker update failure

Update prompt shows safe retryable error. Task data is not intentionally altered.

## 17. Testing architecture

Tests mirror boundaries:

- pure domain/unit tests;
- parser/property/security tests;
- component tests;
- App-level cross-component concurrency test;
- repository harness tests;
- config/release-script tests;
- real browser E2E for IndexedDB, migration, corruption, offline, backup restore, keyboard, accessibility, pagination.

See `testing.md` and exhaustive `test-matrix.md`.

## 18. Architecture decision records

Current ADRs:

- `adr/0001-local-first-pwa.md`
- `adr/0002-dexie-repository.md`
- `adr/0003-validation-persistence-boundaries.md`
- `adr/0004-exclusive-task-mutations.md`
- `adr/0005-versioned-data-portability.md`

Add an ADR before introducing a significant competing architecture such as required cloud accounts/sync, a desktop-native wrapper that changes the primary data model, a new persistence technology, or incompatible portability semantics.
