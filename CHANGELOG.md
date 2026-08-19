# Changelog

All notable changes to TaskMint are documented here.

The project follows Semantic Versioning for tagged releases.

## [Unreleased]

### Added

- Production-oriented React/TypeScript/PWA application baseline.
- Offline IndexedDB persistence with explicit schema versions and an automated v1-to-v2 browser migration test.
- Full task lifecycle, projects, tags, priorities, notes, due dates, reminders, and recurrence.
- Smart views, search, filters, sorting, drag-and-drop, and keyboard ordering controls.
- `Ctrl/Cmd+K` global search and `N` new-task shortcuts with typing/modal safeguards and `aria-keyshortcuts` metadata.
- Progressive 100-card rendering for large matching task sets with explicit load-more controls.
- JSON backup/restore and CSV import/export.
- Shared task/import limits used by domain validation, backup validation, CSV import, and UI affordances.
- Stable typed `TaskMintError` codes/details for task, backup, CSV, and import validation failures.
- Safe UI error formatting that exposes known validation failures while hiding unknown browser/IndexedDB infrastructure messages.
- Externalized English UI string catalog for localization readiness.
- Theme, reduced-motion, onboarding, responsive layout, About/support/funding UI, and local-data deletion.
- Unit, component, data-portability, deterministic CSV stress/property, typed-error, download-lifecycle, repository, release-guard, keyboard, notification, CSP, migration, offline, backup/restore, accessibility, pagination, and Chromium E2E coverage.
- Seeded deterministic data-portability properties covering hundreds of parser-sensitive CSV/JSON round trips.
- Repeatable Vitest benchmark harness for 10,000-task filtering/sorting and productivity statistics.
- Dependency-free Markdown relative-link validation through `npm run docs:check`.
- Dependency-free common secret-pattern defense-in-depth scanning through `npm run secrets:check`.
- Dependency-free release readiness guard through `npm run release:check -- vX.Y.Z`.
- CI, E2E, CodeQL, Dependabot, and release workflows.
- CI/CodeQL/E2E concurrency controls that cancel superseded runs on the same ref.
- Tagged-release SHA-256 checksum generation for the packaged web artifact.
- Security, privacy, accessibility, performance, release, troubleshooting, architecture, and GitHub governance documentation.
- Keyboard focus trapping/restoration for onboarding and Settings dialogs.
- Package-derived version display in the About section.

### Fixed

- Reject malformed backup timestamps, impossible dates, invalid settings values, invalid task order values, duplicate backup task IDs, and oversized backup fields before restoring data.
- Reject malformed CSV enums, dates, duplicate headers, malformed structured tag payloads, and unterminated quoted fields instead of silently coercing invalid records.
- Accept a UTF-8 BOM on the first CSV header while retaining strict schema validation.
- Preserve tags containing the legacy `|` separator by using a versioned `json:` tag-cell encoding in new CSV exports while keeping legacy imports compatible.
- Reversibly neutralize spreadsheet-formula prefixes in exported task titles, notes, and project fields without altering legacy CSV import semantics.
- Wrap malformed JSON parsing in a stable safe TaskMint backup error rather than exposing engine-specific parser text.
- Preserve recurring reminder schedules for recurring tasks that do not have a due date.
- Isolate browser notification-constructor failures so one failed notification cannot escape the reminder polling loop; failed deliveries remain eligible for a later retry.
- Reject impossible calendar dates during normal task creation/update instead of silently dropping them.
- Make every multi-task `putTasks` persistence operation explicitly transactional so import/reorder/recurring-completion failures cannot leave a partially written successful subset.
- Surface IndexedDB failures for task create/edit/complete/reopen/archive/restore/delete/undo/reorder and local-data deletion before mutating React state.
- Reset reminder-notification suppression only after a changed reminder is successfully persisted, preventing a failed edit from re-notifying the unchanged old reminder.
- Reset the task composer after an edit so stale edited values cannot become an accidental new task.
- Limit drag-and-drop and keyboard reorder controls to manual sort mode and to currently rendered/visible task slots.
- Reset reminder-notification suppression when a successfully saved reminder changes or a backup is restored.
- Confirm destructive JSON backup restores before replacing existing local tasks.
- Keep task-card rendering bounded after large imports and reset progressive pagination when search/filter/sort criteria change.
- Refresh Today/Upcoming/Overdue calculations and productivity statistics while the app remains open, including after focus/visibility returns across a date rollover.
- Normalize persisted/restored tags with locale-independent Unicode lowercase so stored canonical values do not vary by host locale.
- Defer export object-URL revocation until after the download click turn for broader browser compatibility.
- Centralize Vitest cleanup for DOM state, fake timers, mock histories, stubbed globals, and spies so tests cannot leak state into later cases.
- Raise the complete/reopen and mobile action controls to the documented touch-target baseline.
- Keep the committed production CSP at `style-src 'self'` and `connect-src 'self'`; Vite-only inline-style/WebSocket allowances are now injected only by the development server.
- Keep executable scripts restricted to the application origin and continue blocking objects, foreign base URLs, and foreign form submissions.
- Satisfy strict TypeScript override checks in the React error boundary.
- Include E2E and benchmark TypeScript files in the type-aware project and scope type-aware ESLint away from maintenance scripts.

### Release hardening

- `npm run check` includes formatting invariants, documentation-link validation, secret-pattern validation, linting, TypeScript checks, unit/component/property tests, and the production build.
- Pull-request CI runs the repository hygiene checks in addition to lint/type/test/build/audit gates and automatically switches to `npm ci` once a lockfile is committed.
- E2E workflow dependency installation also automatically switches to `npm ci` once a lockfile is committed.
- Tagged releases fail closed unless the Git tag exactly matches `package.json` and a committed `package-lock.json` exists.
- Tagged releases install dependencies with `npm ci --ignore-scripts`, then must pass `npm run check`, `npm audit --audit-level=high`, Chromium installation, and Playwright E2E before publication.
- Tagged releases publish both the compressed web bundle and its SHA-256 checksum.
- A real npm-generated `package-lock.json` remains required before the first release and will not be fabricated while registry access is unavailable.
- Real release screenshots remain required from a browser-verified build and will not be fabricated.

### Release candidate status

The package version is `0.1.0`, but no `v0.1.0` release tag has been created. Promote these Unreleased changes to `0.1.0` only after a fresh verification branch based on current `main` receives successful hosted CI, E2E, and CodeQL conclusions; a clean npm installation produces the real lockfile; the release checklist passes; and real release screenshots are captured.
