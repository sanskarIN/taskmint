<div align="center">
  <img src="public/taskmint-icon.svg" width="104" height="104" alt="TaskMint logo" />
  <h1>TaskMint</h1>
  <p><strong>A calm, offline-first task manager that keeps your data in your browser.</strong></p>

[![CI](https://github.com/sanskarIN/taskmint/actions/workflows/ci.yml/badge.svg)](https://github.com/sanskarIN/taskmint/actions/workflows/ci.yml)
[![CodeQL](https://github.com/sanskarIN/taskmint/actions/workflows/codeql.yml/badge.svg)](https://github.com/sanskarIN/taskmint/actions/workflows/codeql.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-sanskarIN-FFDD00?logo=buy-me-a-coffee&logoColor=000000)](https://buymeacoffee.com/sanskarIN)
</div>

## Why TaskMint?

TaskMint is a privacy-friendly to-do list for people who want useful organization without an account, cloud dependency, or manipulative productivity mechanics. Tasks persist in IndexedDB and the PWA shell is designed to keep working after assets have been cached.

The project deliberately treats local storage/imports as real trust boundaries: persisted and imported data is validated, multi-task writes are transactional, destructive restore is preflight-validated, and task UI success state is applied only after persistence succeeds.

## Screenshots

Real release screenshots belong in `docs/screenshots/`. Until the first browser-verified release capture is produced, that folder documents the expected capture set rather than presenting mock/generated screenshots as real product evidence.

## Features

- Create, edit, complete, reopen, archive, restore, and delete tasks, with Undo after successful delete.
- Priorities, due dates, optional reminders, projects, tags, notes, and recurring tasks.
- Smart views for Inbox, Today, Upcoming, Overdue, Completed, Archived, and All Tasks.
- Search, tag/project/priority filters, deterministic manual ordering, and useful sort modes.
- `Ctrl/Cmd+K` focuses search and `N` focuses the new-task title when the user is not already typing, inside a modal, or blocked by a pending task mutation.
- Native drag-and-drop plus keyboard-accessible move up/down controls.
- Progressive 100-task rendering keeps large matching result sets bounded while preserving the full filtered count.
- Offline-first IndexedDB persistence with versioned schema, tested migration, transactional multi-task writes, validated reads/writes, and fail-closed recovery when local data is malformed.
- Application-wide task mutation serialization prevents different task rows/forms from racing writes from one stale state snapshot; local component locks also protect same-control duplicate activation.
- Collision-free order allocation for new recurring occurrences and CSV appends.
- JSON backup/restore and CSV import/export with strict enums/calendar/timestamps/field validation, safe-integer ordering, duplicate-header checks, strict quote placement, explicit encoding versions, size/count limits, lossless structured tags, legacy compatibility, source row diagnostics, and spreadsheet-formula neutralization.
- Local productivity statistics: active/completed counts, due/overdue counts, bounded seven-day completions, and completion rate.
- Light, dark, and system themes plus reduced-motion support.
- First-run onboarding, empty/loading/offline/error states, responsive layouts, accessible navigation/filter groups, and touch-friendly controls.
- Optional browser notifications requested only after explicit user action; large due-reminder bursts are bounded to a small individual batch plus one title-free summary notification.
- One-click local data deletion with confirmation and backup-first guidance.
- Installable PWA with generated service worker/manifest and an explicit update prompt that waits for user action instead of automatically reloading over unsaved task input.

## Complete documentation

The detailed documentation index is [docs/README.md](docs/README.md).

Core references:

- [User guide](docs/user-guide.md) — complete end-user behavior, features, imports/exports, reminders, offline/PWA, recovery, accessibility.
- [Setup](docs/setup.md) — environment, install, build, browser/E2E, local PWA/storage inspection.
- [Architecture](docs/architecture.md) — runtime layers, data flow, persistence, concurrency, failures, PWA/security boundaries.
- [Data model](docs/data-model.md) — exact Task/Settings/Backup contracts, IndexedDB versions, JSON v2, CSV `safe-text-v1`.
- [Complete file index](docs/file-index.md) — machine-audited inventory of every tracked repository file.
- [Repository reference](docs/repository-reference.md) — detailed ownership and coupling map for repository subsystems/files.
- [Development guide](docs/development.md) — implementation rules and change discipline.
- [Testing guide](docs/testing.md) — strategy and commands.
- [Test matrix](docs/test-matrix.md) — every current test/E2E/benchmark/shared-test-setup file and its responsibility.
- [Operations handbook](docs/operations.md) — scripts, CI, E2E, CodeQL, release workflow, lockfile/CSP/PWA operations, exact-SHA verification.
- [Accessibility](docs/accessibility.md), [performance](docs/performance.md), [release](docs/release.md), [troubleshooting](docs/troubleshooting.md), and [GitHub governance](docs/github.md).
- [Architecture Decision Records](docs/adr/) — durable rationale for local-first, repository boundary, validation, mutation serialization, and portability versioning.

Repository policies:

- [Security](SECURITY.md)
- [Privacy](PRIVACY.md)
- [Support](SUPPORT.md)
- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [License](LICENSE)
- [Roadmap](ROADMAP.md)
- [Changelog](CHANGELOG.md)

Current engineering/release handoff:

- [what_changed.md](what_changed.md)

## Documentation completeness

TaskMint treats documentation completeness as a repository invariant.

```bash
npm run docs:inventory
```

The dependency-free inventory checker compares the real tracked file set from `git ls-files` against `docs/file-index.md` and also verifies that every test/E2E/benchmark/shared-test-setup path is present in `docs/test-matrix.md`.

This check is part of `npm run check` and the CI quality workflow, so adding a tracked file without updating the documentation inventory is intended to fail verification.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl+K` / `Cmd+K` | Focus and select task search |
| `N` | Focus the new-task title when focus is outside an editable control |

Shortcuts are suspended while onboarding or Settings is open and while an App-wide task mutation is pending. `N` also respects an active task edit context.

## Supported platforms

TaskMint targets modern evergreen browsers on Windows, macOS, and Linux. It can be installed as a Progressive Web App where the browser supports PWA installation.

The web/PWA build remains the primary distribution target. A desktop wrapper can be evaluated later only if native-only integrations justify the additional architecture.

## Technology

- React 19 + TypeScript
- Vite
- Dexie / IndexedDB
- vite-plugin-pwa / Workbox
- Vitest + Testing Library
- Playwright
- ESLint + typescript-eslint + Prettier
- GitHub Actions + CodeQL

Top-level dependencies are pinned to exact versions in `package.json`. A real npm-generated `package-lock.json` is a release requirement and must not be fabricated manually.

## Quick start

Requirements: Node.js 22.12 or newer and npm.

```bash
git clone https://github.com/sanskarIN/taskmint.git
cd taskmint
npm install
npm run dev
```

Open the local URL printed by Vite.

TaskMint requires no application backend, remote database, account, API key, or secret.

## Development setup

See [docs/setup.md](docs/setup.md) for complete installation and browser/PWA setup and [docs/development.md](docs/development.md) for implementation rules.

Core commands:

```bash
npm install
npm run dev
npm run check
```

## Quality checks

Individual deterministic/source checks:

```bash
npm run format:check
npm run docs:check
npm run docs:inventory
npm run secrets:check
npm run lint
npm run typecheck
npm test
npm run build
```

Combined non-E2E suite:

```bash
npm run check
```

Current `npm run check` order is format -> documentation links -> documentation inventory -> secret patterns -> lint -> typecheck -> Vitest -> production build.

Dependency audit:

```bash
npm audit --audit-level=high
```

Browser end-to-end testing:

```bash
npm run test:e2e:install
npm run test:e2e
```

Non-gating 10,000-task domain benchmark:

```bash
npm run bench
```

See [docs/testing.md](docs/testing.md), [docs/test-matrix.md](docs/test-matrix.md), and [docs/operations.md](docs/operations.md).

## Production build and PWA preview

```bash
npm run build
npm run preview
```

Use build/preview rather than the development HMR server when verifying production CSP/service-worker/PWA behavior.

## Architecture summary

TaskMint is a layered client-side application:

1. `src/domain/` — data types, limits, strict dates/timestamps, errors, manual order, task lifecycle/recurrence/filter/stats, persisted validation.
2. `src/storage/` — Dexie schema/migrations and validated/transactional repository boundary.
3. `src/utils/` — JSON/CSV portability, keyboard resolution, bounded reminders, privacy-safe logging, exclusive mutation helper.
4. `src/i18n/` — externalized English product strings and safe typed-error presentation.
5. `src/components/` — accessible presentation and local interaction locks.
6. `src/App.tsx` — application state/use-case orchestration, persistence-first task flows, App-wide task mutation exclusion, browser effects.

See [docs/architecture.md](docs/architecture.md), [docs/repository-reference.md](docs/repository-reference.md), and [docs/file-index.md](docs/file-index.md).

## Data ownership and portability

Task content is stored in browser IndexedDB.

JSON is the full-fidelity backup/restore format. CSV is a human-readable interchange format and does not preserve original lifecycle timestamps.

Imported files are size/count bounded and strictly validated. JSON restore validates the complete backup before destructive persistence begins. CSV appends allocate order slots after existing local tasks.

See [docs/data-model.md](docs/data-model.md) and [docs/user-guide.md](docs/user-guide.md).

## Security and privacy

TaskMint is local-first: it does not require a backend/account and does not intentionally transmit task content as part of normal task operations.

Security/privacy controls include:

- restrictive committed production CSP;
- dev-only HMR/style CSP relaxations isolated to Vite serve mode;
- validation of persisted/imported records;
- transactional multi-task persistence;
- safe typed validation errors;
- spreadsheet-formula neutralization;
- strict CSV version/quote handling;
- fail-closed development diagnostic redaction;
- secret-pattern repository guard;
- CodeQL;
- high-severity npm audit in CI/release.

If current IndexedDB data cannot be validated safely, TaskMint blocks normal editing and leaves the stored browser records untouched rather than presenting an empty-looking writable state.

Read [SECURITY.md](SECURITY.md) and [PRIVACY.md](PRIVACY.md).

## Browser reminders

Notifications are optional and permission is requested only after explicit user action.

Browsers do not provide a reliable portable local background scheduler for a closed PWA, so TaskMint checks due reminders while the app is open. It bounds title-bearing notifications and summarizes excess due reminders without task titles.

## Accessibility

TaskMint's baseline includes semantic controls/landmarks, visible focus, keyboard ordering, current-navigation semantics, named filter groups, shortcut metadata, modal focus containment/restoration, reduced motion, non-color-only labels, responsive/touch-friendly controls, busy/disabled pending state, and status/update announcements.

See [docs/accessibility.md](docs/accessibility.md).

## Release status and process

The package version can exist before a release tag; a version number alone is not release verification.

Before tagging, the project requires:

- real npm-generated committed `package-lock.json`;
- exact-current-tree successful CI/E2E/CodeQL;
- locked install and quality/audit/browser gates;
- manual release checklist;
- real screenshots from the verified build using fictional/demo data;
- exact release tag/package version readiness check.

Run the tag/lockfile guard only when preparing a real tag:

```bash
npm run release:check -- v0.1.0
```

Tagged `v*.*.*` releases run a fail-closed workflow that installs with `npm ci`, reruns quality/audit/E2E, packages `dist/`, generates SHA-256 checksum, and publishes both files.

See [docs/release.md](docs/release.md) and [docs/operations.md](docs/operations.md).

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md), follow the [Code of Conduct](CODE_OF_CONDUCT.md), and keep changes focused, tested, accessible, privacy-conscious, and documented.

## License

TaskMint is open source under the [MIT License](LICENSE).

## Contact and support

- Business: `sanskarin@outlook.in`
- Business: `sanskarin.business@gmail.com`
- Support: `supportramsandesh@gmail.com`
- GitHub: https://github.com/sanskarIN
- Buy Me a Coffee: https://buymeacoffee.com/sanskarIN

**Made by the Sanskar**
