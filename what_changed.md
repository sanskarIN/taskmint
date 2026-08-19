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
- Git commit identity verified through GitHub: `Sanskar <sanskarin@outlook.in>`
- Phase status: Phases 0–5 are substantially implemented. Phase 6 source-level audit/hardening is complete for everything that can be verified without installing external npm dependencies. Hosted clean-network CI/E2E/CodeQL is still queued on GitHub Actions, so the release tag must not be created yet.

## Resume instruction

In the next continuation, read this file first, then inspect current `main`, `CHANGELOG.md`, open/queued workflow runs, and any new GitHub issues/PRs. Do not rebuild completed features from scratch. Continue only the exact remaining release-candidate tasks or fix failures proven by logs/tests.

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
- Tags with trimming, lower-case normalization, deduplication, count limits, and length limits.
- Projects.
- Recurrence: daily, weekly, monthly.
- Recurring completion creates the next task occurrence.
- Recurring completion and next-occurrence persistence are atomic through one IndexedDB bulk write.
- Recurring reminder schedules continue when a recurring task has no due date.
- Monthly recurrence clamps to the last valid day of shorter months.
- Impossible task dates such as `2026-02-31` are rejected/normalized away.
- Smart views: Inbox, Today, Upcoming, Overdue, Completed, Archived, All Tasks.
- Search across task title, notes, project, and tags.
- Project filter.
- Tag filter.
- Priority filter.
- Sort modes: manual, newest, due date, priority, title.
- Drag-and-drop task reordering.
- Keyboard-accessible move-up/move-down alternative.
- Reorder controls appear only while manual sorting is active.
- Keyboard movement uses the current visible/filtered task sequence.
- JSON backup/export.
- JSON restore/import.
- JSON restore confirmation before replacing existing local tasks.
- CSV export/import.
- Productivity statistics without streak pressure or manipulative gamification.
- Active/completed/archived counts.
- Due-today and overdue counts.
- Seven-day completion count.
- Completion rate.
- One-click local-data deletion from Settings with destructive confirmation.
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
- Reminder notification suppression resets when a reminder schedule is changed or a backup is restored.
- PWA manifest.
- Generated service worker and offline application-shell caching.
- Installable PWA configuration.
- Editable SVG app icon/source artwork.
- Settings sections for appearance/accessibility, reminders, data/privacy, updates, and About.
- About version is read from `package.json` through `src/config.ts` rather than hard-coded.
- Required visible credit: **Made by the Sanskar**.
- GitHub link.
- Business/support email links.
- Buy Me a Coffee link.
- No forced sign-in.
- No backend required for core operation.
- No donation requirement or intrusive funding gate.

## Data, persistence, migration, and reliability completed

- Dexie/IndexedDB persistence.
- Explicit IndexedDB schema version 1.
- Explicit IndexedDB schema version 2.
- v1→v2 upgrade normalizes reminder, tags, project, and recurrence fields.
- Chromium E2E migration test seeds a native IndexedDB version corresponding to the legacy Dexie schema and verifies migration to the current schema.
- Repository layer separates persistence from React presentation code.
- Transactional JSON restore.
- Transactional local-data deletion.
- Bulk transactional reorder/import operations.
- Atomic recurring completion/next-occurrence persistence.
- JSON backup schema version 2.
- Imported JSON is treated as untrusted input.
- Backup file/task-count limits.
- Task ID validation.
- Duplicate backup task-ID rejection.
- Task enum validation.
- Strict finite task-order validation.
- Real calendar-date validation.
- Timestamp validation and canonicalization.
- Completion/archive timestamp consistency validation.
- Settings theme validation.
- Settings boolean validation.
- Tag validation/normalization/deduplication/limits.
- Import file-size limits.
- JSON backup validation completes before existing local task data is replaced.
- CSV parser handles quoted commas, quotes, and multiline content.
- Direct npm dependency versions are exact-pinned in `package.json`.

## Security and privacy completed

