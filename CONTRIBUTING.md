# Contributing to TaskMint

Thank you for improving TaskMint. Contributions should preserve the project's local-first, privacy-friendly, accessible, predictable design rather than optimizing only for feature count.

Read the documentation index at `docs/README.md` before a large change.

## 1. Ground rules

- Keep TaskMint offline-first for ordinary task operations.
- Preserve user ownership of local/exported data.
- Do not add tracking, accounts, remote task processing, or cloud synchronization without an explicit architecture/privacy/security review.
- Never commit real credentials, private user task data, or personal backup files.
- Prefer small focused changes with regression tests over broad rewrites.
- Keep domain rules outside React event handlers when practical.
- Route persistence through `TaskRepository`.
- Preserve validation at import, repository write, and repository read boundaries.
- Preserve transactional multi-task writes.
- Preserve App-wide task mutation serialization unless an alternative is deliberately designed/tested.
- Put visible product copy in the i18n layer.
- Keep shared limits/manual-order/date-time rules centralized.
- Keep UI keyboard accessible and usable at narrow widths/zoom.
- Preserve production CSP; dev-only HMR relaxations must remain development-only.
- Do not fabricate lockfiles, screenshots, test evidence, or release status.

## 2. Before starting

Read the areas relevant to your change:

- `docs/repository-reference.md` — file ownership/coupling map.
- `docs/architecture.md` — runtime boundaries.
- `docs/data-model.md` — persisted/imported data contracts.
- `docs/development.md` — coding rules.
- `docs/testing.md` / `docs/test-matrix.md` — coverage strategy.
- `docs/accessibility.md` — UI/accessibility expectations.
- `SECURITY.md` / `PRIVACY.md` — sensitive changes.

For a significant architectural change, also review `docs/adr/`.

## 3. Local workflow

1. Fork or branch from the intended latest base.
2. Confirm Node.js 22.12+.
3. Run `npm install` during the current pre-lockfile development phase.
4. Create a focused branch such as `feat/task-bulk-actions` or `fix/csv-row-validation`.
5. Make the smallest coherent implementation.
6. Add regression coverage.
7. Update documentation coupled to the behavior.
8. Run dependency-free guards early.
9. Run `npm run check`.
10. Run browser E2E when browser/persistence/accessibility/PWA behavior changed.
11. Run audit for dependency/release work.
12. Commit focused changes.
13. Open a PR using the repository template.
14. Require fresh exact-head hosted checks after every pushed commit.

## 4. Install and run

```bash
npm install
npm run dev
```

Production build:

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

## 6. Commit style

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

Keep commits single-purpose when practical.

Do not split one inseparable correctness change merely to inflate commit count. Conversely, do not hide unrelated changes inside one giant commit.

## 7. Pull request expectations

A good PR explains:

- problem/goal;
- implementation approach;
- changed behavior;
- tests added/updated;
- documentation updated;
- persistence/data migration/import/export impact;
- accessibility impact;
- privacy/security impact;
- known limitations or manual verification needed.

Do not claim checks passed unless they actually did for the stated SHA/environment.

## 8. Where to implement changes

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

## 9. Persistence/data safety expectations

When a change writes tasks/settings:

- validate before persistence;
- persist before React success-state mutation;
- use transactions for multi-task changes;
- validate the whole batch before transaction open;
- avoid duplicate task IDs;
- keep task order safe/deterministic;
- add regression coverage for failure behavior.

For destructive operations such as restore, validate/preflight before clearing current data.

## 10. Data model changes

If adding/changing a persisted field:

1. update types;
2. update domain normalization;
3. update validation;
4. update Dexie schema/migration when needed;
5. update repository behavior;
6. update JSON backup semantics/version policy;
7. update CSV only when field belongs in human interchange;
8. add unit/repository/migration/import/export/property tests;
9. update `docs/data-model.md` and architecture docs;
10. consider a new ADR for incompatible changes.

Never silently reinterpret previously valid persisted/exported user data.

## 11. CSV compatibility changes

Current marked CSV encoding is `safe-text-v1`.

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

## 12. Async UI changes

React disabled state alone may not prevent same-tick duplicate events.

For persistence-sensitive actions:

- consider a synchronous ref lock;
- expose `aria-busy`/disabled state;
- release in `finally`;
- keep failure retryable;
- add duplicate activation tests.

Task mutations that can race different cards should use the App-wide gate.

## 13. Accessibility review

For UI changes manually/testably review:

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

## 14. Security/privacy review

A change requires extra review if it introduces/changes:

- remote network requests involving task/user data;
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

## 15. Test selection

Use the closest test layer:

- domain -> unit;
- parser -> unit/property;
- component semantics -> Testing Library;
- cross-component concurrency -> App/integration;
- repository -> repository harness;
- real IndexedDB/migration/offline/focus -> Playwright;
- scripts/config -> direct configuration/fixture tests.

See `docs/test-matrix.md` for every current test file.

## 16. Documentation requirement

Update documentation whenever behavior changes.

Common coupling:

- user behavior -> `docs/user-guide.md`;
- data/import format -> `docs/data-model.md`;
- architecture -> `docs/architecture.md` + ADR when significant;
- contributor rules -> `docs/development.md`;
- tests -> `docs/testing.md` / `docs/test-matrix.md`;
- CI/release -> `docs/operations.md` / `docs/release.md`;
- file responsibility -> `docs/repository-reference.md`;
- notable change -> `CHANGELOG.md`;
- current continuation state -> `what_changed.md`.

Run `npm run docs:check`.

## 17. New files/directories

When adding a file:

- document it in `docs/repository-reference.md`;
- if it is a test, update `docs/test-matrix.md`;
- ensure TypeScript/ESLint/build includes it if appropriate;
- ensure format/secrets/docs guards cover it if appropriate;
- ensure `.gitignore` does not unintentionally exclude it;
- add docs links only to real committed targets.

## 18. Dependencies

Top-level dependencies are exact-version pinned.

Review dependency updates for:

- security;
- license;
- browser/Node support;
- bundle/PWA impact;
- lifecycle-script behavior;
- API changes.

Dependabot proposals still require tests/review.

Do not fabricate `package-lock.json`. It must be generated by npm and reviewed before release.

## 19. PWA changes

Preserve prompt-mode updates unless the product gains durable tested draft restoration that makes automatic reload safe.

Test PWA behavior using production build/preview, not only development HMR.

Update `tests/pwa-config.test.ts`, component tests, docs, and manual release checklist when update behavior changes.

## 20. Performance changes

Measure first.

Keep progressive task rendering bounded or replace it with a measured accessible alternative.

Do not merge a micro-optimization that complicates correctness/data safety without evidence.

Run benchmark separately from correctness tests.

## 21. Security reports

Do not open a public issue for a vulnerability that could put users at risk.

Follow `SECURITY.md`.

Do not include other users' task data or real secrets in reproductions.

## 22. Repository governance

See `docs/github.md` for branch protection, required checks, merge policy, issue templates, Dependabot, Actions permissions, and release/tag expectations.

## 23. Definition of done

A change is complete when, as applicable:

- implementation is coherent;
- data/persistence invariants preserved;
- regression tests added;
- accessibility/privacy/security considered;
- documentation updated;
- local quality gates run where possible;
- browser tests run when required;
- PR exact-head hosted checks succeed before merge according to repository policy.
