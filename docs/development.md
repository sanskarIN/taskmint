# TaskMint Development Guide

This guide defines day-to-day implementation rules for TaskMint contributors. For runtime architecture see `architecture.md`; for exact data contracts see `data-model.md`; for every file see `repository-reference.md`; for CI/release operations see `operations.md`.

## 1. Requirements

- Node.js 22.12 or newer
- npm
- modern browser
- Chromium/Playwright dependencies when running browser E2E

TaskMint currently requires no backend server, remote database, API key, or secret configuration.

## 2. Important commands

- `npm run dev` — Vite development server
- `npm run build` — TypeScript project build + Vite production bundle
- `npm run preview` — preview built production output
- `npm run format` — Prettier write mode
- `npm run format:check` — deterministic LF/final-newline/trailing-whitespace guard
- `npm run docs:check` — repository-relative Markdown link verification
- `npm run secrets:check` — common committed-secret pattern guard
- `npm run lint` — strict type-aware ESLint, zero warnings
- `npm run typecheck` — TypeScript project checks including tests/E2E/bench
- `npm test` — Vitest unit/component/property/config tests
- `npm run test:watch` — Vitest watch mode
- `npm run bench` — non-gating 10,000-task Vitest benchmark
- `npm run test:e2e:install` — install Playwright Chromium + OS dependencies
- `npm run test:e2e` — Playwright Chromium journeys against production build/preview
- `npm run release:check -- vX.Y.Z` — exact tag/version + committed-lockfile readiness guard
- `npm run check` — format/docs/secrets/lint/type/test/build combined suite

Dependency audit remains explicit:

```bash
npm audit --audit-level=high
```

## 3. Where code belongs

### Domain rules

Put task semantics in `src/domain/` rather than React handlers when the behavior can be expressed independently of UI state.

Examples:

- normalization;
- lifecycle transitions;
- recurrence;
- filtering/sorting;
- statistics;
- strict date-time parsing;
- persisted validation;
- manual-order arithmetic;
- stable typed errors;
- shared limits.

### Persistence

Route application writes through `TaskRepository`.

Do not let React components call raw IndexedDB/Dexie tables directly.

### UI orchestration

`App.tsx` coordinates use cases, derived state, persistence ordering, global effects, import/export wiring, reminders, and cross-component mutation exclusion.

### Presentation components

Components should render accessible controls, capture user input, expose callbacks, and own local interaction state. Avoid moving storage schema/transaction rules into components.

### Utilities

Use `src/utils/` for cross-cutting browser/application helpers that are not domain entities, including data portability, keyboard resolution, notifications, safe diagnostics, and mutation gating.

### Product strings

Put visible user-facing copy in `src/i18n/en.ts` rather than scattering independent text constants through components.

## 4. TypeScript rules

The app/test TypeScript project is strict and covers:

- `src`
- `tests`
- `e2e`
- `bench`

Important compiler constraints include:

- `strict`;
- `noUncheckedIndexedAccess`;
- `noFallthroughCasesInSwitch`;
- `noImplicitOverride`;
- no emit;
- bundler module resolution.

Do not weaken the compiler project merely to make a new implementation easier. Prefer correcting types/data boundaries.

## 5. ESLint rules

Type-aware ESLint is part of CI.

Important repository rules include:

- no floating promises;
- no explicit `any`;
- interface-style object type definitions;
- promise misuse checks.

When intentionally ignoring a promise from an event callback, use a clear `void` expression where appropriate rather than leaving an unhandled promise accidentally.

## 6. Validation rules

### Never trust serialization boundaries

Treat these as untrusted:

- JSON files;
- CSV files;
- IndexedDB rows;
- objects handed directly to persistence methods from future JavaScript callers.

Validation occurs in multiple layers intentionally; do not remove repository validation simply because the UI already validates.

### Strict calendar/time handling

Keep strict timestamp parsing in `src/domain/datetime.ts`.

Do not use permissive JavaScript `Date` normalization as a validity test for user/imported dates.

### Shared limits

Keep content/import limits in `src/domain/limits.ts`.

