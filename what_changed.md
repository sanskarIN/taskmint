# TaskMint — Work Handoff

## Current milestone

- Project: **TaskMint**
- Repository: `https://github.com/sanskarIN/taskmint`
- Repository visibility/source model: **PUBLIC / OPEN SOURCE**
- License: **MIT**
- Current package version: `0.1.0`
- Release status: **release candidate only; no `v0.1.0` tag has been created**
- Default branch: `main`
- Date: 2026-08-19
- Git commit identity: `Sanskar <sanskarin@outlook.in>`
- Latest `main` commit before this handoff update: `8f37c22f85d632ed997f3634068e4b148e27d6ec` — `docs: record notification delivery hardening`
- Current verification PR: **#12 — `test: verify TaskMint v0.1 RC2 quality gates`**
- Verification branch: `verification/v0.1-rc2`
- Current verification branch head: `b42360a53bc3ca07ff70bc0004cffc4dedf67174` — `test: resync rc2 verification trigger`
- Phase status: Phases 0–5 are substantially implemented. Phase 6 source-level audit/hardening has been extended through RC2. Hosted dependency-backed CI/E2E/CodeQL is still queued/pending, so **do not tag `v0.1.0` yet**.

## Resume instruction

Read this file first in the next continuation. Then inspect the latest `main`, PR #12, its newest workflow runs, `CHANGELOG.md`, and any new issues. Do not rebuild completed features from scratch. Continue only the exact remaining release-candidate work below or fix failures proven by CI/E2E/CodeQL logs.

## Work completed in this continuation

### Shared task and import limits

Created `src/domain/limits.ts` as the single source of truth for data boundaries:

- Task ID: 100 characters.
- Task title: 240 characters.
- Notes: 20,000 characters.
- Project: 80 characters.
- Maximum tags per task: 12.
- Maximum tag length: 32 characters.
- Maximum tasks in one backup/import: 100,000.
- Maximum import text/file size: 25,000,000 bytes/characters at the application parsing boundary.

The task composer, domain creation/update rules, JSON backup validation, CSV import, and file-reading guard now consume shared limits instead of duplicating magic numbers.

### Domain validation hardening

`src/domain/task.ts` now:

- Rejects non-finite task ordering values supplied to task creation.
- Rejects oversized notes instead of silently truncating them.
- Rejects oversized project names instead of silently truncating them.
- Rejects tags longer than the shared limit instead of silently truncating them.
- Rejects more than 12 unique tags instead of silently dropping extras.
- Rejects impossible dates such as `2026-02-31` instead of silently clearing them.
- Rejects malformed reminder date/time values instead of silently clearing them.
- Keeps recurring reminders moving forward when a recurring task has no due date.
- Keeps recurring next-occurrence ordering deterministic from the injected completion time.
- Exposes `reorderVisibleTasks(...)` so drag ordering can be tested as pure domain behavior.

### Backup validation hardening

`src/domain/validation.ts` now applies the same shared task constraints to untrusted JSON backup data and rejects the entire backup before replacement when it contains invalid data.

Validated/rejected conditions include:

- Empty/oversized task IDs.
- Empty/oversized titles.
- Oversized notes.
- Oversized projects.
- Invalid priority/recurrence/status enums.
- Duplicate task IDs.
- Invalid task order values.
- Impossible local calendar dates.
- Malformed reminder/completed/archive/created/updated timestamps.
- Incompatible status/timestamp combinations.
- Invalid tag element types.
- Empty/oversized tags.
- Too many unique tags.
- Invalid settings theme.
- Non-boolean settings fields.
- Missing/malformed backup `exportedAt` timestamp.
- More than the supported maximum number of tasks.

### CSV import hardening

`src/utils/export.ts` now treats CSV as untrusted input and validates it strictly.

Implemented:

- Shared import byte/text-size limit.
- Shared maximum task-count limit.
- UTF-8 BOM handling on the first header.
- Required expected column checks.
- Duplicate CSV header rejection.
- Strict priority enum validation.
- Strict recurrence enum validation.
- Strict status enum validation.
- Strict due-date validation through domain creation rules.
- Strict reminder validation through domain creation rules.
- Shared title/notes/project/tag constraints through domain creation rules.
- Row-numbered error messages for malformed imported tasks.
- Unterminated quoted-field rejection.
- Existing quoted comma/quote/multiline parsing preserved.

