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
- Externalized English UI string catalog for localization readiness.
- Theme, reduced-motion, onboarding, responsive layout, About/support/funding UI, and local-data deletion.
- Unit, component, data-portability, deterministic CSV stress, keyboard, notification, migration, offline, backup/restore, accessibility, pagination, and Chromium E2E coverage.
- CI, E2E, CodeQL, Dependabot, and release workflows.
- CI/CodeQL/E2E concurrency controls that cancel superseded runs on the same ref.
- Security, privacy, accessibility, performance, release, troubleshooting, architecture, and GitHub governance documentation.
- Keyboard focus trapping/restoration for onboarding and Settings dialogs.
- Package-derived version display in the About section.

### Fixed

- Reject malformed backup timestamps, impossible dates, invalid settings values, invalid task order values, duplicate backup task IDs, and oversized backup fields before restoring data.
- Reject malformed CSV enums, dates, duplicate headers, and unterminated quoted fields instead of silently coercing invalid records.
- Accept a UTF-8 BOM on the first CSV header while retaining strict schema validation.
- Preserve recurring reminder schedules for recurring tasks that do not have a due date.
- Isolate browser notification-constructor failures so one failed notification cannot escape the reminder polling loop; failed deliveries remain eligible for a later retry.
- Reject impossible calendar dates during normal task creation/update instead of silently dropping them.
- Persist a recurring task completion and its generated next occurrence atomically.
- Surface IndexedDB failures for task create/edit/complete/reopen/archive/restore/delete/undo/reorder and local-data deletion before mutating React state.
- Reset the task composer after an edit so stale edited values cannot become an accidental new task.
- Limit drag-and-drop and keyboard reorder controls to manual sort mode and to currently rendered/visible task slots.
- Reset reminder-notification suppression when a reminder is edited or a backup is restored.
- Confirm destructive JSON backup restores before replacing existing local tasks.
- Keep task-card rendering bounded after large imports and reset progressive pagination when search/filter/sort criteria change.
- Raise the complete/reopen and mobile action controls to the documented touch-target baseline.
- Allow Vite's injected development styles under the Content Security Policy while keeping scripts restricted to the application origin.
- Satisfy strict TypeScript override checks in the React error boundary.
- Include E2E TypeScript files in the type-aware project and scope type-aware ESLint away from maintenance scripts.

### Release candidate status

The package version is `0.1.0`, but no `v0.1.0` release tag has been created. Promote these Unreleased changes to `0.1.0` only after hosted CI, E2E, CodeQL, production-build, dependency-audit, and release verification complete successfully.
