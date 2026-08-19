# TaskMint — Work Handoff

## Current milestone

- Project: **TaskMint**
- Repository: `https://github.com/sanskarIN/taskmint`
- Visibility/source model: public / open source
- License: MIT
- Current package version: `0.1.0`
- Default branch: `main`
- Date: 2026-08-19
- Git commit identity verified through GitHub: `Sanskar <sanskarin@outlook.in>`
- Phase status: implementation phases 0–5 are substantially complete. Phase 6 source-level audit and hardening are complete for everything that can be verified without installing external npm dependencies. Hosted clean-network CI/E2E/CodeQL remains queued on GitHub Actions, so **do not tag `v0.1.0` yet**.

## Resume instruction

In the next continuation, read this file first, then check the latest `main`, open/queued GitHub Actions runs, and `CHANGELOG.md`. Do not rebuild completed features from scratch. Fix only verified failures or continue the exact remaining release-candidate tasks listed near the end of this file.

## Product implementation completed

- Create tasks.
- Edit tasks.
- Complete tasks.
- Reopen completed tasks.
- Archive tasks.
- Restore archived tasks to active/completed state as appropriate.
- Delete tasks.
- Undo individual task deletion.
- Priorities: low, medium, high, urgent.
- Due dates.
- Optional reminder date/time.
- Notes.
- Tags with normalization/deduplication.
- Projects.
- Recurrence: daily, weekly, monthly.
- Recurring task completion creates the next occurrence.
- Recurring completion and next-occurrence persistence are atomic through one IndexedDB bulk operation.
- Recurring reminders continue when a recurring task has no due date.
- Monthly recurrence clamps at the end of shorter months.
- Impossible task dates such as `2026-02-31` are rejected/normalized away.
- Smart views: Inbox, Today, Upcoming, Overdue, Completed, Archived, All Tasks.
- Search across title, notes, project, and tags.
- Project filter.
- Tag filter.
- Priority filter.
- Manual, newest, due-date, priority, and title sorting.
- Drag-and-drop task reordering.
- Keyboard-accessible move-up/move-down alternative.
- Reorder controls appear only while manual sorting is active.
- Keyboard movement uses the current visible/filtered task sequence.
- JSON backup/export.
- JSON restore/import with destructive-replacement confirmation when local tasks already exist.
- CSV export/import.
- Productivity statistics without streak pressure or manipulative gamification.
- Active/completed/archived counts.
- Due-today/overdue counts.
- Seven-day completion count.
- Completion rate.
- One-click Settings entry for local-data deletion with a destructive confirmation.
- First-run onboarding.
- Light theme.
- Dark theme.
- System theme.
- Reduced-motion setting.
- Responsive phone/tablet/desktop layout.
- Loading state.
- Empty state.
- Offline indicator.
- Success/status toast.
- Form error state.
- Fatal React render recovery state.
- Optional browser notifications requested only after explicit user action.
- Reminder checks while TaskMint is open.
- Reminder suppression is reset when a reminder schedule is edited or a backup is restored.
- PWA manifest.
- Generated service worker / offline app-shell caching.
- Installable PWA configuration.
- Editable SVG app icon/source artwork.
- Settings sections for appearance/accessibility, reminders, data/privacy, updates, and About.
- About section reads the app version from `package.json` through `src/config.ts` rather than hard-coding the version.
- Required visible credit: **Made by the Sanskar**.
- GitHub, support, business-email, and Buy Me a Coffee links.
- No forced sign-in.
- No backend required for core operation.
- No donation requirement or intrusive funding gate.

## Data, persistence, and reliability completed