- Local-first architecture; no TaskMint application backend or account system is required.
- React rendering escapes task/user text by default.
- Restrictive Content Security Policy in `index.html`.
- `script-src 'self'`.
- `style-src 'self' 'unsafe-inline'` is used so Vite's documented development server can inject styles; executable scripts remain origin-restricted.
- `object-src 'none'`.
- `base-uri 'self'`.
- `form-action 'self'`.
- Development-only structured logging helper.
- Common sensitive fields are redacted by the logging helper.
- Task titles/notes are not intentionally emitted through the structured logger.
- No production credentials, API keys, signing secrets, generated secrets, or real personal task data were added.
- `.env.example` contains placeholders only.
- `.env` patterns are ignored.
- CodeQL workflow.
- High-severity npm dependency audit in CI.
- Dependabot for npm dependencies.
- Dependabot for GitHub Actions.
- Responsible disclosure process in `SECURITY.md`.
- Local data/privacy behavior documented in `PRIVACY.md`.
- Bug-report template warns contributors not to publish private task content.

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
- Onboarding uses `aria-modal`.
- Onboarding traps Tab focus on its only action.
- Onboarding autofocuses its primary action.
- Onboarding surfaces persistence errors instead of silently failing.
- Settings moves focus into the dialog on open.
- Settings traps Tab/Shift+Tab inside the dialog.
- Settings closes with Escape.
- Settings restores the previously focused control after close.
- Hidden import file inputs are removed from the normal tab order.
- Settings surfaces persistence failures without discarding existing local data.
- Task composer resets after an edit is saved or editing mode is cleared, preventing stale edited values from becoming an accidental new task.
- Reorder controls are hidden when non-manual sorting is active.

## Internationalization readiness

- English string catalog exists at `src/i18n/en.ts`.
- Shared high-level product strings use the catalog.
- Domain/business logic is not coupled to localization text.
- Architecture is ready for further string extraction and additional locale packs.
- English remains the only shipped locale for v0.1.

## Build/tooling completed

- React + TypeScript + Vite application.
- Strict TypeScript configuration.
- `noUncheckedIndexedAccess`.
- `noFallthroughCasesInSwitch`.
- `noImplicitOverride`.
- ES2022 application target.
- Type-aware ESLint for project TypeScript.
- E2E files included in the type-aware TypeScript project.
- Maintenance JavaScript/config scripts outside the TypeScript project are excluded from project-service linting.
- Prettier configured as developer formatter.
- Deterministic CI formatting-invariant script checks LF endings, final newlines, and trailing whitespace.
- `.editorconfig`.
- `.gitattributes`.
- `.gitignore`.
- `.prettierrc.json`.
- `.prettierignore`.
- `.env.example`.
- Node.js engine requirement.
- Vite PWA configuration.
- Playwright configuration.
- Strict React error boundary explicitly marks its `state` override for `noImplicitOverride` compatibility.

## Automated tests completed

### Domain/unit — `tests/task.test.ts`

Covers:

- title normalization
- tag normalization/deduplication
- monthly month-end recurrence
- recurring completion
- impossible calendar-date rejection
- recurring reminders without due dates
- deterministic generated ordering from injected completion time
- smart-view filtering
- productivity statistics

### Import/export — `tests/export.test.ts`

Covers:

- JSON backup round-trip
- CSV commas/quotes/multiline round-trip
- unsupported JSON backup rejection
- duplicate task-ID rejection
- malformed task timestamp rejection

### Component — `tests/TaskComposer.test.tsx`

Covers:

- accessible simple task submission
- stale-edit-value regression after saving an edit

### End to end — `e2e/task-flow.spec.ts`

Covers:

- first-run onboarding if present
- task creation
- browser context going offline
- visible Offline state
- task completion while offline
- Completed smart-view verification

### Migration end to end — `e2e/migration.spec.ts`

Covers:

- seeding a real legacy IndexedDB database
- opening current TaskMint against the legacy database
- automatic v1→v2 migration
- normalization/migration of `reminderAt`, `tags`, `project`, and `recurrence`

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
- CI verifies formatting invariants, lint, type checks, unit/component tests, production build, and high-severity npm audit.
- E2E workflow installs Chromium and runs Playwright.
- CodeQL scans JavaScript/TypeScript.
- CI and CodeQL cancel superseded runs on the same ref to reduce wasted runner capacity.
- Tag-driven release workflow runs the quality suite, packages `dist`, and creates GitHub Release artifacts/notes.
- Funding points to `https://buymeacoffee.com/sanskarIN`.
- GitHub governance guidance covers branch protection, Discussions, labels, milestones, and merge policy.
- Verification PR #1 was created and merged to exercise pull-request workflows.

