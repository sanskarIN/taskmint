# Changelog

All notable changes to TaskMint are documented here.

The project follows Semantic Versioning for tagged releases.

## [Unreleased]

### Added

- Production-oriented React/TypeScript/PWA application baseline.
- Tauri 2 native application shell sharing the React/TypeScript product core across Windows, macOS, Linux, Android, and iOS/iPadOS.
- ChromeOS installation path through the existing PWA distribution.
- Native runtime boundary under `src/platform/` for runtime detection, scoped system file dialogs, operating-system external links, and native notifications.
- Least-privilege desktop/mobile Tauri capabilities for dialog access, file metadata/text reads/writes, notifications, and URL opening without broad shell/process permissions.
- Native PNG, Windows ICO, and macOS ICNS application icons derived from the existing TaskMint logo.
- Native CI with Linux/Windows/macOS desktop checks, Android ARM64 debug build, and iOS simulator debug build lanes.
- Complete cross-platform setup/build/security/release documentation in `docs/cross-platform.md`.
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
- Seeded deterministic data-portability properties covering hundreds of parser-sensitive CSV/JSON round trips.
- Repeatable Vitest 4 benchmark harness for 10,000-task filtering/sorting and productivity statistics.
- Dependency-free Markdown relative-link validation through `npm run docs:check`.
- Dependency-free common secret-pattern defense-in-depth scanning through `npm run secrets:check`.
- Dependency-free release readiness guard through `npm run release:check -- vX.Y.Z`.
- CI, E2E, CodeQL, Dependabot, and release workflows.
- CI/CodeQL/E2E concurrency controls that cancel superseded runs on the same ref.
- Tagged-release SHA-256 checksum generation for the packaged web artifact.
- Security, privacy, accessibility, performance, release, troubleshooting, architecture, cross-platform, and GitHub governance documentation.
- Keyboard focus trapping/restoration for onboarding and Settings dialogs.
- Package-derived version display in the About section.

### Fixed

- Use native system open/save dialogs and scoped filesystem text operations in Tauri builds while retaining browser file inputs/downloads on web/PWA builds.
- Enforce the same import-size guard on native files by checking file metadata before reading contents.
- Route reminder delivery through native system notifications in Tauri builds and Web Notifications in browser builds while retaining bounded aggregation/retry behavior.
- Await reminder checks and prevent overlapping async polling passes after adding the native notification bridge.
- Open external HTTP(S), email, and telephone links through the operating system in native builds instead of trapping navigation in the app WebView.
- Disable the PWA service-worker update prompt inside native packages so native and PWA update mechanisms cannot compete.
- Make Settings reminder/privacy/update copy runtime-aware rather than incorrectly referring to every target as a browser.
- Configure Vite's fixed development port, `TAURI_DEV_HOST`, HMR host, Tauri watch exclusions, and native WebView build target behavior for desktop/mobile development.
- Use the pinned Vitest 4 top-level `bench()` API rather than a later fixture-style benchmark API.
- Reject impossible reminder and backup timestamps before JavaScript `Date` can normalize them into a different calendar date.
- Reject malformed backup timestamps, impossible dates, invalid settings values, unsafe/non-integer task order values, duplicate backup task IDs, and oversized backup fields before restoring data.
- Validate current IndexedDB tasks/settings on startup and block normal editing non-destructively if local data cannot be loaded safely.
- Reject malformed CSV enums, dates/timestamps, duplicate headers, unsupported TaskMint encoding versions, malformed structured tag payloads, invalid quote placement, and unterminated quoted fields instead of silently coercing invalid records.
- Preserve unmarked legacy CSV tag text beginning with `json:` instead of misinterpreting it as TaskMint's structured encoding.
- Accept a UTF-8 BOM on the first CSV header while retaining strict schema validation.
- Preserve tags containing the legacy `|` separator by using a versioned `json:` tag-cell encoding in new CSV exports while keeping legacy imports compatible.
- Reversibly neutralize spreadsheet-formula prefixes, including whitespace-prefixed formulas, in exported task titles, notes, and project fields without altering legacy CSV import semantics.
- Prevent arbitrary infrastructure exception messages from being wrapped into known CSV validation errors.
- Wrap malformed JSON parsing in a stable safe TaskMint backup error rather than exposing engine-specific parser text.
- Preserve recurring reminder schedules for recurring tasks that do not have a due date.
- Bound each reminder polling pass to five individual title-bearing notifications plus one count-only summary for excess due reminders; failed individual/summary deliveries remain retryable.
- Reject impossible calendar dates during normal task creation/update instead of silently dropping them.
- Make every multi-task `putTasks` persistence operation explicitly transactional so import/reorder/recurring-completion failures cannot leave a partially written successful subset.
- Surface IndexedDB failures for task create/edit/complete/reopen/archive/restore/delete/undo/reorder and local-data deletion before mutating React state.
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
- Replace PWA `autoUpdate` with the supported prompt/waiting flow so new service workers cannot automatically reload over an unsaved task draft; the explicit update action now activates the waiting worker through `updateServiceWorker(true)`.
- Raise the complete/reopen and mobile action controls to the documented touch-target baseline.
- Keep the committed production CSP at `style-src 'self'` and `connect-src 'self'`; Vite-only inline-style/WebSocket allowances are now injected only by the development server.
- Keep executable scripts restricted to the application origin and continue blocking objects, foreign base URLs, and foreign form submissions.
- Satisfy strict TypeScript override checks in the React error boundary.
- Include E2E and benchmark TypeScript files plus PWA React module types in the type-aware project and scope type-aware ESLint away from maintenance scripts.

### Release hardening

- `npm run check` includes formatting invariants, documentation-link validation, secret-pattern validation, linting, TypeScript checks, unit/component/property tests, and the production build.
- Pull-request CI runs the repository hygiene checks in addition to lint/type/test/build/audit gates and automatically switches to `npm ci` once a lockfile is committed.
- E2E workflow dependency installation also automatically switches to `npm ci` once a lockfile is committed.
- Native CI independently exercises the Rust/Tauri desktop source on Linux, Windows, and macOS and performs Android/iOS debug build lanes using vendor SDK toolchains.
- Core workflow actions are upgraded to current supported majors: checkout/setup-node v6, upload-artifact v7, and CodeQL v4; Dependabot continues monitoring GitHub Actions monthly.
- Tagged releases fail closed unless the Git tag exactly matches `package.json` and a committed `package-lock.json` exists.
- Tagged releases install dependencies with `npm ci --ignore-scripts`, then must pass `npm run check`, `npm audit --audit-level=high`, Chromium installation, and Playwright E2E before publication.
- Tagged releases publish both the compressed web bundle and its SHA-256 checksum.
- A real npm-generated `package-lock.json` remains required before the first release and will not be fabricated while registry access is unavailable.
- A real Cargo-generated `src-tauri/Cargo.lock` is also required before a reproducible native release and will not be fabricated manually.
- Native store/installer releases additionally require platform-owner signing, provisioning/notarization, and store credentials kept outside Git.
- Real release screenshots remain required from verified builds and will not be fabricated.

### Release candidate status

The package version is `0.1.0`, but no `v0.1.0` release tag has been created. Promote these Unreleased changes to `0.1.0` only after a fresh verification branch based on current `main` receives successful hosted web and native conclusions; real package-manager-generated lockfiles are reviewed; the locked check/audit/E2E/native suites and manual release checklist pass; platform signing/store requirements are completed where applicable; and real release screenshots are captured.