- Dexie/IndexedDB persistence.
- Explicit IndexedDB schema version 1.
- Explicit IndexedDB schema version 2.
- v1→v2 upgrade normalizes reminder, tags, project, and recurrence fields.
- Real Chromium E2E migration test seeds a native IndexedDB version-10 representation of Dexie v1 and verifies migration to Dexie v2.
- Repository layer separates persistence from React presentation code.
- Transactional JSON restore.
- Transactional local-data deletion.
- Bulk transactional reordering/import operations.
- Atomic recurring completion/next-occurrence persistence.
- JSON backup schema version 2.
- Imported JSON is treated as untrusted input.
- Backup size/task-count limits.
- Task ID validation.
- Duplicate backup task-ID rejection.
- Task enum validation.
- Strict task-order validation.
- Real calendar-date validation.
- Timestamp validation/canonicalization.
- Completion/archive timestamp consistency validation.
- Settings theme/boolean validation.
- Tag validation, normalization, deduplication, and limits.
- Import file-size limit.
- JSON restore is validated completely before replacing current task data.
- CSV parser handles quoted commas, quotes, and multiline content.
- Direct dependency versions are exact-pinned in `package.json`.

## Security and privacy completed

- Local-first architecture; TaskMint has no required application server or account system.
- React rendering escapes task/user text by default.
- Restrictive HTML Content Security Policy.
- Scripts remain restricted to the application origin.
- `style-src 'unsafe-inline'` is allowed only so Vite's development-time injected styles work with the documented development server.
- `object-src 'none'`.
- `base-uri 'self'`.
- `form-action 'self'`.
- Development-only structured logging.
- Common sensitive fields are redacted by the logging helper.
- Task titles/notes are not intentionally emitted through the structured logging helper.
- No production API keys, credentials, signing secrets, or generated secrets were added.
- `.env.example` contains placeholders only.
- `.env` patterns are ignored.
- CodeQL workflow.
- npm dependency audit in CI.
- Dependabot for npm dependencies.
- Dependabot for GitHub Actions.
- Responsible disclosure process in `SECURITY.md`.
- Local-storage/privacy behavior documented in `PRIVACY.md`.
- Bug report template warns contributors not to publish private task content.

## Accessibility and UX hardening completed

- Semantic native controls.
- Screen-reader labels where visible labels are not appropriate.
- Visible `:focus-visible` outline.
- Keyboard alternative to drag-and-drop.
- Non-color-only priority labels.
- Polite live-region status toast.
- Touch-friendly control sizing.
- Responsive reflow.
- Reduced-motion behavior.
- Onboarding uses `aria-modal` and traps Tab focus on its only action.
- Onboarding autofocuses its primary action.
- Onboarding surfaces a save error instead of silently failing.
- Settings moves focus into the dialog when opened.
- Settings traps Tab/Shift+Tab within the dialog.
- Settings closes with Escape.
- Settings restores the previously focused control after closing.
- Hidden import file inputs are removed from the normal tab order.
- Settings surfaces persistence failures without discarding existing local data.
- Task composer resets after an edit is saved or editing mode is cleared, preventing stale edited values from becoming an accidental new task.
- Reorder controls are hidden when non-manual sorting is selected so controls never appear to do nothing.

## Internationalization readiness

- English string catalog exists at `src/i18n/en.ts`.
- Shared high-level product strings use the catalog.
- Architecture is ready for further string extraction/locales without coupling domain logic to UI text.
- English remains the only shipped locale for v0.1.

## Build/tooling completed

- React + TypeScript + Vite project.
- Strict TypeScript configuration.
- `noUncheckedIndexedAccess`.
- `noImplicitOverride`.
- ES2022 application target.
- Type-aware ESLint configured for project TypeScript.
- E2E files included in the type-aware TypeScript project.
- Maintenance JavaScript/config files that are not part of the TypeScript project are excluded from project-service linting.
- Prettier configured as developer formatter.
- Deterministic CI format-invariant script checks LF endings, final newlines, and trailing whitespace.
- `.editorconfig`.
- `.gitattributes`.
- `.gitignore`.
- `.prettierrc.json`.
- `.prettierignore`.
- `.env.example`.
- Node engine requirement.
- Vite PWA configuration.
- Playwright configuration.
- Strict React error boundary now explicitly marks its `state` override for `noImplicitOverride` compatibility.