## Complete documentation set

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

The supplied TaskMint master development prompt is preserved in `docs/master-prompt.md` so future work does not depend on chat history.

## Full implementation/configuration file inventory

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

### Automated tests

- `src/test/setup.ts`
- `tests/task.test.ts`
- `tests/export.test.ts`
- `tests/TaskComposer.test.tsx`
- `e2e/task-flow.spec.ts`
- `e2e/migration.spec.ts`

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

## Verification performed in this session

### Passed locally/source-level

- Parsed project JSON configuration files.
- Parsed `.github/**/*.yml` workflow/config files.
- Strict dependency-free TypeScript core type-check passed for domain types, task business logic, backup validation, and JSON/CSV modules using the locally available TypeScript compiler.
- The core check was rerun with strict compiler settings including `--strict`, `--noUncheckedIndexedAccess`, `--noFallthroughCasesInSwitch`, and `--noImplicitOverride` where applicable.
- Compiled runtime assertions passed for task normalization, tag deduplication, recurrence, recurring completion, recurring reminders without a due date, impossible-date normalization, duplicate-backup rejection, malformed-timestamp rejection, CSV round-trip, and JSON backup round-trip.
- TypeScript/TSX syntax transpilation audit passed on the locally prepared source/test workspace after restore/reorder/reminder hardening.
- Deterministic formatting-invariant check passed on the locally prepared tracked text set before the final GitHub-only documentation/component refinements.
- Required-file and README relative-link audit passed earlier in the session.
- GitHub code search returned no implementation `TODO`, `FIXME`, or `XXX` placeholders at the final source audit.
- Source audit found and fixed ES2022-incompatible `Array.prototype.toSorted` usage.
- Strict TypeScript review found and fixed the React error-boundary `state` override.
- CSP review found and fixed Vite development styling being blocked by the original style policy.
- Data-integrity review found and fixed malformed/duplicate backup acceptance.
- Recurrence review found and fixed reminder recurrence without due dates and non-atomic recurring writes.
- Edit-state review found and fixed stale TaskComposer values after editing.
- Reorder review found and fixed controls being active under non-manual sorts and keyboard movement using hidden global neighbors.
- Modal accessibility review added focus trapping/restoration and persistence-error feedback.
- Commit metadata was verified on connector-created Git objects as `Sanskar <sanskarin@outlook.in>`.

### Hosted GitHub verification status

Verification PR: **#1 — `docs: verify v0.1 repository quality gates`**.

The PR was merged after GitHub reported it as mergeable. At the most recent check, its hosted workflow runs remain queued:

- CodeQL run `32213783595` — `queued`
- E2E run `32213783601` — `queued`
- CI run `32213783631` — `queued`

Queued is not treated as successful. No `v0.1.0` tag has been created.

Current `main` CI and CodeQL contain concurrency cancellation so future superseded runs on the same ref do not keep consuming runner capacity.

## Environment/tooling limitations

- The execution sandbox could not resolve the npm registry host, so a clean dependency installation could not be completed locally.
- Because dependencies could not be installed locally, the complete dependency-backed `npm run check`, production Vite build, npm audit against a freshly resolved tree, Playwright browser installation, and browser E2E run could not be executed in the sandbox.
- `package-lock.json` could not be generated from a real successful npm resolution and was therefore not fabricated.
- The sandbox could not resolve `github.com` for a shell clone/push, so repository reads/writes were performed through the authenticated GitHub connector.
- Hosted GitHub runners remain queued, which is outside repository source control. The repository therefore remains a release candidate rather than a tagged release.

## Known limitations intentionally documented

- Browser reminders are checked while TaskMint is open. Reliable closed-app scheduled notifications are not claimed across all web/PWA browser/OS combinations.
- Real screenshots have not been fabricated. `docs/screenshots/README.md` defines the exact screenshot set to capture after a browser-verified release build succeeds.
- A Tauri desktop wrapper is not included in v0.1 because the PWA already targets Windows/macOS/Linux. Tauri remains an optional future evaluation only if native-only capabilities justify the additional complexity.
- Full transitive npm locking is pending a successful clean npm registry resolution. Direct dependencies are exact-version pinned meanwhile.

## Next exact tasks