Do not duplicate values such as title length, tag count, or import size in independent modules.

## 7. Persistence rules

- React success state changes only after corresponding storage success.
- Multi-task writes remain inside explicit read-write transactions.
- Complete batches are validated before transaction open.
- Replacement arrays are validated before clearing current tasks.
- Duplicate task IDs in a bulk persistence batch are rejected.
- Full backup restore validates/normalizes before opening the destructive transaction.
- Startup validation failure is fail-closed and non-destructive.
- Do not automatically delete/repair corrupt persisted records during failed startup.

If explicit recovery tooling is added later, it should be user-controlled and separately tested.

## 8. Task mutation concurrency rules

TaskMint deliberately serializes persistence-sensitive task writes.

### Local component protection

`TaskComposer` and `TaskItem` use synchronous ref locks because React disabled-state rendering alone does not close the same-tick duplicate-event gap.

### App-wide protection

New task persistence entry points must be evaluated for the application-wide gate in `src/utils/mutation.ts` / `App.tsx`.

Current protected task mutations include:

- create/edit;
- complete/reopen;
- archive/restore;
- delete/Undo;
- keyboard reorder;
- drag/drop reorder.

Do not add a new task-writing callback that bypasses the gate without a deliberate design reason and regression coverage.

The design rationale is recorded in `adr/0004-exclusive-task-mutations.md`.

## 9. Manual-order rules

All comparison/allocation/normalization belongs in `src/domain/order.ts`.

Invariants:

- safe integers only;
- deterministic ID tie-breaker;
- overflow detection;
- duplicate persisted slots normalized deterministically;
- new occurrences/imports use collision-free allocation.

Do not use `Date.now()` as the sole assumption that a new order value is unique against arbitrary persisted/imported tasks.

## 10. Recurrence rules

Recurring completion returns:

- a completed current occurrence;
- optionally a new active next occurrence.

When App completes a recurring task, supply a collision-free `nextTaskOrder(tasks)` value.

Monthly recurrence must keep month-end clamping behavior.

Reminder movement rules must remain covered for both due-date-based and reminder-only recurrence.

## 11. Data portability rules

### JSON

JSON is the full-fidelity backup format.

- current schema is explicitly versioned;
- unknown schema versions fail closed;
- complete backup validation occurs before replacement persistence;
- JSON should preserve lifecycle timestamps/settings that CSV intentionally does not.

### CSV

CSV is human-readable interchange.

Current marked encoding:

```text
safe-text-v1
```

Rules:

- preserve required columns;
- keep structured `json:` tag array under marked encoding;
- accept legacy unmarked pipe tags;
- never parse an unmarked legacy `json:` prefix as structured tags;
- reject unknown non-empty TaskMint encoding versions;
- preserve reversible spreadsheet-formula neutralization for marked rows;
- reject invalid quoting rather than silently repair;
- keep original source row numbers when blank records are skipped;
- count only nonblank records toward task-count quota;
- retain independent total input-size cap;
- caller must rebase append imports after existing manual-order maximum.

Changing `safe-text-v1` semantics incompatibly requires a new encoding version, not silent reinterpretation.

See `adr/0005-versioned-data-portability.md`.

## 12. Import file input rules

Settings clears a selected file-input value immediately after capturing the `File` object and before asynchronous import processing.

Do not move that reset to after `await` without considering same-file retry behavior.

File content/metadata remains available through the captured `File` object.

## 13. PWA update rules

- Keep `vite-plugin-pwa` in `registerType: 'prompt'` while TaskMint can contain unsaved form input.
- Do not switch to `autoUpdate` without a tested durable draft persistence/restore design.
- Update now must activate the waiting worker through `updateServiceWorker(true)`.
- Update activation is serialized.
- Update failure uses safe copy and must not intentionally alter local task data.
- Keep `workbox-window` explicitly pinned while required by the React PWA integration.

## 14. CSP rules

The restrictive production CSP belongs in `index.html`.

Vite development relaxations are injected only by the serve-mode transform in `vite.config.ts`.

Do not weaken production policy to solve a development-HMR problem.

