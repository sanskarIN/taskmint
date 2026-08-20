# TaskMint Complete File Index

This is the compact exhaustive inventory used by `scripts/check-doc-inventory.mjs` to ensure documentation does not silently skip tracked repository files.

For responsibilities and coupling, read `repository-reference.md`. For tests specifically, read `test-matrix.md`.

The inventory intentionally includes documentation and the inventory/checker files themselves.

## Root

- `.editorconfig`
- `.env.example`
- `.gitattributes`
- `.gitignore`
- `.prettierignore`
- `.prettierrc.json`
- `CHANGELOG.md`
- `CODE_OF_CONDUCT.md`
- `CONTRIBUTING.md`
- `LICENSE`
- `PRIVACY.md`
- `README.md`
- `ROADMAP.md`
- `SECURITY.md`
- `SUPPORT.md`
- `eslint.config.js`
- `index.html`
- `package.json`
- `playwright.config.ts`
- `tsconfig.app.json`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `what_changed.md`

## GitHub automation and templates

- `.github/FUNDING.yml`
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/dependabot.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/e2e.yml`
- `.github/workflows/native.yml`
- `.github/workflows/release.yml`

## Benchmarks

- `bench/task.bench.ts`

## Documentation

- `docs/README.md`
- `docs/accessibility.md`
- `docs/adr/0001-local-first-pwa.md`
- `docs/adr/0002-dexie-repository.md`
- `docs/adr/0003-validation-persistence-boundaries.md`
- `docs/adr/0004-exclusive-task-mutations.md`
- `docs/adr/0005-versioned-data-portability.md`
- `docs/architecture.md`
- `docs/cross-platform.md`
- `docs/data-model.md`
- `docs/development.md`
- `docs/file-index.md`
- `docs/github.md`
- `docs/handoffs/what_changed-rc6-2026-08-19.md`
- `docs/master-prompt.md`
- `docs/operations.md`
- `docs/performance.md`
- `docs/release.md`
- `docs/repository-reference.md`
- `docs/screenshots/README.md`
- `docs/setup.md`
- `docs/test-matrix.md`
- `docs/testing.md`
- `docs/troubleshooting.md`
- `docs/user-guide.md`

## End-to-end browser tests

- `e2e/accessibility.spec.ts`
- `e2e/backup-restore.spec.ts`
- `e2e/corrupt-local-data.spec.ts`
- `e2e/keyboard.spec.ts`
- `e2e/migration.spec.ts`
- `e2e/pagination.spec.ts`
- `e2e/task-flow.spec.ts`

## Public assets

- `public/taskmint-icon.svg`

## Maintenance scripts

- `scripts/check-doc-inventory.mjs`
- `scripts/check-doc-links.mjs`
- `scripts/check-format.mjs`
- `scripts/check-release.mjs`
- `scripts/check-secrets.mjs`

## Native application shell

- `src-tauri/Cargo.toml`
- `src-tauri/build.rs`
- `src-tauri/capabilities/desktop.json`
- `src-tauri/capabilities/mobile.json`
- `src-tauri/icons/128x128.png`
- `src-tauri/icons/128x128@2x.png`
- `src-tauri/icons/32x32.png`
- `src-tauri/icons/icon.icns`
- `src-tauri/icons/icon.ico`
- `src-tauri/icons/icon.png`
- `src-tauri/src/lib.rs`
- `src-tauri/src/main.rs`
- `src-tauri/tauri.conf.json`

## Application root source

- `src/App.tsx`
- `src/config.ts`
- `src/main.tsx`
- `src/platform.css`
- `src/styles.css`

## Components

- `src/components/ErrorBoundary.tsx`
- `src/components/Onboarding.tsx`
- `src/components/PwaUpdatePrompt.css`
- `src/components/PwaUpdatePrompt.tsx`
- `src/components/SettingsDialog.tsx`
- `src/components/Sidebar.tsx`
- `src/components/StatsPanel.tsx`
- `src/components/TaskComposer.tsx`
- `src/components/TaskItem.tsx`
- `src/components/Toolbar.tsx`

## Domain

- `src/domain/datetime.ts`
- `src/domain/errors.ts`
- `src/domain/limits.ts`
- `src/domain/order.ts`
- `src/domain/task.ts`
- `src/domain/types.ts`
- `src/domain/validation.ts`

## Localization

- `src/i18n/en.ts`
- `src/i18n/errors.ts`

## Platform adapters

- `src/platform/files.ts`
- `src/platform/links.ts`
- `src/platform/runtime.ts`

## Storage

- `src/storage/db.ts`
- `src/storage/repository.ts`

## Shared test setup

- `src/test/setup.ts`

## Utilities

- `src/utils/export.ts`
- `src/utils/keyboard.ts`
- `src/utils/logger.ts`
- `src/utils/mutation.ts`
- `src/utils/notifications.ts`

## Unit/component/config/property tests

- `tests/AppMutation.test.tsx`
- `tests/Onboarding.test.tsx`
- `tests/PwaUpdatePrompt.test.tsx`
- `tests/SettingsDialog.test.tsx`
- `tests/Sidebar.test.tsx`
- `tests/TaskComposer.test.tsx`
- `tests/TaskItem.test.tsx`
- `tests/Toolbar.test.tsx`
- `tests/csv-compat.test.ts`
- `tests/csv-quoting.test.ts`
- `tests/csv-security.test.ts`
- `tests/datetime.test.ts`
- `tests/download.test.ts`
- `tests/errors.test.ts`
- `tests/export.test.ts`
- `tests/keyboard.test.ts`
- `tests/logger.test.ts`
- `tests/mutation.test.ts`
- `tests/native-config.test.ts`
- `tests/notifications.test.ts`
- `tests/order.test.ts`
- `tests/property.test.ts`
- `tests/pwa-config.test.ts`
- `tests/release-guard.test.ts`
- `tests/repository.test.ts`
- `tests/security-config.test.ts`
- `tests/task.test.ts`
- `tests/validation-order.test.ts`

## Inventory maintenance rule

Whenever a tracked file is added, removed, or renamed:

1. update this file;
2. update `repository-reference.md` when responsibilities/coupling change;
3. update `test-matrix.md` for any test/E2E/benchmark/support test file change;
4. run `npm run docs:inventory`;
5. run `npm run docs:check`;
6. commit the file and documentation update together.
