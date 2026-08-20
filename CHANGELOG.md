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
- Strict shared datetime parser for reminder/backup timestamp validation.
- Safe-integer manual-order utilities with deterministic ID tie-breaking and duplicate-slot normalization.
- Stable typed `TaskMintError` codes/details for task, backup, CSV, and import validation failures.
- Safe UI error formatting that exposes known validation failures while hiding unknown browser/IndexedDB infrastructure messages.
- Fail-closed startup recovery when persisted IndexedDB task/settings records cannot be validated safely.
- Explicit PWA waiting-update prompt with user-controlled Update now/Later actions.
- Externalized English UI string catalog for localization readiness.
- Theme, reduced-motion, onboarding, responsive layout, About/support/funding UI, and local-data deletion.
- Unit, component, data-portability, deterministic CSV stress/property, strict datetime/quoting/compatibility, typed-error, logger-privacy, PWA-config, download-lifecycle, repository, release-guard, keyboard, notification, CSP, migration, corrupt-local-data, offline, backup/restore, accessibility, pagination, and Chromium E2E coverage.
- Component regression coverage for task-composer submission locks, task-row mutation locks, onboarding completion locks, serialized Settings actions, and PWA update activation locks.
- Reusable exclusive-mutation gate with utility and App-level cross-row concurrency regression coverage.
- Focused Sidebar and Toolbar accessibility regressions for current-state, navigation-landmark, and named filter-group semantics.
- Seeded deterministic data-portability properties covering hundreds of parser-sensitive CSV/JSON round trips.
- Repeatable Vitest 4 benchmark harness for 10,000-task filtering/sorting and productivity statistics.
- Dependency-free Markdown relative-link validation through `npm run docs:check`.
- Dependency-free tracked-file/test documentation completeness validation through `npm run docs:inventory`.
- Machine-audited `docs/file-index.md` covering every tracked repository path and `docs/test-matrix.md` covering every current test/E2E/benchmark/shared-test-setup path.
- Complete end-user guide, data model/portability reference, operations handbook, test matrix, detailed repository ownership map, documentation index, and expanded setup/development/testing/accessibility/performance/release/troubleshooting/GitHub governance guides.
- Architecture Decision Records for persistence-boundary validation, exclusive task mutation serialization, and explicitly versioned data portability.
- Dependency-free common secret-pattern defense-in-depth scanning through `npm run secrets:check`.
- Dependency-free release readiness guard through `npm run release:check -- vX.Y.Z`.
- CI, E2E, CodeQL, Dependabot, and release workflows.
- CI/CodeQL/E2E concurrency controls that cancel superseded runs on the same ref.
- Tagged-release SHA-256 checksum generation for the packaged web artifact.
- Security, privacy, accessibility, performance, release, troubleshooting, architecture, GitHub governance, and complete repository documentation.
- Keyboard focus trapping/restoration for onboarding and Settings dialogs.
- Package-derived version display in the About section.

### Fixed