`tests/security-config.test.ts` exists to catch this drift.

## 15. Keyboard rules

Global shortcut eligibility belongs in `src/utils/keyboard.ts`.

New shortcuts should consider:

- editable targets;
- modifiers;
- onboarding/modal state;
- pending task mutation state;
- active edit context;
- accessible `aria-keyshortcuts` metadata when applicable.

## 16. Accessibility rules

All UI changes should preserve:

- keyboard operation;
- visible focus;
- accessible names/labels;
- semantic landmarks/forms/lists/groups;
- non-color-only information;
- touch targets;
- reduced motion;
- zoom/reflow;
- modal focus containment/restoration;
- `aria-busy`/disabled semantics for pending actions;
- `aria-current` for current navigation.

Drag-and-drop must not be the only ordering mechanism.

See `accessibility.md` and `e2e/accessibility.spec.ts`.

## 17. Reminder/privacy rules

Notification permission must remain user-triggered.

Reminder polling should remain bounded:

- limited individual title-bearing notifications;
- one title-free summary for excess due reminders;
- delivery failures remain retryable.

Do not add task-title logging/telemetry under the guise of reminder diagnostics.

## 18. Diagnostic logging rules

Development logs must not emit arbitrary task content or exception text.

Use:

- stable TaskMint error codes;
- coarse error kind;
- explicitly safe scalar diagnostics;
- restricted identifier keys/values.

The logger intentionally redacts unknown strings/nested data by default.

If new metadata must be retained, design a narrow safe shape and add privacy regression tests.

## 19. Large-list/performance rules

Keep task-card mounting bounded for large result sets.

Current UI progressively renders 100 matching cards at a time.

Do not remove that bound without replacing it with measured pagination/virtualization and corresponding accessibility/E2E behavior.

Benchmarks are diagnostic. Measure before changing architecture based on speculative performance concerns.

## 20. Testing rules

Bug fixes should normally include a regression that fails before the fix.

Choose the test layer closest to the invariant:

- pure domain -> unit;
- parser -> deterministic fixtures/property;
- component state/semantics -> Testing Library;
- cross-component async state -> App/integration test;
- persistence boundary -> repository harness;
- real IndexedDB/migration/offline/browser focus -> Playwright;
- workflow/config -> direct config/script test.

See `testing.md` and `test-matrix.md`.

## 21. Documentation rules

Documentation is code-adjacent release material.

When changing behavior, update relevant:

- `README.md` for headline product behavior;
- `user-guide.md` for user behavior;
- `data-model.md` for data/import changes;
- `architecture.md` for runtime boundaries;
- `development.md` for contributor rules;
- `operations.md` for CI/release tooling;
- `testing.md` / `test-matrix.md` for coverage;
- `repository-reference.md` for file responsibility changes;
- `CHANGELOG.md` for notable changes;
- `what_changed.md` for current continuation state.

Use an ADR for a significant architectural decision rather than rewriting historical ADRs to pretend the old decision never existed.

## 22. Repository hygiene

`docs:check` validates local Markdown targets only. It intentionally does not fetch external URLs.

`secrets:check` is defense in depth. Never commit real secrets.

`format:check` checks deterministic text invariants independently of Prettier dependencies.

When adding new top-level text/docs locations, inspect the maintenance scripts so the new path remains covered.

## 23. Dependency/workflow policy

Top-level dependencies are exact-version pinned.

Dependabot proposals still require verification.

A real npm-generated `package-lock.json` is required before release and must never be hand-fabricated.

CI/E2E may use pre-lockfile `npm install --ignore-scripts`; tagged release has no fallback and requires `npm ci --ignore-scripts`.

See `operations.md` and `release.md`.

## 24. Recommended change workflow

1. Read `repository-reference.md` for affected file relationships.
2. Make a focused change.
3. Add regression coverage.
4. Update documentation/ADR if behavior or architecture changed.
5. Run dependency-free guards early.
6. Run lint/type/test/build.
7. Run browser E2E when relevant.
8. Run audit for dependency/release work.
9. Commit atomically.
10. Require fresh exact-head hosted verification after every pushed commit.
