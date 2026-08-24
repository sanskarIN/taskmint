<div align="center">
  <img src="public/taskmint-icon.svg" width="104" height="104" alt="TaskMint logo" />
  <h1>TaskMint</h1>
  <p><strong>A calm, offline-first task manager for web, desktop, and mobile.</strong></p>

[![CI](https://github.com/sanskarIN/taskmint/actions/workflows/ci.yml/badge.svg)](https://github.com/sanskarIN/taskmint/actions/workflows/ci.yml)
[![Native CI](https://github.com/sanskarIN/taskmint/actions/workflows/native.yml/badge.svg)](https://github.com/sanskarIN/taskmint/actions/workflows/native.yml)
[![CodeQL](https://github.com/sanskarIN/taskmint/actions/workflows/codeql.yml/badge.svg)](https://github.com/sanskarIN/taskmint/actions/workflows/codeql.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-sanskarIN-FFDD00?logo=buy-me-a-coffee&logoColor=000000)](https://buymeacoffee.com/sanskarIN)
</div>

## Why TaskMint?

TaskMint is a privacy-friendly to-do list for people who want useful organization without an account, cloud dependency, or manipulative productivity mechanics. Tasks persist locally in IndexedDB. The web build is an installable offline-first PWA, while Tauri 2 provides native shells for Windows, macOS, Linux, Android, and iOS/iPadOS without forking the task-management core.

The project deliberately treats local storage/imports as real trust boundaries: persisted and imported data is validated, multi-task writes are transactional, destructive restore is preflight-validated, and task UI success state is applied only after persistence succeeds.

## Screenshots

Real release screenshots belong in `docs/screenshots/`. Until the first platform-verified release captures are produced, that folder documents the expected capture set rather than presenting mock/generated screenshots as real product evidence.

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
- Portable file handling: browser downloads/file inputs on web/PWA and scoped system open/save dialogs in native applications.
- Local productivity statistics: active/completed counts, due/overdue counts, bounded seven-day completions, and completion rate.
- Light, dark, and system themes plus reduced-motion support.
- First-run onboarding, empty/loading/offline/error states, responsive layouts, accessible navigation/filter groups, and touch-friendly controls.
- Optional notifications requested only after explicit user action; web/PWA uses Web Notifications and native builds use the operating-system notification bridge.
- Large due-reminder bursts are bounded to a small individual batch plus one title-free summary notification.
- One-click local data deletion with confirmation and backup-first guidance.
- Installable PWA with generated service worker/manifest and an explicit update prompt that waits for user action instead of automatically reloading over unsaved task input.
- Native external `http:`, `https:`, `mailto:`, and `tel:` links open through the operating system rather than remaining trapped in the app WebView.
- Least-privilege Tauri capability files are separated for desktop and mobile targets.

## Complete documentation

The detailed documentation index is [docs/README.md](docs/README.md).

Core references:

- [User guide](docs/user-guide.md) — complete end-user behavior, features, imports/exports, reminders, offline/PWA, recovery, accessibility.
- [Setup](docs/setup.md) — environment, install, build, browser/E2E, local PWA/storage inspection.
- [Cross-platform guide](docs/cross-platform.md) — Windows/macOS/Linux/Android/iOS/iPadOS/ChromeOS prerequisites, commands, CI, security boundaries, and release limitations.
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

| Platform | Distribution | Repository target |
| --- | --- | --- |
| Web | Modern evergreen browser | Supported |
| PWA | Installable web app | Supported |
| ChromeOS | PWA | Supported |
| Windows | Native Tauri application | Supported source target |
| macOS | Native Tauri application | Supported source target |
| Linux | Native Tauri application | Supported source target |
| Android | Native Tauri application | Supported source target |
| iOS / iPadOS | Native Tauri application | Supported source target |

“Supported source target” means the repository contains the native shell, capabilities, platform adapters, build scripts, icons, and hosted native build lane. Public store distribution still requires publisher-owned signing identities, developer accounts, provisioning, and release credentials.

The React/TypeScript product core is shared across every target. Platform-specific behavior is isolated under `src/platform/` and `src-tauri/`. See [docs/cross-platform.md](docs/cross-platform.md) for the complete platform guide.

## Technology

- React 19 + TypeScript
- Vite
- Dexie / IndexedDB
- vite-plugin-pwa / Workbox
- Tauri 2 + Rust
- Tauri dialog, filesystem, notification, and opener plugins
- Vitest + Testing Library
- Playwright
- ESLint + typescript-eslint + Prettier
- GitHub Actions + CodeQL

Top-level JavaScript and Rust dependencies are exact-version pinned in `package.json` and `src-tauri/Cargo.toml`. Real npm- and Cargo-generated lockfiles are release requirements and must not be fabricated manually.

## Quick start

Use a Node.js version satisfying `package.json` and npm `12.0.2`; hosted workflows currently pin Node.js `22.23.2` and npm `12.0.2`.

```bash
git clone https://github.com/sanskarIN/taskmint.git
cd taskmint
npm install
npm run dev
```

Open the local URL printed by Vite.

TaskMint requires no application backend, remote database, account, API key, or secret.

For native desktop development, first install the Rust/Tauri prerequisites for your operating system, then run:

```bash
npm run tauri:dev
```

Android and iOS/iPadOS require their vendor SDK toolchains. See [docs/cross-platform.md](docs/cross-platform.md).

## Development setup

See [docs/setup.md](docs/setup.md) for web/PWA setup, [docs/development.md](docs/development.md) for implementation rules, and [docs/cross-platform.md](docs/cross-platform.md) for native prerequisites and commands.

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

Native Rust/Tauri check after installing host prerequisites:

```bash
npm run native:check
```

Non-gating 10,000-task domain benchmark:

```bash
npm run bench
```

See [docs/testing.md](docs/testing.md), [docs/test-matrix.md](docs/test-matrix.md), [docs/operations.md](docs/operations.md), and [docs/cross-platform.md](docs/cross-platform.md).

## Production builds

Web/PWA:

```bash
npm run build
npm run preview
```

Use build/preview rather than the development HMR server when verifying production CSP/service-worker/PWA behavior.

Native desktop for the current host:

```bash
npm run tauri:build
```

Mobile initialization/build commands and signing boundaries are documented in [docs/cross-platform.md](docs/cross-platform.md).

## Architecture summary

TaskMint is a layered local-first application:

1. `src/domain/` — data types, limits, strict dates/timestamps, errors, manual order, task lifecycle/recurrence/filter/stats, persisted validation.
2. `src/storage/` — Dexie schema/migrations and validated/transactional repository boundary.
3. `src/utils/` — JSON/CSV portability, keyboard resolution, bounded reminders, privacy-safe logging, exclusive mutation helper.
4. `src/platform/` — runtime detection plus browser/native boundaries for files and external links.
5. `src/i18n/` — externalized English product strings and safe typed-error presentation.
6. `src/components/` — accessible presentation and local interaction locks.
7. `src-tauri/` — native Rust shell, plugin initialization, capabilities, packaging configuration, and native icons.
8. `src/App.tsx` — application state/use-case orchestration, persistence-first task flows, App-wide task mutation exclusion, reminder lifecycle, and platform-safe effects.

See [docs/architecture.md](docs/architecture.md), [docs/cross-platform.md](docs/cross-platform.md), [docs/repository-reference.md](docs/repository-reference.md), and [docs/file-index.md](docs/file-index.md).

## Data ownership and portability

Task content is stored locally in IndexedDB on the current browser profile or native application WebView profile.

JSON is the full-fidelity backup/restore format. CSV is a human-readable interchange format and does not preserve original lifecycle timestamps.

Imported files are size/count bounded and strictly validated. JSON restore validates the complete backup before destructive persistence begins. CSV appends allocate order slots after existing local tasks. Native file access remains user-mediated through operating-system open/save dialogs and scoped filesystem permissions.

See [docs/data-model.md](docs/data-model.md) and [docs/user-guide.md](docs/user-guide.md).

## Security and privacy

TaskMint is local-first: it does not require a backend/account and does not intentionally transmit task content as part of normal task operations.

Security/privacy controls include:

- restrictive committed production web CSP and explicit native Tauri CSP;
- dev-only HMR/style CSP relaxations isolated to Vite serve mode;
- least-privilege native capabilities without routine shell/process permissions;
- native filesystem text access scoped through user-selected open/save dialog paths;
- validation of persisted/imported records;
- transactional multi-task persistence;
- safe typed validation errors;
- spreadsheet-formula neutralization;
- strict CSV version/quote handling;
- fail-closed development diagnostic redaction;
- secret-pattern repository guard;
- CodeQL;
- high-severity npm audit in CI/release.

If current IndexedDB data cannot be validated safely, TaskMint blocks normal editing and leaves the stored local records untouched rather than presenting an empty-looking writable state.

Read [SECURITY.md](SECURITY.md) and [PRIVACY.md](PRIVACY.md).

## Reminders

Notifications are optional and permission is requested only after explicit user action. Web/PWA builds use Web Notifications; native builds use the Tauri operating-system notification bridge.

TaskMint currently checks due reminders while the application is running. It does not claim reliable OS-level background scheduling after the application is fully terminated. Title-bearing notifications remain bounded and excess due reminders are summarized without task titles.

## Accessibility

TaskMint's baseline includes semantic controls/landmarks, visible focus, keyboard ordering, current-navigation semantics, named filter groups, shortcut metadata, modal focus containment/restoration, reduced motion, non-color-only labels, responsive/touch-friendly controls, busy/disabled pending state, and status/update announcements.

See [docs/accessibility.md](docs/accessibility.md).

## Release status and process

The package version can exist before a release tag; a version number alone is not release verification.

Before tagging, the project requires:

- real npm-generated committed `package-lock.json`;
- real Cargo-generated committed `src-tauri/Cargo.lock` for reproducible native dependency resolution;
- exact-current-tree successful CI, E2E, Native CI, and CodeQL;
- locked install and quality/audit/browser gates;
- manual release checklist;
- real screenshots from verified builds using fictional/demo data;
- exact release tag/package version readiness check.

Run the tag/lockfile guard only when preparing a real tag:

```bash
npm run release:check -- v0.1.0
```

Tagged `v*.*.*` web releases run a fail-closed workflow that installs with `npm ci`, reruns quality/audit/E2E, packages `dist/`, generates SHA-256 checksum, and publishes both files. Signed native/store releases require platform-owner signing credentials and remain a separate signing-sensitive release concern.

See [docs/release.md](docs/release.md), [docs/operations.md](docs/operations.md), and [docs/cross-platform.md](docs/cross-platform.md).

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md), follow the [Code of Conduct](CODE_OF_CONDUCT.md), and keep changes focused, tested, accessible, privacy-conscious, cross-platform, and documented.

## License

TaskMint is open source under the [MIT License](LICENSE).

## Contact and support

- Business: `sanskarin@outlook.in`
- Business: `sanskarin.business@gmail.com`
- Support: `supportramsandesh@gmail.com`
- GitHub: https://github.com/sanskarIN
- Buy Me a Coffee: https://buymeacoffee.com/sanskarIN

**Made by the Sanskar**
