# TaskMint Development Guide

This guide defines day-to-day implementation rules for TaskMint contributors. For runtime architecture see `architecture.md`; exact data contracts: `data-model.md`; exact tracked-file inventory: `file-index.md`; ownership/coupling: `repository-reference.md`; CI/release operations: `operations.md`.

## 1. Requirements

- Node.js 22.12 or newer
- npm
- Git
- modern browser
- Chromium/Playwright dependencies for browser E2E

TaskMint currently requires no backend server, remote database, API key, or application secret.

## 2. Important commands

- `npm run dev` — Vite development server
- `npm run build` — TypeScript project build + Vite production bundle
- `npm run preview` — preview production output
- `npm run format` — Prettier write mode
- `npm run format:check` — LF/final-newline/trailing-whitespace guard
- `npm run docs:check` — repository-relative Markdown link verification
- `npm run docs:inventory` — tracked-file + test-matrix documentation completeness guard
- `npm run secrets:check` — common committed-secret pattern guard
- `npm run lint` — strict type-aware ESLint
- `npm run typecheck` — TypeScript checks including tests/E2E/bench
- `npm test` — Vitest suites
- `npm run test:watch` — Vitest watch
- `npm run bench` — non-gating domain benchmark
- `npm run test:e2e:install` — install Chromium + system dependencies
- `npm run test:e2e` — Playwright against production build/preview
- `npm run release:check -- vX.Y.Z` — exact tag/version + lockfile guard
- `npm run check` — format/docs links/docs inventory/secrets/lint/type/test/build

Dependency audit remains explicit:

```bash
npm audit --audit-level=high
```

## 3. Where code belongs

### Domain rules

Use `src/domain/` for behavior independent of React timing:

- normalization;
- lifecycle transitions;
- recurrence;
- filtering/sorting/statistics;
- strict date-time parsing;
- persisted validation;
- manual-order arithmetic;
- stable typed errors;
- shared limits.

### Persistence

Use `TaskRepository`. React components must not write raw IndexedDB/Dexie tables directly.

### UI orchestration

`App.tsx` coordinates use cases, derived state, persistence ordering, cross-component mutation exclusion, global effects, imports/exports, reminders, and Settings callbacks.

### Presentation

Components render accessible controls, capture input, expose callbacks, and own local interaction state. Do not move storage schema/transaction rules into components.

### Utilities

Use `src/utils/` for cross-cutting helpers such as portability, shortcuts, reminders, diagnostics, and mutation gating.

### Product strings

Use `src/i18n/en.ts` for visible user-facing copy.

## 4. TypeScript rules

The strict application project covers:

- `src`
- `tests`
- `e2e`
- `bench`

Important constraints:

- `strict`;
- `noUncheckedIndexedAccess`;
- `noFallthroughCasesInSwitch`;
- `noImplicitOverride`;
- bundler module resolution;
- no emit.

Do not weaken compiler settings merely to accommodate a new implementation shortcut.

## 5. ESLint rules

Type-aware ESLint is a CI gate.

Important rules include:

- no floating promises;
- no explicit `any`;
- promise misuse checks;
- interface-style object definitions.

Intentionally ignored event-handler promises should use a clear `void` expression where appropriate.

## 6. Validation rules

Treat as untrusted:

- JSON files;
- CSV files;
- IndexedDB rows;
- future runtime callers reaching persistence outside ordinary TypeScript/UI paths.

Validation at multiple boundaries is intentional. Do not remove repository validation because UI/domain validation already exists.

### Dates/timestamps

Keep strict parsing in `src/domain/datetime.ts`. Do not use permissive JavaScript date rollover as a validity check.

### Limits

Keep content/import limits in `src/domain/limits.ts`; do not duplicate magic values.

## 7. Persistence rules

- Persist before React success-state mutation.
- Use explicit transactions for multi-task writes.
- Validate complete batches before transaction open.
- Validate replacements before clearing current tasks.
- Reject duplicate task IDs in bulk batches.
- Preflight complete backup before destructive restore transaction.
- Fail closed on malformed startup data without auto-deleting it.

The rationale is in `adr/0003-validation-persistence-boundaries.md`.

## 8. Task mutation concurrency

TaskMint serializes persistence-sensitive user task writes.

### Component scope

`TaskComposer` and `TaskItem` use synchronous ref locks because React state updates alone cannot close same-tick duplicate-event races.

### App scope

New persistence-sensitive task entry points must be evaluated for the App-wide gate in `src/utils/mutation.ts` / `App.tsx`.

Current protected operations:

- create/edit;
- complete/reopen;
- archive/restore;
- delete/Undo;
- keyboard reorder;
- drag/drop reorder.

Do not add an unguarded task write without a deliberate design reason and regression coverage.

See `adr/0004-exclusive-task-mutations.md`.

## 9. Manual ordering

All comparison/allocation/normalization belongs in `src/domain/order.ts`.

Invariants:

- safe integers only;
- deterministic ID tie-breaker;
- overflow detection;
- duplicate persisted slots normalized deterministically;
- recurrence/CSV append receive collision-free new slots.

Do not rely on `Date.now()` alone as uniqueness against arbitrary imported/persisted order values.

## 10. Recurrence

Recurring completion returns a completed current occurrence and optionally a new active occurrence.

App supplies `nextTaskOrder(tasks)` for the next occurrence.