Invalid CSV records are no longer silently coerced into different TaskMint data.

### Persistence failure recovery

`src/App.tsx` now catches IndexedDB/repository failures before mutating visible application state for:

- Task creation.
- Task editing.
- Reopening a completed task.
- Completing a task.
- Archiving.
- Restoring.
- Deleting.
- Undoing deletion.
- Keyboard reordering.
- Drag-and-drop reordering.
- Settings persistence.
- Delete-all-local-data.

Failures are logged through the existing redacted development logger and surfaced with user-safe status/form messages. React state changes happen only after the corresponding repository operation succeeds.

### Reorder consistency

Drag-and-drop and keyboard ordering were brought into the same visible/manual ordering model.

Implemented:

- Drag-and-drop is disabled when sort mode is not `manual`.
- Keyboard move controls remain hidden outside manual sorting.
- Drag reorder uses the visible/rendered active task set rather than hidden global active tasks.
- `reorderVisibleTasks` preserves the supplied visible order slots and returns only changed tasks for persistence.
- Progressive pagination limits both keyboard and drag reordering to currently rendered task cards, avoiding surprising movement of hidden page entries.

### Internationalization-ready UI migration

Expanded `src/i18n/en.ts` from a small set of shared strings into the primary English product catalog.

Migrated visible product text in:

- `src/App.tsx`
- `src/components/TaskComposer.tsx`
- `src/components/TaskItem.tsx`
- `src/components/Toolbar.tsx`
- `src/components/Sidebar.tsx`
- `src/components/StatsPanel.tsx`
- `src/components/Onboarding.tsx`
- `src/components/SettingsDialog.tsx`
- `src/components/ErrorBoundary.tsx`
- `src/utils/notifications.ts` notification title

The catalog now includes static and dynamic labels/status text for task actions, views, filters, settings, onboarding, errors, reminders, accessibility labels, backup/import results, pagination, and shortcuts.

English remains the only shipped locale in v0.1, but presentation components no longer maintain independent copies of most product UI text.

### Global keyboard productivity shortcuts

Created `src/utils/keyboard.ts` with a pure/testable shortcut resolver and editable-target detection.

Implemented shortcuts:

- `Ctrl+K` / `Cmd+K`: focus and select global task search.
- `N`: focus the new-task title when focus is not already in an editable control.

Safety/accessibility behavior:

- Shortcuts are disabled while first-run onboarding is active.
- Shortcuts are disabled while Settings is open.
- `N` does not steal keystrokes while typing in input/textarea/select/contenteditable controls.
- `N` does not interrupt an active edit session.
- Search and task-title inputs expose `aria-keyshortcuts` metadata.
- Search displays a desktop shortcut hint which is hidden on small screens.

### Progressive large-list rendering

Added `TASK_PAGE_SIZE = 100` in `src/config.ts`.

`src/App.tsx` now:

- Computes the complete filtered/sorted result set.
- Renders at most 100 task cards initially.
- Displays the full matching task count.
- Displays an accessible `Show more tasks (N remaining)` button when more matches exist.
- Loads the next page explicitly on user request.
- Resets the render limit when search/filter/sort state changes.
- Uses `aria-controls="task-list"` on the progressive-loading control.

This prevents an allowed 100,000-task import from immediately mounting every matching task card into the DOM.

### Touch-target hardening

Updated `src/styles.css` so:

- Complete/reopen controls are 40×40 pixels.
- Mobile task action buttons remain at least 40 pixels high.
- Progressive loading receives consistent layout styling.
- Shortcut hints are visually unobtrusive and removed on narrow screens.
- Tag-help text uses a dedicated subdued helper style.

### Reminder-delivery isolation

`src/utils/notifications.ts` now:

- Uses the externalized English reminder notification title.
- Wraps each browser `Notification` constructor invocation in a failure boundary.
- Prevents one browser notification exception from escaping/breaking the reminder polling loop.
- Does not mark a reminder as notified when delivery construction fails, allowing a later polling cycle to retry.

### Automated test expansion

#### `tests/task.test.ts`

Added coverage for:

- Impossible calendar-date rejection.
- Oversized notes.
- Excess tag counts.
- Oversized tags.
- Recurring reminders without due dates.
- Deterministic generated task ordering.
- Visible-slot reorder behavior.

#### `tests/export.test.ts`

Added coverage for:

- UTF-8 BOM CSV headers.
- Invalid CSV priority enum rejection.
- Impossible CSV date rejection.
- Duplicate CSV header rejection.
- Oversized backup field rejection.
- Deterministic 64-task CSV stress round trip containing commas, double quotes, CR/LF content, Unicode/Hindi text, tags, projects, priorities, and recurrence.

#### `tests/keyboard.test.ts`

New test file covering:

- `Ctrl+K` search resolution.
- `Cmd+K` search resolution.
- `N` new-task resolution.
- Editable-control protection.
- Modal-blocking behavior.
- Unsupported modifier combinations.

#### `tests/notifications.test.ts`

New test file covering:

- A due reminder is delivered once and marked notified.
- The externalized TaskMint reminder title/body/tag is supplied.
- A throwing browser Notification constructor does not escape the reminder loop.
- Failed notification construction does not mark the task as successfully notified.

#### `e2e/keyboard.spec.ts`

New Chromium E2E coverage for:

- `Control+K` search focus.
- `N` new-task focus.
- `N` remaining a normal typed character while search is focused.

#### `e2e/backup-restore.spec.ts`

New Chromium E2E coverage for a real backup lifecycle:

1. Create a task.
2. Download the JSON backup.
3. Delete all local TaskMint data with confirmation.
4. Restore the downloaded JSON through the real file input.
5. Verify the task returns.

#### `e2e/pagination.spec.ts`

New Chromium E2E coverage that seeds 101 tasks into IndexedDB, reloads TaskMint, verifies only 100 cards initially mount, activates the load-more control, and verifies all 101 are then mounted.

#### `e2e/accessibility.spec.ts`

New dependency-free browser accessibility smoke coverage for:

- Core main/navigation landmarks.
- No unnamed interactive buttons.
- No unlabeled visible input/select/textarea controls under the smoke-test rules.
- Search shortcut ARIA metadata.
- New-task shortcut ARIA metadata.

### GitHub Actions improvements

`.github/workflows/e2e.yml` now:

- Runs on pull requests.
- Runs on pushes to `main`.
- Supports manual `workflow_dispatch`.
- Uses concurrency cancellation to stop superseded E2E runs on the same ref.
- Continues to upload the Playwright report on failure.

CI and CodeQL already used concurrency cancellation from the previous hardening pass.

### Documentation updated in this continuation

Updated:

- `README.md`
- `SECURITY.md`
- `ROADMAP.md`
- `CHANGELOG.md`
- `docs/architecture.md`
- `docs/development.md`
- `docs/testing.md`
- `docs/accessibility.md`
- `docs/performance.md`
- `what_changed.md`

The documentation now describes:

- Global keyboard shortcuts.
- Shared data-limit architecture.
- Strict import behavior.
- Localization/string-catalog rules.
- Persistence error handling.
- Progressive large-list rendering.
- Expanded E2E matrix.
- Notification delivery isolation.
- Updated release-candidate gates.

## Product implementation completed overall

- Create, edit, complete, reopen, archive, restore, and delete tasks.
- Undo individual task deletion.
- Priorities: low, medium, high, urgent.
- Due dates.
- Optional reminder date/time.
- Notes.
- Tags with normalization/deduplication/limits.
- Projects.
- Daily, weekly, and monthly recurrence.
- Month-end recurrence clamping.
- Recurring next-occurrence creation.
- Atomic recurring completion and next-occurrence persistence.
- Recurring reminders with or without due dates.
- Inbox, Today, Upcoming, Overdue, Completed, Archived, All Tasks smart views.
- Search across title/notes/project/tags.
- Project/tag/priority filtering.
- Manual/newest/due/priority/title sorting.
- Drag-and-drop ordering.
- Keyboard move-up/move-down alternative.
- `Ctrl/Cmd+K` global search shortcut.
- `N` new-task shortcut.
- JSON backup/export.
- JSON restore/import with destructive replacement confirmation.
- CSV export/import with strict validation.
- Productivity statistics without streaks/penalties/manipulative gamification.
- First-run onboarding.
- Light/dark/system theme.
- Reduced motion.
- Responsive phone/tablet/desktop layout.
- Progressive large-list rendering.
- Loading/empty/offline/success/form-error/fatal-render states.
- Optional browser notifications.
- One-click local data deletion.
- Settings for appearance/accessibility/reminders/data/privacy/updates/About.
- About version sourced from package metadata.
- Installable PWA/service worker/manifest.
- Editable SVG icon/source artwork.
- Visible **Made by the Sanskar** credit.
- GitHub/support/business/funding links.
- No required account/backend/donation.