- Use the pinned Vitest 4 top-level `bench()` API rather than a later fixture-style benchmark API.
- Reject impossible reminder and backup timestamps before JavaScript `Date` can normalize them into a different calendar date.
- Reject malformed backup timestamps, impossible dates, invalid settings values, unsafe/non-integer task order values, duplicate backup task IDs, and oversized backup fields before restoring data.
- Validate current IndexedDB tasks/settings on startup and block normal editing non-destructively if local data cannot be loaded safely.
- Validate task/settings records at the repository write boundary before they can enter IndexedDB, including full-batch validation before bulk/replacement transactions begin.
- Validate and normalize complete backup objects before opening the destructive restore transaction, so malformed restore input cannot reach the clear/write phase.
- Reject duplicate task IDs in repository bulk batches before opening a transaction instead of allowing last-write-wins behavior.
- Reject malformed CSV enums, dates/timestamps, duplicate headers, unsupported TaskMint encoding versions, malformed structured tag payloads, invalid quote placement, and unterminated quoted fields instead of silently coercing invalid records.
- Preserve unmarked legacy CSV tag text beginning with `json:` instead of misinterpreting it as TaskMint's structured encoding.
- Accept a UTF-8 BOM on the first CSV header while retaining strict schema validation.
- Preserve tags containing the legacy `|` separator by using a versioned `json:` tag-cell encoding in new CSV exports while keeping legacy imports compatible.
- Reversibly neutralize spreadsheet-formula prefixes, including whitespace-prefixed formulas, in exported task titles, notes, and project fields without altering legacy CSV import semantics.
- Prevent arbitrary infrastructure exception messages from being wrapped into known CSV validation errors.
- Preserve original CSV record numbers when blank records are skipped so row-aware validation errors still point to the actual source record.
- Count only nonblank CSV records toward the task-count import limit while retaining the independent file-size guard.
- Rebase CSV-import manual-order values after the existing maximum order and allocate imported rows contiguously, preventing valid merges from introducing duplicate order slots.
- Wrap malformed JSON parsing in a stable safe TaskMint backup error rather than exposing engine-specific parser text.
- Preserve recurring reminder schedules for recurring tasks that do not have a due date.
- Allocate the next recurring occurrence from the next collision-free task-order slot supplied by the App rather than relying on clock milliseconds.
- Bound each reminder polling pass to five individual title-bearing notifications plus one count-only summary for excess due reminders; failed individual/summary deliveries remain retryable.
- Reject impossible calendar dates during normal task creation/update instead of silently dropping them.
- Make every multi-task `putTasks` persistence operation explicitly transactional so import/reorder/recurring-completion failures cannot leave a partially written successful subset.
- Surface IndexedDB failures for task create/edit/complete/reopen/archive/restore/delete/undo/reorder and local-data deletion before mutating React state.
- Serialize task composer submissions while a save is pending so rapid repeat submit actions cannot create/update the same logical task twice.
- Serialize task-row completion/reopen/archive/restore/delete/reorder/drop mutations while one mutation is pending, preventing duplicate recurring occurrences and competing row writes.
- Serialize task mutations across the whole App while persistence is pending so different task cards, the composer, undo, reordering, and global entry points cannot race stale task snapshots.
- Ensure the exclusive mutation gate releases even when entering the busy UI state throws, preserving fail-safe retryability.
- Serialize onboarding completion, Settings/data actions, and PWA update activation while their persistence/update operations are pending.
- Guard Settings close/Escape/backdrop dismissal with the synchronous action lock so even same-tick input cannot dismiss a pending operation.
- Clear selected JSON/CSV import input values before awaiting asynchronous import work so choosing the same file again never depends on the previous promise settling.
- Reset reminder-notification suppression only after a changed reminder is successfully persisted, preventing a failed edit from re-notifying the unchanged old reminder.
- Reset the task composer after an edit so stale edited values cannot become an accidental new task.
- Use the same deterministic manual-order comparator for list rendering, keyboard moves, and drag reordering.
- Normalize duplicate persisted/restored order slots while preserving their deterministic visible order so later reordering does not become a no-op.
- Reject order arithmetic that could overflow or lose integer precision.
- Limit drag-and-drop and keyboard reorder controls to manual sort mode and to currently rendered/visible task slots.
- Reset reminder-notification suppression when a successfully saved reminder changes or a backup is restored.
- Confirm destructive JSON backup restores before replacing existing local tasks.
- Keep task-card rendering bounded after large imports and reset progressive pagination when search/filter/sort criteria change.
- Refresh Today/Upcoming/Overdue calculations and productivity statistics while the app remains open, including after focus/visibility returns across a date rollover.
- Exclude completion timestamps after the supplied current time from the seven-day completion statistic.
- Normalize persisted/restored tags with locale-independent Unicode lowercase so stored canonical values do not vary by host locale.
- Defer export object-URL revocation until after the download click turn for broader browser compatibility.
- Contain synchronous browser export failures behind safe Settings error copy and clear stale Settings errors after closing/reopening the dialog.
- Centralize Vitest cleanup for DOM state, fake timers, mock histories, stubbed globals, and spies so tests cannot leak state into later cases.
- Stop development error logging from printing arbitrary `Error.message` text; diagnostics now contain only a coarse kind or stable TaskMint error code.
- Make development event logging fail closed: unknown strings, nested objects/arrays, and explicitly sensitive metadata keys are redacted; only booleans/numbers/null and validated identifier strings are retained.
- Restrict logger identifier-key recognition to explicit `id`, camel/Pascal `...Id`/`...ID`, and snake-case `..._id` forms so ordinary words ending in `id` cannot accidentally expose string metadata.
- Expose active smart views/projects with `aria-current`, keep project selectors inside the Sidebar navigation landmark, and expose the search/filter controls as a named accessibility group.
- Replace PWA `autoUpdate` with the supported prompt/waiting flow so new service workers cannot automatically reload over an unsaved task draft; the explicit update action now activates the waiting worker through `updateServiceWorker(true)`.
- Raise the complete/reopen and mobile action controls to the documented touch-target baseline.
- Keep the committed production CSP at `style-src 'self'` and `connect-src 'self'`; Vite-only inline-style/WebSocket allowances are now injected only by the development server.
- Keep executable scripts restricted to the application origin and continue blocking objects, foreign base URLs, and foreign form submissions.
- Satisfy strict TypeScript override checks in the React error boundary.
- Include E2E and benchmark TypeScript files plus PWA React module types in the type-aware project and scope type-aware ESLint away from maintenance scripts.
- Correct documentation that could imply current IndexedDB indexes power every smart-view query; the current implementation primarily filters/sorts the validated in-memory task set.
- Synchronize security/privacy documentation with repository write validation, App-wide task mutation serialization, and the fail-closed diagnostic metadata allowlist.

