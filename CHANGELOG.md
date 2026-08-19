# Changelog

All notable changes to TaskMint are documented here.

The project follows Semantic Versioning for tagged releases.

## [Unreleased]

### Added

- Production-oriented React/TypeScript/PWA application baseline.
- Offline IndexedDB persistence with explicit schema versions and an automated v1-to-v2 browser migration test.
- Full task lifecycle, projects, tags, priorities, notes, due dates, reminders, and recurrence.
- Smart views, search, filters, sorting, drag-and-drop, and keyboard ordering controls.
- JSON backup/restore and CSV import/export.
- Theme, reduced-motion, onboarding, responsive layout, About/support/funding UI, and local-data deletion.
- Unit, component, data-portability, migration, and Chromium E2E test suites.
- CI, E2E, CodeQL, Dependabot, and release workflows.
- CI/CodeQL concurrency controls that cancel superseded runs on the same ref.
- Security, privacy, accessibility, performance, release, troubleshooting, architecture, and GitHub governance documentation.
- Keyboard focus trapping/restoration for onboarding and Settings dialogs.
- Package-derived version display in the About section.

### Fixed

- Reject malformed backup timestamps, impossible dates, invalid settings values, invalid task order values, and duplicate backup task IDs before restoring data.
- Preserve recurring reminder schedules for recurring tasks that do not have a due date.
- Reject impossible calendar dates during normal task normalization.
- Persist a recurring task completion and its generated next occurrence atomically.
- Reset the task composer after an edit so stale edited values cannot become an accidental new task.
- Limit drag-and-drop and keyboard reorder controls to manual sort mode and use the visible task sequence for keyboard movement.
- Reset reminder-notification suppression when a reminder is edited or a backup is restored.
- Confirm destructive JSON backup restores before replacing existing local tasks.
- Allow Vite's injected development styles under the Content Security Policy while keeping scripts restricted to the application origin.
- Satisfy strict TypeScript override checks in the React error boundary.
- Include E2E TypeScript files in the type-aware project and scope type-aware ESLint away from maintenance scripts.

### Release candidate status

The package version is `0.1.0`, but no `v0.1.0` release tag has been created. Promote these Unreleased changes to `0.1.0` only after hosted CI, E2E, CodeQL, production-build, and release verification complete successfully.
