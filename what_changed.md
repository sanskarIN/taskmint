# TaskMint — Work Handoff

## Current milestone

- Version: `0.1.0`
- Repository: `https://github.com/sanskarIN/taskmint`
- Default branch: `main`
- Date: 2026-08-19
- Phase status: Phases 0–5 implemented. Phase 6 local/source-level audit completed; hosted clean-network CI/E2E/CodeQL verification is queued on GitHub Actions and must complete before tagging `v0.1.0`.
- Latest merge before this handoff: `0e6d893fecd6e1526afb3ff87321fb06987e1e27` — `merge: add GitHub governance and verification tooling`.

## Completed work

### Product

- Implemented full task lifecycle: create, edit, complete, reopen, archive, restore, and delete.
- Added undo for task deletion.
- Added priorities, due dates, optional reminders, tags, projects, notes, and recurrence.
- Added daily, weekly, and monthly recurring-task generation with month-end clamping.
- Added Inbox, Today, Upcoming, Overdue, Completed, Archived, and All Tasks smart views.
- Added full-text-like local search across title, notes, project, and tags.
- Added project/tag/priority filters and manual/newest/due/priority/title sort modes.
- Added drag-and-drop reordering plus keyboard-accessible move-up/move-down controls.
- Added productivity statistics without streaks, penalties, or manipulative gamification.
- Added first-run onboarding.
- Added loading, empty, offline, transient-success, error, and fatal-render states.
- Added responsive phone/tablet/desktop layouts.
- Added light, dark, and system themes plus reduced-motion support.
- Added Settings sections for appearance, accessibility, reminders, data/privacy, updates, and About.
- Added required visible credit: `Made by the Sanskar`.
- Added GitHub, support, business-email, and Buy Me a Coffee links without intrusive funding UI.

### Persistence, reliability, and privacy

- Added Dexie/IndexedDB persistence.
- Added explicit schema versions 1 and 2.
- Added migration logic for reminder, tags, project, and recurrence fields.
- Added repository boundary so UI code does not directly manage IndexedDB transactions.
- Added transactional restore and local-data deletion operations.
- Added JSON backup/export and JSON restore/import.
- Added CSV export/import with quote/newline handling.
- Added backup schema validation, enum validation, task limits, field limits, and import file-size limits.
- Added local one-click data deletion flow with destructive-action warning.
- Added development-only structured logging with sensitive-field redaction.
- Added an application Content Security Policy in the HTML shell.
- TaskMint requires no account, application backend, API key, or production secret.

### Reminders and offline behavior

- Added opt-in browser notification permission flow.
- Added reminder checks while TaskMint is open.
- Added PWA manifest and generated service-worker configuration.
- Added offline asset caching and installable-PWA configuration.
- Added SVG application icon/source artwork.
- Documented that reliable closed-app scheduled notifications are not claimed across every browser/OS combination.

### UI/UX and accessibility

- Added centralized visual design tokens for colors, surfaces, spacing, radii, shadows, and motion.
- Added responsive application shell, sticky desktop navigation, mobile reflow, touch-friendly controls, and focus-visible styles.
- Added semantic form controls and screen-reader labels.
- Added textual priority labels so priority is not communicated by color alone.
- Added polite live-region status toasts.
- Added keyboard-accessible ordering alternative to drag-and-drop.
- Added reduced-motion behavior and documented manual release accessibility checks.

### Internationalization readiness

- Added an English string catalog in `src/i18n/en.ts` and kept primary shared product strings externalized as the first step toward additional locale packs.

### Build and code quality

- Added React + TypeScript + Vite project configuration.
- Added strict TypeScript settings.
- Added ESLint/type-aware lint configuration.
- Added Prettier as the developer formatter.
- Added deterministic CI formatting-invariant checks for LF endings, final newlines, and trailing whitespace through `scripts/check-format.mjs`.
- Added `.editorconfig`, `.gitattributes`, `.gitignore`, `.prettierrc.json`, `.prettierignore`, and `.env.example`.
- Pinned direct npm dependency versions exactly in `package.json`.
- Added Node.js engine requirement.

### Tests

- Added domain tests for task normalization, recurrence boundaries, recurring completion, smart views, and statistics.
- Added JSON backup round-trip and invalid-backup regression coverage.
- Added CSV comma/quote/multiline round-trip coverage.
- Added TaskComposer component coverage through Testing Library.
- Added Playwright Chromium end-to-end coverage for creating a task, switching offline, completing the task, and verifying the Completed view.
- Added shared React test cleanup.

### GitHub automation and repository quality

- Added CI workflow for formatting invariants, linting, TypeScript, unit/component tests, production build, and dependency audit.
- Added Chromium Playwright E2E workflow.
- Added CodeQL JavaScript/TypeScript security analysis.
- Added tag-driven release workflow with generated release notes and web artifact packaging.
- Added Dependabot checks for npm and GitHub Actions.
- Added privacy-aware bug report form.
- Added feature request form.
- Added pull-request quality checklist.
- Added issue support routing.
- Added Buy Me a Coffee funding configuration.
- Added GitHub governance guidance for branch protection, Discussions, labels, milestones, and merge policy.
- Created and merged verification PR #1 to exercise pull-request-triggered CI/E2E/CodeQL workflows.

