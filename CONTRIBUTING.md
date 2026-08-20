# Contributing to TaskMint

Thank you for improving TaskMint. Contributions should preserve the project's local-first, privacy-friendly, accessible, predictable design rather than optimizing only for feature count.

Start with `docs/README.md` for the documentation map and `docs/file-index.md` for the complete tracked-file inventory.

## 1. Ground rules

- Keep TaskMint offline-first for ordinary task operations.
- Preserve user ownership of local/exported data.
- Do not add tracking, accounts, remote task processing, or cloud synchronization without explicit architecture/privacy/security review.
- Never commit real credentials, private user task data, or personal backup files.
- Prefer focused changes with regressions over broad rewrites.
- Keep domain rules outside React handlers where practical.
- Route persistence through `TaskRepository`.
- Preserve validation at import, repository write, and repository read boundaries.
- Preserve transactional multi-task writes.
- Preserve App-wide task mutation serialization unless an alternative is deliberately designed/tested.
- Put visible product copy in the i18n layer.
- Keep shared limits/manual-order/date-time rules centralized.
- Keep UI keyboard accessible and usable at narrow widths/zoom.
- Preserve production CSP; dev-only HMR relaxations remain development-only.
- Do not fabricate lockfiles, screenshots, test evidence, or release status.
- Do not add a tracked file without updating the complete documentation inventory.

## 2. Before starting

Read the areas relevant to the change:

- `docs/file-index.md` — exact tracked-path inventory.
- `docs/repository-reference.md` — ownership/coupling map.
- `docs/architecture.md` — runtime boundaries.
- `docs/data-model.md` — persisted/imported contracts.
- `docs/development.md` — implementation rules.
- `docs/testing.md` / `docs/test-matrix.md` — coverage strategy/current tests.
- `docs/accessibility.md` — UI/accessibility expectations.
- `docs/operations.md` — CI/release repository operations.
- `SECURITY.md` / `PRIVACY.md` — sensitive changes.

For a significant architectural change, review/add an ADR under `docs/adr/`.

## 3. Local workflow

1. Fork or branch from the intended latest base.
2. Confirm Node.js 22.12+.
3. Run `npm install` during the current pre-lockfile development phase.
4. Create a focused branch such as `feat/task-bulk-actions` or `fix/csv-row-validation`.
5. Make the smallest coherent implementation.
6. Add regression coverage.
7. Update documentation coupled to the behavior.
8. Update `docs/file-index.md` for any tracked file add/remove/rename.
9. Update `docs/test-matrix.md` for any test/E2E/benchmark/shared-test-setup path change.
10. Run dependency-free repository guards early.
11. Run `npm run check`.
12. Run browser E2E when browser/persistence/accessibility/PWA behavior changed.
13. Run audit for dependency/release work.
14. Commit focused changes.
15. Open a PR using the repository template.
16. Require fresh exact-head hosted checks after every pushed commit.

## 4. Install and run

```bash
npm install
npm run dev
```

Production build/preview:

```bash
npm run build
npm run preview
```

See `docs/setup.md`.

## 5. Required quality commands

Combined suite:

```bash
npm run check
```

Individual commands:

```bash
npm run format:check
npm run docs:check
npm run docs:inventory
npm run secrets:check
npm run lint
npm run typecheck
npm test
npm run build
```

E2E:

```bash
npm run test:e2e:install
npm run test:e2e
```

Dependency audit when relevant:

```bash
npm audit --audit-level=high
```

Benchmark when performance is relevant:

```bash
npm run bench
```

## 6. Documentation completeness gate

`npm run docs:inventory` uses `git ls-files` and enforces three repository contracts:

1. every tracked file path appears in `docs/file-index.md`;
2. `docs/repository-reference.md` retains the required subsystem ownership sections;
3. every tracked `tests/`, `e2e/`, `bench/`, and `src/test/setup.ts` path appears in `docs/test-matrix.md`.

If this check fails after adding a file, document the file rather than suppressing the check.

## 7. Commit style

Conventional Commits are preferred:

- `feat:`
- `fix:`
- `test:`
- `docs:`
- `refactor:`
- `perf:`
- `build:`
- `ci:`
- `chore:`

Keep commits single-purpose when practical. Do not split inseparable correctness changes just to inflate commit count, and do not hide unrelated work in one giant commit.

## 8. Pull request expectations

A good PR explains:

- problem/goal;
- implementation approach;
- changed behavior;
- tests added/updated;
- documentation updated;
- new/renamed tracked files and inventory update;
- persistence/data migration/import/export impact;
- accessibility impact;
- privacy/security impact;
- known limitations/manual verification.

Do not claim checks passed unless they actually did for the stated SHA/environment.

## 9. Where to implement changes

### Task rules

Use `src/domain/task.ts` for lifecycle/filter/recurrence/statistics behavior.

### Persisted types/data

Coordinate:

- `src/domain/types.ts`
- `src/domain/validation.ts`
- `src/storage/db.ts`
- `src/storage/repository.ts`
- portability code/tests/docs.

### Limits

Use `src/domain/limits.ts`.

### Date-time validation

Use `src/domain/datetime.ts`.

### Manual order

Use `src/domain/order.ts`.

### User-facing strings

Use `src/i18n/en.ts`.

### JSON/CSV

Use `src/utils/export.ts` and preserve explicit version/legacy compatibility policy.

### Browser shortcuts

Use `src/utils/keyboard.ts` for eligibility logic.

### Notifications

Use `src/utils/notifications.ts`; retain bounded/privacy-conscious delivery.

### Diagnostics

Use `src/utils/logger.ts`; do not log arbitrary user strings/raw exception messages.

### Persistence-sensitive task concurrency

Use the App-wide exclusive mutation gate rather than adding an independent unguarded task write path.