## Data, persistence, migration, and reliability completed overall

- Dexie/IndexedDB persistence.
- Explicit schema versions 1 and 2.
- v1→v2 migration for reminders/tags/project/recurrence.
- Browser E2E migration fixture.
- Repository persistence boundary.
- Transactional JSON restore.
- Transactional local-data deletion.
- Bulk transactional imports/reorders.
- Atomic recurring completion writes.
- JSON backup schema v2.
- Full backup validation before replacement.
- Shared task/import limits.
- Strict JSON ID/enum/date/timestamp/status/settings/tag/order validation.
- Strict CSV structure/enum/date/task validation.
- Import size/task-count limits.
- Persistence error recovery before UI state mutation.
- Exact-pinned direct npm dependency versions.

## Security/privacy completed overall

- Local-first architecture with no required backend/auth/API key.
- React text rendering for imported task content; no HTML injection API is used for task text.
- CSP with origin-restricted scripts.
- `object-src 'none'`.
- `base-uri 'self'`.
- `form-action 'self'`.
- Development-only structured logging with sensitive-field redaction.
- No committed secrets/production credentials.
- `.env.example` placeholders only.
- `.env` ignored.
- CodeQL workflow.
- High-severity npm audit in CI.
- Dependabot for npm and GitHub Actions.
- Responsible disclosure process.
- Privacy behavior documentation.
- Privacy-aware bug-report template.

## Accessibility/UX completed overall

- Native semantic controls.
- Visible `:focus-visible` styles.
- Screen-reader labels.
- Non-color-only priority labels.
- Polite live-region status toasts.
- 40px-or-larger primary task/action controls.
- Keyboard alternative to drag-and-drop.
- Keyboard search/new-task shortcuts with safeguards.
- `aria-keyshortcuts` metadata.
- Progressive-loading `aria-controls` relationship.
- Reduced-motion behavior.
- Responsive layout/touch targets.
- Onboarding focus containment.
- Settings focus entry/trap/Escape/restore behavior.
- Hidden file inputs excluded from normal tab order.
- Persistence error messages instead of silent failures.
- Browser accessibility smoke test.

## Internationalization readiness overall

- Product UI English catalog at `src/i18n/en.ts`.
- Primary visible application/component/status text consumes the catalog.
- Dynamic label builders are externalized where appropriate.
- Domain/persistence logic remains independent of locale presentation.
- Development rules require new product copy to use the catalog.
- English is the only shipped locale for v0.1; additional locale packs remain v0.2 work.

## Full implementation/configuration inventory

### Root/build/configuration

- `LICENSE`
- `README.md`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `SUPPORT.md`
- `PRIVACY.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `what_changed.md`
- `package.json`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `playwright.config.ts`
- `eslint.config.js`
- `index.html`
- `.prettierrc.json`
- `.prettierignore`
- `.gitignore`
- `.editorconfig`
- `.gitattributes`
- `.env.example`
- `scripts/check-format.mjs`
- `public/taskmint-icon.svg`

### Application source

- `src/App.tsx`
- `src/main.tsx`
- `src/config.ts`
- `src/styles.css`
- `src/domain/limits.ts`
- `src/domain/types.ts`
- `src/domain/task.ts`
- `src/domain/validation.ts`
- `src/storage/db.ts`
- `src/storage/repository.ts`
- `src/utils/export.ts`
- `src/utils/keyboard.ts`
- `src/utils/logger.ts`
- `src/utils/notifications.ts`
- `src/i18n/en.ts`
- `src/components/ErrorBoundary.tsx`
- `src/components/Onboarding.tsx`
- `src/components/SettingsDialog.tsx`
- `src/components/Sidebar.tsx`
- `src/components/StatsPanel.tsx`
- `src/components/TaskComposer.tsx`
- `src/components/TaskItem.tsx`
- `src/components/Toolbar.tsx`

### Unit/component tests

- `src/test/setup.ts`
- `tests/task.test.ts`
- `tests/export.test.ts`
- `tests/keyboard.test.ts`
- `tests/notifications.test.ts`
- `tests/TaskComposer.test.tsx`

### End-to-end tests

- `e2e/task-flow.spec.ts`
- `e2e/migration.spec.ts`
- `e2e/keyboard.spec.ts`
- `e2e/backup-restore.spec.ts`
- `e2e/pagination.spec.ts`
- `e2e/accessibility.spec.ts`

### GitHub configuration

- `.github/workflows/ci.yml`
- `.github/workflows/e2e.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/release.yml`
- `.github/dependabot.yml`
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/FUNDING.yml`

