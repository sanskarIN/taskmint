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

TaskMint is a privacy-friendly to-do list for people who want useful organization without an account, a cloud dependency, or manipulative productivity mechanics. Tasks persist locally in IndexedDB. The web build is an installable offline-first PWA, and Tauri 2 provides native shells for desktop and mobile without forking the task-management core.

## Screenshots

Real release screenshots belong in `docs/screenshots/`. Until the first platform-verified release captures are produced, that folder documents the expected capture set rather than presenting mock screenshots as real product images.

## Features

- Create, edit, complete, reopen, archive, restore, and delete tasks.
- Priorities, due dates, optional reminders, projects, tags, notes, and recurring tasks.
- Smart views for Inbox, Today, Upcoming, Overdue, Completed, Archived, and All Tasks.
- Search, tag/project/priority filters, deterministic manual ordering, and useful sort modes.
- `Ctrl/Cmd+K` focuses search and `N` focuses the new-task title when the user is not already typing or inside a modal.
- Native drag-and-drop plus keyboard-accessible move up/down controls.
- Progressive 100-task rendering keeps large matching result sets bounded while preserving the full filtered count.
- Offline-first IndexedDB persistence with a versioned schema, tested migration, transactional multi-task writes, validated reads, and fail-closed recovery when local data is malformed.
- JSON backup/restore and CSV import/export with strict enum/calendar/timestamp/field validation, safe-integer ordering, duplicate-header checks, strict quote placement, explicit CSV encoding versions, size limits, lossless structured tags, legacy compatibility, and spreadsheet-formula neutralization.
- Portable file handling: browser downloads/file inputs on the web and scoped system open/save dialogs in native applications.
- Local productivity statistics: active/completed counts, due/overdue counts, bounded seven-day completions, and completion rate.
- Light, dark, and system themes plus reduced-motion support.
- First-run onboarding, empty/loading/offline/error states, responsive layouts, and touch-friendly controls.
- Optional notifications requested only after explicit user action; browser builds use Web Notifications and native builds use the operating-system notification bridge.
- Large due-reminder bursts are bounded to a small individual batch plus one title-free summary notification.
- One-click local data deletion with a warning and backup-first workflow.
- Installable PWA with generated service worker/manifest and an explicit update prompt that waits for the user instead of automatically reloading over unsaved task input.
- Native external links open through the operating system rather than being trapped inside the app WebView.
- Least-privilege Tauri capabilities split between desktop and mobile targets.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl+K` / `Cmd+K` | Focus and select task search |
| `N` | Focus the new-task title when focus is outside an editable control |

Shortcuts are suspended while onboarding or Settings is open so modal keyboard behavior remains predictable.

## Supported platforms

| Platform | Distribution |
| --- | --- |
| Web | Modern evergreen browsers |
| PWA | Installable browser application |
| ChromeOS | PWA |
| Windows | Native Tauri application |
| macOS | Native Tauri application |
| Linux | Native Tauri application |
| Android | Native Tauri application |
| iOS / iPadOS | Native Tauri application |

The React/TypeScript product core is shared across every target. Platform-specific behavior is isolated under `src/platform/` and `src-tauri/`. See [docs/cross-platform.md](docs/cross-platform.md) for prerequisites, build commands, CI coverage, security boundaries, and platform limitations.

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

Dependencies are pinned to exact top-level versions in `package.json` and `src-tauri/Cargo.toml`. Real package-manager-generated lockfiles are release requirements and must not be fabricated manually.

## Quick start

Requirements for web development: Node.js 22.12 or newer and npm.

```bash
git clone https://github.com/sanskarIN/taskmint.git
cd taskmint
npm install
npm run dev
```

Open the local URL printed by Vite.

For a native desktop development build after installing the Tauri/Rust prerequisites for your OS:

```bash
npm run tauri:dev
```

Android and iOS require their vendor SDK toolchains. See [docs/cross-platform.md](docs/cross-platform.md).

## Development setup

```bash
npm install
npm run dev
```

No server, database service, account, API key, or secret is required. `.env.example` exists to make future deployment variables explicit, but TaskMint currently has no secret configuration.

See [docs/setup.md](docs/setup.md), [docs/development.md](docs/development.md), and [docs/cross-platform.md](docs/cross-platform.md).

## Quality checks

```bash
npm run format:check
npm run docs:check
npm run secrets:check
npm run lint
npm run typecheck
npm test
npm run build
```

Or run the combined local suite:

```bash
npm run check
```

Check the native Rust application after installing the Tauri system prerequisites:

```bash
npm run native:check
```

Run the non-gating 10,000-task domain benchmark separately:

```bash
npm run bench
```

End-to-end testing:

```bash
npm run test:e2e:install
npm run test:e2e
```

The automated suites cover the primary offline task journey, IndexedDB migration/corruption recovery, transactional bulk-persistence expectations, keyboard shortcuts, settings/export failure recovery, JSON backup/delete/restore, strict CSV compatibility/quoting/property/security cases, strict timestamps, reminder aggregation, PWA update wiring, release-guard behavior, progressive large-list rendering, and accessibility smoke checks. Native CI additionally checks the desktop Rust application on Linux, Windows, and macOS and builds Android/iOS debug targets. See [docs/testing.md](docs/testing.md) and [docs/cross-platform.md](docs/cross-platform.md).

## Production build and release

Web/PWA:

```bash
npm run build
npm run preview
```

Native desktop:

```bash
npm run tauri:build
```

Mobile initialization/build commands are documented in [docs/cross-platform.md](docs/cross-platform.md). Store and signed installer releases require platform-owner signing credentials and must never commit private keys or provisioning secrets.

Before tagging, real npm- and Cargo-generated lockfiles must be committed and the intended tag must exactly match `package.json`:

```bash
npm run release:check -- v0.1.0
```

For tags matching `v*.*.*`, the existing web release workflow fails closed unless its release guard passes, installs with `npm ci`, reruns `npm run check`, the high-severity npm audit, and Chromium E2E, then publishes the compressed web bundle with a SHA-256 checksum. Native store/release automation remains a separate signing-sensitive release concern. See [docs/release.md](docs/release.md).

## Architecture

TaskMint is a modular local-first application:

1. `src/domain/` contains task types, limits, strict datetime parsing, safe ordering, typed user-safe errors, business rules, recurrence, filtering, validation, and statistics.
2. `src/storage/` owns Dexie schema versions, migrations, transactions, repository operations, and validation of persisted records before they enter UI state.
3. `src/utils/` contains data portability, keyboard, bounded notification, and content-safe development logging helpers.
4. `src/platform/` contains runtime detection plus portable native/browser boundaries for files and external links.
5. `src/i18n/` contains the externalized English product string catalog, ready for additional locale packs.
6. `src/components/` contains accessible React UI modules, including the browser/PWA update prompt.
7. `src-tauri/` contains the Rust/native application shell, capabilities, plugin initialization, packaging config, and native icons.
8. `src/App.tsx` coordinates application state and use cases without moving persistence rules into presentation components.

See [docs/architecture.md](docs/architecture.md), [docs/cross-platform.md](docs/cross-platform.md), and [docs/adr/](docs/adr/).

## Security and privacy

TaskMint is local-first: it does not require a backend or user account and does not intentionally transmit task content. Imported files and local persisted rows are validated before use. New CSV exports neutralize spreadsheet-formula prefixes in user-controlled text while preserving TaskMint re-import, and malformed quoting/unknown TaskMint encoding versions are rejected instead of silently coerced. Development logging redacts metadata and does not print arbitrary exception messages. The production web shell and native shell use restrictive Content Security Policies; Vite-only WebSocket/inline-style allowances are limited to development.

Native filesystem permissions are limited to metadata and text operations reached through user-selected open/save dialog paths. TaskMint does not grant shell/process access for routine task operations.

If current IndexedDB data cannot be validated safely, TaskMint blocks the normal editor and leaves the stored local data untouched rather than presenting an empty-looking writable state.

Repository CI also includes a deterministic common-secret-pattern guard as defense in depth, alongside CodeQL and the high-severity npm dependency audit.

Notifications are optional. TaskMint currently checks reminders while the application is running; it does not claim reliable OS-level background scheduling after the app is fully terminated.

Read [SECURITY.md](SECURITY.md) and [PRIVACY.md](PRIVACY.md).

## Accessibility

TaskMint includes visible focus styles, semantic form controls, keyboard-accessible ordering, keyboard shortcuts with modal/typing safeguards, reduced motion, non-color-only labels, 40px-or-larger primary task controls, responsive touch targets, ARIA announcements for transient status/update messages, and a fail-closed recovery screen that does not expose unsafe editing controls. See [docs/accessibility.md](docs/accessibility.md).

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md), follow the [Code of Conduct](CODE_OF_CONDUCT.md), and keep changes small, tested, accessible, privacy-conscious, and cross-platform.

## License

TaskMint is open source under the [MIT License](LICENSE).

## Contact and support

- Business: `sanskarin@outlook.in`
- Business: `sanskarin.business@gmail.com`
- Support: `supportramsandesh@gmail.com`
- GitHub: https://github.com/sanskarIN
- Buy Me a Coffee: https://buymeacoffee.com/sanskarIN

**Made by the Sanskar**