## Automated tests completed

### Domain/unit

`tests/task.test.ts` covers:

- title normalization
- tag normalization/deduplication
- monthly month-end recurrence
- recurring completion
- impossible calendar-date rejection
- recurring reminders without due dates
- deterministic generated order based on injected completion time
- smart-view filtering
- productivity statistics

### Import/export

`tests/export.test.ts` covers:

- JSON backup round-trip
- CSV commas/quotes/multiline round-trip
- unsupported JSON backup rejection
- duplicate task-ID rejection
- malformed task timestamp rejection

### Component

`tests/TaskComposer.test.tsx` covers:

- accessible simple task submission
- stale-edit-value regression after saving an edit

### End to end

`e2e/task-flow.spec.ts` covers:

- first-run onboarding if present
- task creation
- browser context going offline
- visible Offline state
- task completion offline
- Completed smart-view verification

`e2e/migration.spec.ts` covers:

- seeding a real legacy IndexedDB database
- opening current TaskMint against it
- automatic v1→v2 upgrade
- migration of `reminderAt`, `tags`, `project`, and `recurrence`

## GitHub repository quality completed

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
- CI verifies format invariants, lint, type checks, unit/component tests, production build, and high-severity npm audit.
- E2E workflow installs Chromium and runs Playwright.
- CodeQL scans JavaScript/TypeScript.
- CI and CodeQL cancel superseded runs on the same ref to reduce wasted runner capacity.
- Tagged release workflow runs the quality suite, packages `dist`, and creates GitHub Release artifacts/notes.
- Funding points to `https://buymeacoffee.com/sanskarIN`.
- GitHub governance guidance covers branch protection, Discussions, labels, milestones, and merge policy.
- Verification PR #1 was created and merged to exercise pull-request workflows.

## Documentation completed

- `README.md`
- `LICENSE`
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

The supplied master development prompt is preserved in `docs/master-prompt.md` so continuation work does not depend on chat history.

## Main implementation/configuration files

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
- `src/config.ts`
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
- `e2e/migration.spec.ts`

## Verification performed in this session

### Passed locally/source-level

- Parsed project JSON configuration files.
- Parsed `.github/**/*.yml` workflow/config files.
- Strict TypeScript core type-check passed for domain types, task business logic, backup validation, and JSON/CSV modules using the locally available TypeScript compiler.
- The stricter core check was rerun with `--strict`, `--noUncheckedIndexedAccess`, `--noFallthroughCasesInSwitch`, and `--noImplicitOverride` where applicable to the dependency-free core set.
- Compiled runtime assertions passed for task normalization, tag deduplication, recurrence, recurring completion, recurring reminders without a due date, impossible-date normalization, duplicate-backup rejection, malformed-timestamp rejection, CSV round-trip, and JSON backup round-trip.
- TypeScript/TSX syntax transpilation audit passed on the locally prepared source/test workspace after the restore/reorder/reminder hardening changes.
- Deterministic formatting-invariant check passed on the locally prepared tracked text set before the final GitHub-only documentation/component refinements.
- Required-file and README relative-link audit passed earlier in the session.
- GitHub code search currently returns no implementation `TODO`, `FIXME`, or `XXX` placeholders.
- A source audit found and fixed ES2022-incompatible `Array.prototype.toSorted` use.
- A strict TypeScript review found and fixed the React error-boundary `state` override.
- A CSP review found and fixed Vite development styling being blocked by the original style policy.
- A data-integrity review found and fixed malformed/duplicate backup acceptance.
- A recurrence review found and fixed reminder recurrence without due dates and non-atomic recurring writes.
- An edit-state review found and fixed stale TaskComposer values after editing.
- A reorder review found and fixed controls being active under non-manual sorts and keyboard movement using hidden global neighbors.
- A modal accessibility review added focus trapping/restoration and persistence-error feedback.
- Git commit metadata was verified on connector-created commits as `Sanskar <sanskarin@outlook.in>`.