### Documentation

- Added complete `README.md` with logo, value proposition, screenshots plan, features, platforms, technology, quick start, development setup, testing, build/release, architecture, security/privacy, accessibility, contribution, license, contacts, BMC badge, and credit.
- Added `CONTRIBUTING.md`.
- Added `CODE_OF_CONDUCT.md`.
- Added `SECURITY.md`.
- Added `SUPPORT.md`.
- Added `PRIVACY.md`.
- Added `CHANGELOG.md`.
- Added `ROADMAP.md`.
- Added `docs/architecture.md`.
- Added `docs/setup.md`.
- Added `docs/development.md`.
- Added `docs/testing.md`.
- Added `docs/release.md`.
- Added `docs/troubleshooting.md`.
- Added `docs/accessibility.md`.
- Added `docs/performance.md`.
- Added `docs/github.md`.
- Added ADR 0001 for local-first PWA architecture.
- Added ADR 0002 for the Dexie/repository persistence boundary.
- Added `docs/screenshots/README.md` with the real-release screenshot capture plan.
- Preserved the supplied project specification at `docs/master-prompt.md`.

## Files/modules added or changed

### Root/build

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

### Application

- `src/App.tsx`
- `src/main.tsx`
- `src/styles.css`
- `src/domain/types.ts`
- `src/domain/task.ts`
- `src/domain/validation.ts`
- `src/storage/db.ts`
- `src/storage/repository.ts`
- `src/utils/export.ts`
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

### Tests

- `src/test/setup.ts`
- `tests/task.test.ts`
- `tests/export.test.ts`
- `tests/TaskComposer.test.tsx`
- `e2e/task-flow.spec.ts`

### GitHub

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

### Documentation/policy

- `README.md`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `SUPPORT.md`
- `PRIVACY.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `what_changed.md`
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

## Verification performed

### Passed locally/source-level

- Parsed all JSON configuration files used by the project.
- Parsed all `.github/**/*.yml` workflow/config files.
- Strict TypeScript core type-check passed for domain types, domain logic, backup validation, and data-portability modules using the locally available TypeScript compiler.
- Core compiled runtime assertions passed for title normalization, tag deduplication, weekly recurrence, recurring completion/next-occurrence generation, CSV quote/newline round-trip, and JSON backup round-trip.
- TypeScript/TSX syntax transpilation audit passed for every TypeScript/TSX source/config/test file in the prepared workspace.
- Source audit found and fixed ES2022-incompatible `Array.prototype.toSorted` usage before push.
- Workflow audit found and fixed npm-cache configuration that would have required a missing lockfile.
- Deterministic formatting invariant check passed across 72 tracked text paths locally.
- Required-file and README relative-link audit passed locally.
- TODO/FIXME audit found no implementation placeholders; the only `TODO` text is the supplied master prompt discussing placeholder policy.
- Git author/committer metadata was verified on connector-created commits as `Sanskar <sanskarin@outlook.in>`.

### Hosted GitHub verification

Verification PR: `#1` — `docs: verify v0.1 repository quality gates`.

The PR was merged after GitHub reported it as mergeable. At the time this handoff was written, hosted runners were still queued rather than completed:

- CodeQL run `32213783595` — queued.
- E2E run `32213783601` — queued.
- CI run `32213783631` — queued.

Do not interpret the queued state as a passing or failing result. No `v0.1.0` release tag has been created because the definition of done requires the hosted checks to finish successfully first.

### Environment/tooling limitation

- The execution sandbox could not resolve the npm registry host, so a clean `npm install`, generated lockfile, full dependency-backed `npm run check`, Playwright browser installation, and production build could not be executed locally in this session.
- The sandbox also could not resolve `github.com` for a shell-based clone, so repository writes and inspections were performed through the authenticated GitHub connector instead.
- Everything that could be verified without those external network dependencies was verified locally/source-level and recorded above.

## Known limitations

- Reminder checks run while TaskMint is open. Reliable closed-app scheduled notification delivery is not claimed on every web/PWA platform.
- Real release screenshots have not been fabricated. They must be captured from a browser-verified release build after hosted checks succeed.
- A Tauri wrapper is intentionally not included in v0.1 because the PWA fulfills the primary Windows/macOS/Linux target without native-wrapper complexity. Native packaging remains an evaluated future option rather than an unfinished core feature.
- Full transitive npm locking is pending a successful network-backed installation. Direct dependency versions are exact-pinned meanwhile.

## Open issues / next exact tasks

1. Re-check GitHub Actions run IDs `32213783595`, `32213783601`, and `32213783631` until they reach completed conclusions.
2. If any hosted check fails, inspect the failed job/step logs, fix the reported issue with a regression test where appropriate, and rerun only the affected workflow/job.
3. When hosted CI succeeds, run/capture a production browser smoke test and real screenshots listed in `docs/screenshots/README.md` using fictional task data only.
4. Generate and commit `package-lock.json` from a successful clean npm installation if npm remains the selected package manager.
5. Update this file and `CHANGELOG.md` with final verification results.
6. Tag `v0.1.0` only after CI, CodeQL, E2E, production build, and release checks are green.