1. Re-check hosted run IDs `32213783595`, `32213783601`, and `32213783631` and current `main` workflow status.
2. If any hosted check fails, inspect the exact failed job/step logs and commit the smallest regression fix; do not guess.
3. Once npm registry access is available, verify from a clean checkout with:
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
5. Capture real release screenshots listed in `docs/screenshots/README.md` using fictional/demo task data only.
6. Re-run the clean release checklist in `docs/release.md`.
7. Update `CHANGELOG.md` and this file with final green verification results.
8. Promote the current `Unreleased` changelog section to `0.1.0` only after all release gates succeed.
9. Only then create the `v0.1.0` tag and allow the release workflow to publish the web artifact.

## Migration notes

- IndexedDB v1: base `tasks` and `settings` stores.
- IndexedDB v2: adds reminder-aware and multi-entry tag indexing and normalizes missing reminder/tags/project/recurrence fields during upgrade.
- E2E migration coverage exercises the v1→v2 path in Chromium.
- Task JSON backup schema: version 2.
- Unsupported backup schema versions are rejected before data replacement.
- Malformed timestamps, duplicate IDs, invalid orders, impossible dates, and inconsistent task-status timestamps are rejected before restore.

## Release notes draft

TaskMint v0.1.0 is an offline-first, local-data task manager with a complete task lifecycle; priorities, notes, due dates, reminders, tags, projects, and recurring tasks; smart views, search, filtering, and sorting; accessible manual reordering; JSON/CSV portability; productivity statistics; light/dark/system themes; first-run onboarding; privacy/data controls; an installable PWA; validated IndexedDB migrations; security/privacy hardening; automated unit/component/E2E coverage; and professional GitHub CI, CodeQL, release, Dependabot, issue, contribution, funding, and documentation infrastructure.

## Recent meaningful commit history — verified against GitHub