### Hosted GitHub verification status

Verification PR: **#1 — `docs: verify v0.1 repository quality gates`**.

The PR was merged after GitHub reported it as mergeable. The PR-head hosted runs remain queued at the latest check in this session:

- CodeQL run `32213783595` — `queued`
- E2E run `32213783601` — `queued`
- CI run `32213783631` — `queued`

These queued states are **not** treated as success. No `v0.1.0` tag was created.

CI and CodeQL on current `main` now contain concurrency cancellation so future superseded runs on the same ref do not continue consuming runner capacity.

## Environment/tooling limitations

- The execution sandbox could not resolve the npm registry host, so a clean dependency installation could not be completed locally.
- Because dependencies could not be installed locally, the complete dependency-backed `npm run check`, production Vite build, and Playwright browser run could not be executed in the sandbox.
- `package-lock.json` could not be generated from a real successful npm resolution in this environment and therefore was not fabricated.
- The execution sandbox also could not resolve `github.com` for a shell clone/push. Repository reads/writes were performed through the authenticated GitHub connector.
- Hosted GitHub runners are currently queued, which is outside the repository code itself. The repository therefore remains a release candidate rather than a tagged release.

## Known limitations that are intentionally documented

- Browser reminders are checked while TaskMint is open. Reliable closed-app scheduled notification delivery is not claimed across all web/PWA browser/OS combinations.
- Real screenshots have not been fabricated. `docs/screenshots/README.md` defines the exact screenshot set to capture after a browser-verified release build succeeds.
- A Tauri desktop wrapper is not included in v0.1 because the PWA already targets Windows/macOS/Linux. Tauri remains an optional future evaluation only if native-only capabilities justify the added complexity.
- Full transitive npm locking is pending a successful clean npm registry resolution. Direct dependencies remain exact-version pinned meanwhile.

## Next exact tasks

1. Re-check hosted run IDs `32213783595`, `32213783601`, and `32213783631` and current `main` workflow status.
2. If a hosted check fails, inspect the exact failed job/step log and commit the smallest regression fix; do not guess.
3. Once npm installation is available, run from a clean checkout:
   - `npm install`
   - `npm run format:check`
   - `npm run lint`
   - `npm run typecheck`
   - `npm test`
   - `npm run build`
   - `npm audit --audit-level=high`
   - `npm run test:e2e:install`
   - `npm run test:e2e`
4. Generate and commit a real `package-lock.json` from that successful clean installation if npm remains the package manager.
5. Capture the real release screenshots listed in `docs/screenshots/README.md` using fictional/demo task data only.
6. Re-run the clean release checklist in `docs/release.md`.
7. Update `CHANGELOG.md` and this file with the final green verification results.
8. Only then create the `v0.1.0` tag and allow the release workflow to publish the web artifact.

## Migration notes

- IndexedDB v1: base `tasks` and `settings` stores.
- IndexedDB v2: adds reminder-aware and multi-entry tag indexing and normalizes missing reminder/tags/project/recurrence fields during upgrade.
- E2E migration coverage now exercises the v1→v2 path in Chromium.
- Task JSON backup schema: version 2.
- Unsupported backup schema versions are rejected before data replacement.
- Malformed timestamps, duplicate IDs, invalid orders, impossible dates, and inconsistent task status timestamps are rejected before restore.

## Release notes draft

TaskMint v0.1.0 is an offline-first, local-data task manager with a full task lifecycle; priorities, notes, due dates, reminders, tags, projects and recurring tasks; smart views, search, filtering and sorting; accessible manual reordering; JSON/CSV portability; productivity statistics; light/dark/system themes; first-run onboarding; privacy/data controls; an installable PWA; validated IndexedDB migrations; security/privacy hardening; automated unit/component/E2E coverage; and professional GitHub CI, CodeQL, release, Dependabot, issue, contribution, funding, and documentation infrastructure.