## 10. Persistence/data safety expectations

When a change writes tasks/settings:

- validate before persistence;
- persist before React success-state mutation;
- use transactions for multi-task changes;
- validate the whole batch before transaction open;
- avoid duplicate task IDs;
- keep task order safe/deterministic;
- add regression coverage for failure behavior.

For destructive operations such as restore, validate/preflight before clearing current data.

## 11. Data model changes

If adding/changing a persisted field:

1. update types;
2. update domain normalization;
3. update validation;
4. update Dexie schema/migration when needed;
5. update repository behavior;
6. update JSON backup semantics/version policy;
7. update CSV only when the field belongs in human interchange;
8. add unit/repository/migration/import/export/property tests;
9. update `docs/data-model.md`, architecture, and file/test inventories;
10. consider a new ADR for incompatible changes.

Never silently reinterpret previously valid persisted/exported user data.

## 12. CSV compatibility changes

Current marked encoding is `safe-text-v1`.

Do not change its meaning incompatibly in place.

Keep:

- legacy unmarked pipe-tag compatibility;
- literal unmarked `json:` behavior;
- strict quote/header/enum/date validation;
- formula neutralization reversibility;
- original source row numbers;
- blank-record count semantics;
- collision-free append ordering.

If incompatible marked semantics are needed, define a new explicit encoding version and compatibility tests.

## 13. Async UI changes

React disabled state alone may not prevent same-tick duplicate events.

For persistence-sensitive actions:

- consider/use a synchronous ref lock;
- expose `aria-busy`/disabled state;
- release in `finally`;
- keep failure retryable;
- add duplicate activation tests.

Task mutations that can race different cards should use the App-wide gate.

## 14. Accessibility review

For UI changes review:

- keyboard navigation;
- visible focus;
- accessible names/labels;
- current navigation state;
- modal focus trap/restoration;
- disabled/busy semantics;
- 200% zoom/reflow;
- reduced motion;
- themes/contrast;
- touch targets;
- non-color-only information;
- status/live messaging.

Drag-and-drop must have a keyboard alternative.

See `docs/accessibility.md`.

## 15. Security/privacy review

Extra review is required for changes involving:

- remote requests involving task/user data;
- authentication/accounts;
- analytics/telemetry;
- crash reporting;
- notification content;
- encryption/key handling;
- import parsing;
- HTML rendering of imported content;
- CSP;
- dependency lifecycle scripts;
- GitHub Actions permissions;
- release credentials.

Update `SECURITY.md` / `PRIVACY.md` when the documented model changes.

## 16. Test selection

Use the closest layer:

- domain -> unit;
- parser -> unit/property;
- component semantics -> Testing Library;
- cross-component concurrency -> App/integration;
- repository -> repository harness;
- real IndexedDB/migration/offline/focus -> Playwright;
- scripts/config -> direct configuration/fixture tests where practical.

See `docs/test-matrix.md` for every current test file.

## 17. Documentation requirement

Update documentation whenever behavior changes.

Common coupling:

- user behavior -> `docs/user-guide.md`;
- data/import format -> `docs/data-model.md`;
- architecture -> `docs/architecture.md` + ADR when significant;
- contributor rules -> `docs/development.md`;
- tests -> `docs/testing.md` / `docs/test-matrix.md`;
- CI/release -> `docs/operations.md` / `docs/release.md`;
- file paths -> `docs/file-index.md`;
- file responsibilities -> `docs/repository-reference.md`;
- notable change -> `CHANGELOG.md`;
- current continuation state -> `what_changed.md`.

Run both `npm run docs:check` and `npm run docs:inventory`.

## 18. New files/directories

When adding a tracked file:

- add its exact path to `docs/file-index.md`;
- document responsibility/coupling in `docs/repository-reference.md` when meaningful;
- if it is a test/E2E/benchmark/shared test setup file, update `docs/test-matrix.md`;
- ensure TypeScript/ESLint/build includes it if appropriate;
- ensure format/secrets/docs guards cover it if appropriate;
- ensure `.gitignore` does not unintentionally exclude it;
- add docs links only to real committed targets.

When removing/renaming a file, remove/update the old inventory/reference entries in the same change.

## 19. Dependencies

Top-level dependencies are exact-version pinned.

Review dependency updates for:

- security;
- license;
- browser/Node support;
- bundle/PWA impact;
- lifecycle-script behavior;
- API changes.

Dependabot proposals still require tests/review.

Do not fabricate `package-lock.json`; npm must generate and maintain it once release dependency resolution is available.

## 20. PWA changes

Preserve prompt-mode updates unless the product gains durable tested draft restoration that makes automatic reload safe.

Test PWA behavior using production build/preview, not only development HMR.

Update PWA config/component tests, docs, and manual release checklist when behavior changes.

## 21. Performance changes

Measure first.

Keep progressive task rendering bounded or replace it with a measured accessible alternative.

Do not merge a micro-optimization that complicates correctness/data safety without evidence.

Run benchmark separately from correctness tests.

## 22. Security reports

Do not open a public issue for a vulnerability that could put users at risk.

Follow `SECURITY.md` and do not include other users' task data or real secrets in reproductions.

## 23. Repository governance

See `docs/github.md` for branch protection, required checks, merge policy, templates, Dependabot, Actions permissions, and release/tag expectations.

## 24. Definition of done

A change is complete when, as applicable:

- implementation is coherent;
- data/persistence invariants are preserved;
- regression tests are added;
- accessibility/privacy/security are considered;
- behavioral docs are updated;
- `file-index.md` and `test-matrix.md` match the tracked tree;
- `docs:check` and `docs:inventory` pass;
- local quality gates run where possible;
- browser tests run when required;
- PR exact-head hosted checks succeed before merge according to repository policy.