### Technical/project documentation

- `docs/architecture.md`
- `docs/setup.md`
- `docs/development.md`
- `docs/testing.md`
- `docs/release.md`
- `docs/troubleshooting.md`
- `docs/accessibility.md`
- `docs/performance.md`
- `docs/github.md`
- `docs/adr/0001-local-first-pwa.md`
- `docs/adr/0002-dexie-repository.md`
- `docs/screenshots/README.md`
- `docs/master-prompt.md`

### Verification-branch-only document

- `docs/verification-rc2.md` exists on `verification/v0.1-rc2` to create a minimal PR delta and trigger pull-request workflows. It is not required application runtime code and is not currently part of `main`.

## Verification performed in this continuation

### Dependency-free strict TypeScript core audit — PASSED

A temporary core-check workspace was created from the current dependency-independent modules and compiled using the available global TypeScript compiler with:

- ES2022 target.
- DOM libraries.
- `strict`.
- `noUncheckedIndexedAccess`.
- `noFallthroughCasesInSwitch`.
- `noImplicitOverride`.

Checked modules included current domain types, shared limits, task business logic, backup validation, CSV/JSON utilities, and keyboard shortcut resolver.

Result:

`CORE_TSC_OK`

### Dependency-free compiled runtime assertions — PASSED

Runtime assertions covered:

- Title normalization.
- Tag normalization/deduplication.
- Impossible-date rejection.
- Oversized-notes rejection.
- Visible-slot reorder mapping.
- Deterministic 64-entry CSV stress round trip including commas, quotes, CR/LF, Unicode/Hindi, tags, projects, priorities, and recurrence.
- Malformed CSV priority rejection.
- `Ctrl+K` shortcut resolution.
- `N` shortcut suppression in editable contexts.

Result:

`CORE_RUNTIME_OK`

### Placeholder audit — PASSED

A source scan for implementation placeholders did not find active implementation `TODO`, `FIXME`, or `XXX` markers in the prepared source tree. The supplied master prompt may contain those terms as policy/example text and is not an implementation placeholder.

### Previous source-level checks still applicable

- Project JSON configuration parsing previously passed.
- `.github/**/*.yml` parsing previously passed.
- Required-file and README relative-link audit previously passed.
- ES2022-incompatible `Array.prototype.toSorted` use was found and fixed in an earlier audit.
- React error-boundary strict override issue was found and fixed.
- Vite development CSP style incompatibility was found and fixed.
- Backup duplicate/malformed record acceptance was found and fixed.
- Non-atomic recurring completion was found and fixed.
- Stale edit-form state was found and fixed.
- Modal focus handling was hardened.

## Hosted GitHub verification status

### Superseded historical verification

PR #1 (`docs: verify v0.1 repository quality gates`) was an earlier verification attempt. Its old queued workflow IDs are superseded by RC2 and should not be used as the current release gate.

### Current RC2 verification

Open PR:

- **PR #12 — `test: verify TaskMint v0.1 RC2 quality gates`**
- Head branch: `verification/v0.1-rc2`
- Current verification head: `b42360a53bc3ca07ff70bc0004cffc4dedf67174`

Latest synchronized RC2 runs at the time this handoff was written:

- **E2E** run `32217410418` — `queued` — conclusion `null`
- **CI** run `32217410493` — `pending` — conclusion `null`
- **CodeQL** run `32217410364` — `queued` — conclusion `null`

CI run `32217410493` currently reports job:

- Job `95961395825` — `quality` — `queued` — conclusion `null`

These statuses are **not success and are not failure**. Do not represent them as green and do not tag the release from a queued/pending state.

The RC2 verification branch was synchronized after the notification-delivery hardening so these run IDs are the current hosted verification set for the latest code changes prior to this handoff documentation commit.

## Environment/tooling limitations

- The execution sandbox still cannot resolve `github.com` through shell networking.
- The execution sandbox still cannot resolve the npm registry host.
- Therefore a clean shell clone cannot be performed here.
- Therefore a real `npm install` cannot be performed here.
- Therefore `package-lock.json` cannot be generated from a real successful registry resolution in this environment and must not be fabricated.
- Therefore the complete dependency-backed `npm run check`, Vite production build, npm security audit, and installed Playwright Chromium run cannot be executed locally in this environment.
- Full React/type-aware dependency-backed validation is delegated to the hosted CI run; local checks cover dependency-independent core logic only.
- Repository reads/writes are being performed through the authenticated GitHub connector.

## Known documented limitations

- Reminder checks run while TaskMint is open. Reliable closed-app scheduled browser/PWA notification delivery is not claimed across every browser/OS combination.
- Local IndexedDB task content is not encrypted by TaskMint; the unlocked browser/OS profile security boundary remains important.
- Real release screenshots have not been fabricated. They must be captured from a browser-verified release build using fictional data.
- A Tauri wrapper is intentionally not part of v0.1; the PWA remains the Windows/macOS/Linux distribution target until native-only features justify another wrapper.
- Full transitive npm locking remains pending a successful clean npm resolution.
- The 100,000-task import boundary is a corruption/abuse ceiling, not a promise that all devices can filter 100,000 tasks with identical latency. Rendering is now bounded to 100 cards per page; deeper filtering/IndexedDB benchmarks remain future measured optimization work.

## Open issues / next exact tasks

1. Re-check RC2 PR #12 workflow head `b42360a53bc3ca07ff70bc0004cffc4dedf67174`.
2. Re-check E2E run `32217410418` until GitHub reports `completed` with an explicit conclusion.
3. Re-check CI run `32217410493` until GitHub reports `completed` with an explicit conclusion.
4. Re-check CodeQL run `32217410364` until GitHub reports `completed` with an explicit conclusion.
5. If any run fails, fetch the failed job steps/logs, fix the specific reported defect, add/regress tests, update this handoff, synchronize the verification branch, and rerun only what is necessary.
6. If all RC2 checks pass, merge PR #12 only if its verification document is still useful on `main`; otherwise close it after recording results. Do not use mergeability alone as proof of quality.
7. Obtain a successful clean npm registry resolution and generate/commit the real `package-lock.json`; do not hand-write or fabricate it.
8. Run the full documented quality suite from a clean dependency install: formatting, lint, TypeScript, Vitest, production build, dependency audit, and Playwright.
9. Run a production preview/browser smoke test after the build passes.
10. Capture the real screenshot set specified by `docs/screenshots/README.md` using fictional task data.
11. Update `CHANGELOG.md` and this file with final green run IDs/results and release screenshot/lockfile status.
12. Verify README badges reflect real workflows and do not imply a passing state if checks are failing.
13. Review branch-protection settings against `docs/github.md` and require the real CI/E2E/CodeQL checks before release-oriented merges.
14. Tag `v0.1.0` only after every Definition of Done release gate is genuinely satisfied.

## Migration notes

- IndexedDB v1: base `tasks` and `settings` stores.
- IndexedDB v2: adds/normalizes reminder-aware fields, tags, project, recurrence, and indexes including multi-entry tags.
- Browser migration E2E seeds legacy data and opens the current application against it.
- Task JSON backup schema remains version 2.
- Unsupported backup schema versions are rejected.
- CSV is an interchange format, not a full-fidelity historical backup. Imported completed/archived CSV tasks receive current import timestamps rather than preserving unavailable original history.

## Release notes draft