## Migration notes

- IndexedDB v1: base `tasks` and `settings` stores.
- IndexedDB v2: adds reminder-aware and multi-entry tag indexing and normalizes reminder/tags/project/recurrence fields during upgrade.
- Task backup schema: version 2. Unsupported/invalid backup schemas are rejected before replacing local data.

## Release notes draft

TaskMint v0.1.0 introduces an offline-first task manager with local IndexedDB persistence; complete task lifecycle; projects, tags, priorities, notes, due dates, reminders, and recurrence; smart views, search, filtering, sorting, drag-and-drop and keyboard ordering; JSON/CSV portability; productivity statistics; accessible responsive themes; onboarding/settings/About; PWA offline caching; privacy/security controls; automated tests; CodeQL/CI/E2E/release automation; and a complete open-source documentation/governance baseline.

## Recent meaningful commit history

- `0e6d893fecd6e1526afb3ff87321fb06987e1e27` — `merge: add GitHub governance and verification tooling`
- `b513fe794a6ff86ecd4fc1ae788979aad242eeba` — `build: use deterministic CI formatting check`
- `98d3050c5e26f381525afd5087c9d1c8fce621a6` — `build: add deterministic formatting invariant check`
- `9dea65673df3b6d55691b3d48c9a0c1aa9d50840` — `docs: add GitHub governance guidance`
- `938011967e9f4174339d5a842ad80c426f088598` — `docs: preserve master development prompt`
- `9dffa9c14ac83470397c0393dbb9433509abe220` — `docs: add release screenshot capture plan`
- `a8901414f34420013b07b662dcf0a90a55a18749` — `docs: record IndexedDB repository decision`
- `03c8138c7ca45ae19c5834c66a41fb54fdcd7f01` — `docs: record local-first PWA architecture decision`
- `8b926174be952bce789473becb855da651298f00` — `docs: document performance budgets`
- `6b11cee46d40a6df688efb3f09591dcfc87d717b` — `docs: document accessibility baseline`
- `267fb4004de24e4b04a96393863d8d69b6b629a2` — `docs: add troubleshooting guide`
- `e2ddc35889e45107c9ba42859541b76d68f8a473` — `docs: add release checklist`
- `60175ba90a29ae530e6fbc2ac7531f619472ec03` — `docs: document test strategy`
- `4d974cd2a6fd55e7135c5dce717d6e77f1ce57e3` — `docs: document application architecture`
- `f9c4446ef762cc5aea39ec126e9ee83e0ec000a8` — `style: add responsive accessible design system`
- `2a6bd3fbbd56394a21d5594b9e785d7b8be20bd9` — `feat: mount application with error boundary`
- `1cca247dec226c5361c12b7539a5ced5b2353431` — `feat: wire complete TaskMint application workflow`
- `7046259c13db878280af38351c781a1e0188e720` — `feat: add privacy data appearance and about settings`
- `227fb2ac72efc85deb82de899fed9c125bc6a40c` — `feat: add accessible task item interactions`
- `3359bd2e61df7735ff374c179e4f02c9fde916ab` — `feat: add task creation and editing form`
- `c9dad1f4b4eef4f53515a9d943f24b179e69c9c5` — `test: add offline primary journey coverage`
- `fd35ccb127c47288634c1b053ffc55cca531988c` — `test: cover accessible task composer submission`
- `4bf2b7fd2a41679637c006191600634cebd3cb78` — `test: cover JSON and CSV portability`
- `eba3ff6003ba554de2dc0ca90706b03ccc1f5b05` — `test: cover task lifecycle recurrence and statistics`
- `c7858397b876d53f8941bc40595da1ea443dfc46` — `ci: add CodeQL security analysis`
- `97ab7e928b9237ba5b0b7ae13d50107e6a732ec2` — `ci: add Chromium end-to-end workflow`
- `60b14355fbe81aaa4c66e208fd962ea71fe44cb8` — `ci: add full quality verification workflow`
- `808108c4b9619fe43c85e15ab057f25eb308eeca` — `feat: add JSON and CSV data portability`
- `b3381e778e7dcaac50388933944f40e5e0a394da` — `feat: add transactional task repository`
- `40d62e6711f507d6c35c10090a02aeb025ea9198` — `feat: add versioned IndexedDB schema`
- `423df72adfc5240ce117e449077ce9db71f2fc79` — `feat: validate imported task backups`
- `a963b1b2a9a7e2bddb474d6b6532cc738db3c4ec` — `feat: implement task lifecycle recurrence and smart views`
- `421918930b1a5dde3ae04ccb46e750cdc468f54f` — `feat: define task domain types`
- `0bf69dada1a5ec478be3e17ebf354cac823e921b` — `build: bootstrap React TypeScript PWA toolchain`

This handoff file is the source of truth for the next continuation session.