### Documentation

- Added `docs/README.md` as the complete documentation navigation hub.
- Added `docs/user-guide.md` for the full product/user workflow.
- Added `docs/data-model.md` as the human-readable Task/Settings/Backup/IndexedDB/JSON/CSV contract.
- Added `docs/operations.md` for npm scripts, CI/E2E/CodeQL/release, lockfile, CSP/PWA, and exact-SHA operations.
- Added `docs/test-matrix.md` mapping every automated test/E2E/benchmark/shared setup file to protected behavior.
- Added `docs/file-index.md` as the exact tracked-path inventory checked against `git ls-files`.
- Reconciled `docs/repository-reference.md` as the detailed ownership/coupling guide, with exact path exhaustiveness delegated to the machine-audited file index.
- Expanded README, CONTRIBUTING, setup, development, architecture, testing, accessibility, performance, release, troubleshooting, support, security, privacy, GitHub governance, and screenshot policy so they agree with current RC7 implementation and verification rules.
- Preserved the previous RC6 continuation handoff unchanged under `docs/handoffs/` rather than discarding project history.

### Release hardening

- `npm run check` now includes formatting invariants, documentation-link validation, complete documentation inventory validation, secret-pattern validation, linting, TypeScript checks, unit/component/property/config tests, and the production build.
- Pull-request CI runs the documentation inventory explicitly in addition to the repository hygiene/lint/type/test/build/audit gates and automatically switches to `npm ci` once a lockfile is committed.
- Documentation inventory fails if any tracked path is absent from `docs/file-index.md` or any current test/E2E/benchmark/shared-test-setup path is absent from `docs/test-matrix.md`.
- E2E workflow dependency installation also automatically switches to `npm ci` once a lockfile is committed.
- Core workflow actions are upgraded to current supported majors: checkout/setup-node v6, upload-artifact v7, and CodeQL v4; Dependabot continues monitoring GitHub Actions monthly.
- Tagged releases fail closed unless the Git tag exactly matches `package.json` and a committed `package-lock.json` exists.
- Tagged releases install dependencies with `npm ci --ignore-scripts`, then must pass `npm run check`, `npm audit --audit-level=high`, Chromium installation, and Playwright E2E before publication.
- Tagged releases publish both the compressed web bundle and its SHA-256 checksum.
- A future generated lockfile and real screenshot files must themselves be added to the tracked-file documentation inventory before release.
- A real npm-generated `package-lock.json` remains required before the first release and will not be fabricated while registry access is unavailable.
- Real release screenshots remain required from a browser-verified build and will not be fabricated.

### Release candidate status

The package version is `0.1.0`, but no `v0.1.0` release tag has been created. Promote these Unreleased changes to `0.1.0` only after the current documentation/hardening branch is successfully verified and merged, then the resulting exact `main` tree receives required successful hosted verification; a clean npm installation produces the real lockfile; locked check/audit/E2E and the manual release checklist pass; and real release screenshots are captured and documented.