TaskMint v0.1.0 is an offline-first, privacy-focused task manager built with React, TypeScript, Vite, Dexie/IndexedDB, and PWA tooling. It includes complete task lifecycle management; priorities, due dates, reminders, tags, projects, notes, and recurrence; smart views, search, filters, sorting, drag-and-drop and keyboard ordering; global `Ctrl/Cmd+K` search and `N` new-task shortcuts; strict JSON/CSV data portability; transactional local persistence; progressive large-list rendering; productivity statistics; responsive light/dark/system themes; onboarding and Settings; optional reminders; local-data deletion; externalized English product strings; accessibility hardening; migration coverage; parser stress tests; offline, keyboard, backup/restore, accessibility and pagination E2E tests; CodeQL/CI/E2E/release automation; and complete open-source security/privacy/contribution/release documentation.

The release must remain untagged until hosted CI/E2E/CodeQL, a real clean dependency installation/lockfile, production build/browser verification, and real screenshot capture are complete.

## Meaningful commit history from this continuation

### Data/domain/import hardening

- `64d4dad6c01615115d751c192a7bd2127957bd22` — `refactor: centralize task data limits`
- `06e2b75116a18e67134676bfe54a513e4b59e830` — `fix: enforce task limits in domain logic`
- `7e8f9cebc5c8ce488efbf45b37d2a4043eb59f3d` — `fix: reject oversized backup fields`
- `ecb46717de0db307c4a91672e33757add676133f` — `refactor: share task limits with composer`
- `b1ab13e7ebaedd9763b2a4fb71ded70fdcad9b79` — `test: cover domain limits and visible reordering`
- `496f630d59702653953f924efb78f140242165d2` — `fix: reorder only visible drag targets`
- `00dc676d5d0d83fe491e3daa19dd71358c36fb36` — `fix: validate CSV imports strictly`
- `8f34e264a0b93c35ab797463d2209870501669ab` — `test: cover malformed CSV imports`
- `ac81cc5275a88585306b1721334b36f9b3abc543` — `fix: surface local persistence failures`

### Localization/i18n migration

- `6cc3c3e8124e61b1b768ad578bef04493fbd31e9` — `refactor: expand English string catalog`
- `d44499f305b63401638e5e030f1e6952a236357f` — `refactor: externalize sidebar strings`
- `3bb55c1ebcac8dc06093e097a84c99fce53cb5b3` — `refactor: externalize statistics strings`
- `32d0a3b73b09dd3ebd752d72d366751ac944c497` — `refactor: externalize task item strings`
- `734f44c5213aeb6bf9cbf58480576d1c7646e606` — `refactor: externalize toolbar strings`
- `0985003dd33b5e6f5a00301d8c57fa7910584085` — `refactor: externalize composer strings`
- `a45e314ed00dc3eab2a370f8d3afe616f23002c3` — `refactor: add remaining interface strings`
- `90761f87b561218fcdca383bc2ad000b9d32a518` — `refactor: externalize onboarding strings`
- `680391b248b18eec04ac8c2fca860b793fca70fd` — `refactor: externalize fatal error strings`
- `b3571513d272a7ad011cbee247dc99302f206b31` — `refactor: externalize settings strings`

### Keyboard productivity

- `438b93f750b69ef067ba519b98e09da50456dc75` — `feat: expose search keyboard shortcut`
- `0d63f59943940a8a43d5b5a46c71477cf3ca4efc` — `feat: expose new task keyboard shortcut`
- `dcc38263e2e9fa2ea8500bef011b1e1bcc499d2f` — `feat: add global keyboard shortcut resolver`
- `b337f9654b7294f1cba62c4779bb1dc7ae2157c8` — `test: cover global keyboard shortcuts`
- `44676c5c8355ffe6f1f4dffdfa5f9439662303c6` — `feat: add global task and search shortcuts`
- `84cb6ca2f538d4c89f9708e7171760ac2f5920bf` — `style: add keyboard shortcut and field hints`
- `35b9c38c4b417200a2e6cc781e7960590d6160d8` — `test: add keyboard shortcut end-to-end coverage`
- `61acffb1b1d7ad849992817d90a8981e1155df80` — `test: avoid platform global in shortcut E2E`

### Backup/large-list/accessibility testing and performance