- `5c9e6c5681023ba83b1c757f84ed00c205b84766` — `docs: keep v0.1 changes unreleased until verification`
- `559ff88fa53f1945c98ca85ab664c41d22ae3f2a` — `docs: refresh complete TaskMint handoff`
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
- `26fcc59fb464650a358b8cd0ea3c9bc9e0d8b0df` — `fix: handle recurring reminders and invalid calendar dates`
- `f6351a1b13aaef37a0fe6ab7b13957a264bc33e9` — `fix: permit Vite injected styles under CSP`
- `fc5eb5f7c39b128ddc4e1743128887764a5cf7de` — `fix: satisfy strict override checks in error boundary`
- `ce1e5829e3e304003e04627fc8e394c203d6c641` — `test: cover corrupt backup identifiers and timestamps`
- `4eff5a8f7eaf1d006adb43f5f388a82f27887327` — `fix: harden backup date and id validation`
- `9496673434bc57d9a6712d043d4c784eb9dd865f` — `fix: include end-to-end tests in type-aware project`
- `c92f64608dfe343ed881ca4bf713769cda66f564` — `fix: scope type-aware linting to project TypeScript`
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
- `2f3057900292ee9186d64a8b9d0ebc14b7661543` — `docs: add development guide`
- `a682772ed5577529a78e2ea4301f0ee93d060dca` — `docs: add setup guide`
- `4d974cd2a6fd55e7135c5dce717d6e77f1ce57e3` — `docs: document application architecture`
- `f3f16940637a4a37a226ce0b7e2066d1549bc892` — `docs: add milestone roadmap`
- `5834841f14187fd6aecde41ba80211e75ea5237c` — `docs: add project changelog`
- `34114abb28488bb1273b90a12917de74d28ba15f` — `docs: document local-first privacy behavior`
- `59beb00da1977ef7ced52c771359daa69d9e88c8` — `docs: add support contacts and funding guidance`
- `ed75406ce006845c3f9fec9f1ea9184deeee012f` — `docs: add security and disclosure policy`
- `a9fd745e6bc6bf3dfc8a58713be975c2924d2cef` — `docs: add community code of conduct`
- `17b0afa43bad8435f986e7171e6fa923bccb0ff8` — `docs: add contribution guide`
- `a151ea35adce6896ad7c9e5cee3ff03c0cdbf3eb` — `docs: add complete project README`
- `268ed87012098e2e00865c2612f827b21b217308` — `chore: add Buy Me a Coffee funding link`
- `0a919263e04da9d35df9225f2f9ba9d58ff0ba8a` — `chore: add pull request quality checklist`
- `4875776f88a4908696b9502412a579d84a31dd8a` — `chore: configure issue support routing`
- `689230e0cd5acd7f1dd3c53ffad854efdf6663b1` — `chore: add feature request form`
- `3d6daf5b8e8899c72553925aa4d3656283e1c9b7` — `chore: add privacy-aware bug report form`
- `63f3a4b44da247bdf6addeb3c6ef044094ec1375` — `chore: configure dependency update checks`
- `9f0f702a283d8a082f0877f90ae5451bf56cff0c` — `ci: add tagged web release workflow`
- `c7858397b876d53f8941bc40595da1ea443dfc46` — `ci: add CodeQL security analysis`
- `97ab7e928b9237ba5b0b7ae13d50107e6a732ec2` — `ci: add Chromium end-to-end workflow`
- `60b14355fbe81aaa4c66e208fd962ea71fe44cb8` — `ci: add full quality verification workflow`
- `c9dad1f4b4eef4f53515a9d943f24b179e69c9c5` — `test: add offline primary journey coverage`
- `fd35ccb127c47288634c1b053ffc55cca531988c` — `test: cover accessible task composer submission`
- `4bf2b7fd2a41679637c006191600634cebd3cb78` — `test: cover JSON and CSV portability`
- `eba3ff6003ba554de2dc0ca90706b03ccc1f5b05` — `test: cover task lifecycle recurrence and statistics`
- `7ed3bc81d907f59c9146c593fa4067c812ff3a54` — `test: add React test cleanup`
- `f9c4446ef762cc5aea39ec126e9ee83e0ec000a8` — `style: add responsive accessible design system`
- `2a6bd3fbbd56394a21d5594b9e785d7b8be20bd9` — `feat: mount application with error boundary`
- `1cca247dec226c5361c12b7539a5ced5b2353431` — `feat: wire complete TaskMint application workflow`
- `7046259c13db878280af38351c781a1e0188e720` — `feat: add privacy data appearance and about settings`
- `227fb2ac72efc85deb82de899fed9c125bc6a40c` — `feat: add accessible task item interactions`
- `3359bd2e61df7735ff374c179e4f02c9fde916ab` — `feat: add task creation and editing form`
- `5fa7ac39d1372f85aff0e44e1177377b56052a58` — `feat: add recoverable render error boundary`
- `20c85238cbb5f346ede2f28af8e37e5ca20b25db` — `feat: add first run onboarding`
- `92766fb92d5054fb61fce53224c5e7e1e31fc46e` — `feat: add productivity statistics panel`
- `14662c574efb19e818a88e3dc005d6a9f1accb7b` — `feat: add search filter and sort controls`
- `5867a61c68e941d9ac13b7e75b2a7a57f4cb338f` — `feat: add smart view project navigation`
- `109da502cf13317d56ed5e6e729596cb276d9bc0` — `feat: add English string catalog`
- `ddea23cd1a896ed514c704556e1dcf77e24543b9` — `feat: add opt-in browser reminders`
- `9ec0ff6caeff01780107df02028edcaded9c5c5d` — `feat: add redacted development logging`
- `808108c4b9619fe43c85e15ab057f25eb308eeca` — `feat: add JSON and CSV data portability`
- `b3381e778e7dcaac50388933944f40e5e0a394da` — `feat: add transactional task repository`
- `40d62e6711f507d6c35c10090a02aeb025ea9198` — `feat: add versioned IndexedDB schema`
- `423df72adfc5240ce117e449077ce9db71f2fc79` — `feat: validate imported task backups`
- `a963b1b2a9a7e2bddb474d6b6532cc738db3c4ec` — `feat: implement task lifecycle recurrence and smart views`
- `421918930b1a5dde3ae04ccb46e750cdc468f54f` — `feat: define task domain types`
- `0bf69dada1a5ec478be3e17ebf354cac823e921b` — `build: bootstrap React TypeScript PWA toolchain`
- `d52d073419f9126bfa44b0e6038dac2987fd39a4` — initial MIT license commit

The earlier atomic feature/test/documentation commits are intentionally preserved rather than squashed. This handoff file is the source of truth for the next continuation session.