Preserve:

- month-end clamping;
- due-date reminder offset movement;
- reminder-only recurrence behavior.

## 11. Data portability

### JSON

JSON is full fidelity.

- schema explicitly versioned;
- unknown versions fail;
- complete validation before destructive restore;
- preserves lifecycle/settings not available in CSV.

### CSV

CSV is human-readable interchange.

Current marked encoding:

```text
safe-text-v1
```

Preserve:

- required columns;
- structured `json:` tags only under marked encoding;
- legacy unmarked pipe tags;
- literal unmarked legacy `json:` text;
- unknown marked-version rejection;
- reversible formula neutralization;
- strict quote handling;
- original source row numbers across blank records;
- blank records excluded from task quota but included in input size;
- collision-free append order rebasing.

Do not change `safe-text-v1` incompatibly in place. See `adr/0005-versioned-data-portability.md`.

## 12. Import file input retryability

Settings captures the selected `File`, then immediately clears the DOM file input value before async import processing.

Do not move the reset after `await` without considering same-file retry behavior and regression tests.

## 13. PWA updates

- Keep `registerType: 'prompt'` while unsaved form input can exist.
- Do not use `autoUpdate` without durable tested draft restoration.
- Update now must activate via `updateServiceWorker(true)`.
- Activation is serialized.
- Failure stays retryable and does not intentionally alter task data.
- Test production build/preview behavior, not only HMR.

## 14. CSP

Production CSP belongs in `index.html`.

Vite dev inline-style/WebSocket relaxations are serve-only.

Do not weaken production policy to solve HMR.

## 15. Keyboard

Shortcut eligibility belongs in `src/utils/keyboard.ts`.

Consider:

- editable targets;
- modifiers;
- onboarding/Settings;
- pending App task mutation;
- active edit context;
- `aria-keyshortcuts` metadata.

## 16. Accessibility

Preserve:

- keyboard operation;
- visible focus;
- accessible names/labels;
- semantic landmarks/groups/lists/forms/dialogs;
- `aria-current` navigation;
- `aria-busy`/disabled pending state;
- non-color-only information;
- keyboard reorder alternative to drag/drop;
- reduced motion;
- 200% zoom/reflow;
- touch targets;
- modal focus containment/restoration.

See `accessibility.md`.

## 17. Reminders/privacy

Notification permission must stay user-triggered.

Keep bounded delivery:

- limited individual title-bearing notifications;
- one title-free summary for excess due reminders;
- delivery failures retryable.

Do not add user task text to diagnostics/telemetry casually.

## 18. Diagnostic logging

Development logging must not emit arbitrary task content or raw infrastructure messages.

Use:

- stable TaskMint codes;
- coarse error kind;
- explicitly safe scalar/identifier metadata.

The event logger fails closed by default. Add a narrow safe allowlist + tests if new retained string metadata is required.

## 19. Large-list/performance

Keep rendered card count bounded or replace it with a measured accessible alternative.

Current page size is 100 matching cards.

Benchmark before architectural optimization. See `performance.md`.

## 20. Testing

Bug fixes should normally include a regression that fails before the fix.

Choose the closest layer:

- pure domain -> unit;
- parser -> fixtures/property;
- component -> Testing Library;
- cross-component concurrency -> App/integration;
- persistence -> repository harness;
- real IndexedDB/offline/focus/migration -> Playwright;
- scripts/config -> direct script/config fixture tests where practical.

See `testing.md` and `test-matrix.md`.

## 21. Documentation rules

Documentation is part of the repository contract.

Behavior changes should update relevant:

- `README.md`;
- `user-guide.md`;
- `data-model.md`;
- `architecture.md`;
- `development.md`;
- `operations.md`;
- `testing.md` / `test-matrix.md`;
- `repository-reference.md`;
- `CHANGELOG.md`;
- `what_changed.md`.

Significant architectural decisions require an ADR rather than rewriting history.

## 22. Tracked-file inventory rule

Whenever a tracked file is added, removed, or renamed:

1. update `file-index.md`;
2. update `repository-reference.md` if ownership/coupling changes;
3. update `test-matrix.md` for test/E2E/benchmark/shared test setup paths;
4. run `npm run docs:inventory`.

The inventory guard uses `git ls-files`, so documentation completeness is enforced against the real tracked tree.

## 23. Repository hygiene

Run early:

```bash
npm run format:check
npm run docs:check
npm run docs:inventory
npm run secrets:check
```

If a new top-level text/docs directory falls outside a maintenance script's configured roots, update the script intentionally.

## 24. Dependencies/workflows

Top-level dependencies are exact-version pinned.

Dependabot proposals require normal review.

A real npm-generated lockfile is required for release and must not be fabricated.

CI/E2E may use pre-lockfile `npm install --ignore-scripts`; Release requires `npm ci --ignore-scripts`.

See `operations.md` and `release.md`.

## 25. Recommended change workflow

1. Read `file-index.md` and `repository-reference.md` for affected paths.
2. Make a focused implementation.
3. Add regression coverage.
4. Update docs/ADR.
5. Update file/test inventories when needed.
6. Run dependency-free guards.
7. Run `npm run check`.
8. Run browser E2E when relevant.
9. Run audit for dependency/release work.
10. Commit atomically.
11. Require fresh exact-head hosted checks after every pushed commit.