- `14fcdc47106d35792fc7f67b7a3b75d92ee5d2d2` — `test: add JSON backup restore end-to-end coverage`
- `6fd065adcc24df42d9dffe5a158b2a313ec2659e` — `ci: run E2E on main and cancel superseded runs`
- `e2ff070d250f76a43d3e4e40ca41859acb18ba1e` — `perf: define bounded task page size`
- `4ce58e13d60866d44bf256ff1a00f815e9015d3f` — `perf: add paginated task list strings`
- `a0db07df6672e0bf5736c2922165e1e57821428d` — `refactor: remove page size from localized copy`
- `1af9445f9b7e56344ade3b7b255ac1bc494c4f94` — `perf: paginate large task result sets`
- `895393e9b1247468a2ce82390b8c9c67d359b864` — `fix: enforce touch target sizing`
- `f183a8402423edb16af6322a54dc24e21ca9bf59` — `test: cover large list pagination`
- `b300df6a05ceecb1cf65d4756def7a557c0c98b0` — `test: stress CSV round trips deterministically`
- `00d6da6010977f6581a6f2845c7120e1f0d8b19b` — `test: add accessibility browser smoke coverage`

### Documentation/governance from this continuation

- `768ae1dfddfa519edcc8eae1f73baf954bee2470` — `docs: document shortcuts and large list behavior`
- `1e6e791c63d664ac6ada15c13ce51c5e1a3a983f` — `docs: expand automated test matrix`
- `a7c75979e199fe8eacf2ffc0e0a06b81e2cc6778` — `docs: document progressive large list rendering`
- `b3bdf99cf820ef1c3018a290abec266966461b7f` — `docs: document keyboard and touch accessibility`
- `9158f1cb3c83c0a4a70ba4bf5acf3d13b42dd884` — `docs: update architecture for limits i18n and pagination`
- `407bdddcfaa3a3ff24775a2981195cb0f0e8ca17` — `docs: document parser stress and accessibility tests`
- `c362427106d0b0c453243b2199b3359857bab789` — `docs: add localization and limit development rules`
- `d523e84174715fae62c12ed5c217208ae05b62a8` — `docs: document strict import security boundaries`
- `0605dae493c8e2dcd25f43d8c234dcc0e0a3c5a2` — `docs: update release candidate roadmap`
- `8f936cb30c699f6db296466eeb6ff645651d9c03` — `docs: record second release candidate hardening pass`

### Notification hardening

- `05ab4cb2ae3589ed80a894aff42e42ca4b3ff24b` — `refactor: externalize notification title`
- `b9313b93f938488e732e289e1d65a270b8a6ada8` — `fix: isolate notification delivery failures`
- `5137526611b44f96c645a5c869fea5ecb94287a6` — `test: cover notification delivery isolation`
- `353be57af3cdafaa6bc8cb6b4ded412ec8b51448` — `test: assert failed notifications with Set semantics`
- `6bfcbc7a0612b7a5302f1bbd2f932dba09c8d7cb` — `docs: add notification regression coverage`
- `8f37c22f85d632ed997f3634068e4b148e27d6ec` — `docs: record notification delivery hardening`

### RC2 verification branch commits

- `27bb8e8feac33c7336557d8e84bed35fd5e5cefa` — `docs: add rc2 verification checklist`
- `b42360a53bc3ca07ff70bc0004cffc4dedf67174` — `test: resync rc2 verification trigger`

## Definition-of-Done status

### Implemented/source-complete

- Core product feature set.
- Offline-first persistence.
- Versioned migrations.
- Import/export/backup/delete flows.
- Accessibility baseline and keyboard alternatives.
- Responsive theme system.
- Error/loading/offline/empty/success states.
- Security/privacy policies and input boundaries.
- Documentation/governance baseline.
- Unit/component/integration-style domain coverage.
- Browser E2E source coverage for primary journeys, migration, backup/restore, shortcuts, pagination, and accessibility smoke behavior.
- CI/CodeQL/E2E/release workflow definitions.

### Not yet eligible to mark complete

- Hosted RC2 CI conclusion is not yet successful.
- Hosted RC2 E2E conclusion is not yet successful.
- Hosted RC2 CodeQL conclusion is not yet successful.
- Clean real npm registry installation is unavailable in this sandbox.
- Real `package-lock.json` has not been generated.
- Dependency-backed production build has not been completed in this sandbox.
- Real release screenshots have not been captured.
- Final clean-checkout release verification has not been proven.
- `v0.1.0` has therefore intentionally not been tagged.