## Most recent meaningful commits

- `45eb3598010f4de3ed42610a2f2f63ee27f07ed8` — `docs: record release candidate hardening fixes`
- `bacca52571741d693881e507a5cb58700a842a01` — `docs: document modal focus accessibility`
- `fd191dcccceb9730addd7b2bd3cfa49d995e0b59` — `docs: document migration and regression coverage`
- `5e23d5f542d83d4ee46318beb04d14d0f301fc60` — `refactor: display package version in About`
- `6ab4f94a1999a9ff94613319c307056780674e15` — `refactor: centralize app version metadata`
- `62355de63dcb8ff2d8c16484413f0be499ff6aec` — `fix: trap settings focus and surface persistence errors`
- `8d7c9faf022460a824a4d2b16a108ce371646480` — `fix: trap keyboard focus during onboarding`
- `e44a37a89256aa35e2f3bb6b1459e4a0c5443276` — `fix: persist recurring completion atomically`
- `c5d7499c59ed9ed739f1dff1209c8569175351f7` — `fix: harden restore reminders and filtered reordering`
- `a9a65e18b0fcdae2b2ede45dc7cad5214c3bf79f` — `fix: limit reorder controls to manual sorting`
- `63207f727d0c9757629010421e824135e4269d27` — `test: prevent stale values after task edits`
- `dbf3b044ac363e5b684828de114f462dddf95708` — `fix: reset composer after editing completes`
- `836bb9a53f7f42b1ab12e7a7905dab2f673f72e3` — `ci: cancel superseded CodeQL runs`
- `a88e6fd3f8ae80d02fef54d91f9f23c34808bc6a` — `ci: cancel superseded quality runs`
- `ea3525017ef98bf9f71248447efbf292d6aaac1d` — `test: exercise IndexedDB v1 to v2 migration`
- `bb8fa555e74bf05fe7663eebbe512bc9517311d8` — `test: cover recurrence reminders and calendar edge cases`
- `09d9a939e143cfc52631c5a5952706f621636a51` — `fix: handle recurring reminders and invalid calendar dates`
- `70b9b9c019aa2658d7b71eb5982a106e50723614` — `test: cover corrupt backup identifiers and timestamps`
- `271d2b4f7c36a6025a59c0f27fbb9ac0f11e40a8` — `fix: harden backup date and id validation`
- `f6b54cb26cbd0085f35881544070fb50a70f0178` — `fix: permit Vite injected styles under CSP`
- `28120e79aa4418973eef2d0fafcf497ad4c8b216` — `fix: satisfy strict override checks in error boundary`
- `9496673434bc57d9a6712d043d4c784eb9dd865f` — `fix: include end-to-end tests in type-aware project`
- `c92f64608dfe343ed881ca4bf713769cda66f564` — `fix: scope type-aware linting to project TypeScript`
- `0e6d893fecd6e1526afb3ff87321fb06987e1e27` — `merge: add GitHub governance and verification tooling`
- `b513fe794a6ff86ecd4fc1ae788979aad242eeba` — `build: use deterministic CI formatting check`
- `98d3050c5e26f381525afd5087c9d1c8fce621a6` — `build: add deterministic formatting invariant check`
- `9dea65673df3b6d55691b3d48c9a0c1aa9d50840` — `docs: add GitHub governance guidance`
- `938011967e9f4174339d5a842ad80c426f088598` — `docs: preserve master development prompt`
- `0bf69dada1a5ec478be3e17ebf354cac823e921b` — `build: bootstrap React TypeScript PWA toolchain`

Earlier feature/test/documentation commits are intentionally preserved in repository history rather than squashed. This file is the source of truth for the next continuation session.
