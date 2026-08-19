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

TaskMint is a privacy-friendly to-do list for people who want useful organization without an account, a cloud dependency, or manipulative productivity mechanics. Tasks persist in IndexedDB and the PWA shell is designed to keep working after assets have been cached.

## Screenshots

Real release screenshots belong in `docs/screenshots/`. Until the first browser-verified release capture is produced, that folder documents the expected capture set rather than presenting mock screenshots as real product images.

## Features

- Create, edit, complete, reopen, archive, restore, and delete tasks.
- Priorities, due dates, optional reminders, projects, tags, notes, and recurring tasks.
- Smart views for Inbox, Today, Upcoming, Overdue, Completed, Archived, and All Tasks.
- Search, tag/project/priority filters, manual ordering, and useful sort modes.
- Native drag-and-drop plus keyboard-accessible move up/down controls.
- Offline-first IndexedDB persistence with a versioned schema and migration.
- JSON backup/restore and CSV import/export with input validation and size limits.
- Local productivity statistics: active/completed counts, due/overdue counts, seven-day completions, and completion rate.
- Light, dark, and system themes plus reduced-motion support.
- First-run onboarding, empty/loading/offline/error states, responsive layouts, and touch-friendly controls.
- Optional browser notifications that are requested only after explicit user action.
- One-click local data deletion with a warning and backup-first workflow.
- Installable PWA with generated service worker and manifest.

## Supported platforms

TaskMint targets modern evergreen browsers on Windows, macOS, and Linux. It can be installed as a Progressive Web App where the browser supports PWA installation. The web app remains the primary distribution target; a Tauri wrapper can be considered later if native-only integrations justify it.

## Technology

- React 19 + TypeScript
- Vite
- Dexie / IndexedDB
- vite-plugin-pwa / Workbox
- Vitest + Testing Library
- Playwright
- ESLint + typescript-eslint + Prettier
- GitHub Actions + CodeQL

Dependencies are pinned to exact top-level versions in `package.json`.

## Quick start

Requirements: Node.js 22.12 or newer and npm.

```bash
git clone https://github.com/sanskarIN/taskmint.git
cd taskmint
npm install
npm run dev
```

Open the local URL printed by Vite.

## Development setup

```bash
npm install
npm run dev
```

No server, database service, account, API key, or secret is required. `.env.example` exists to make future deployment variables explicit, but TaskMint currently has no secret configuration.

See [docs/setup.md](docs/setup.md) and [docs/development.md](docs/development.md).

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

End-to-end testing:

```bash
npm run test:e2e:install
npm run test:e2e
```

See [docs/testing.md](docs/testing.md).

## Production build and release

```bash
npm run build
npm run preview
```

The release workflow runs the complete quality suite for tags matching `v*.*.*` and publishes the built web bundle as a GitHub Release artifact. See [docs/release.md](docs/release.md).

## Architecture

TaskMint is a modular client-side application:

1. `src/domain/` contains task types, business rules, recurrence, filtering, validation, and statistics.
2. `src/storage/` owns Dexie schema versions, migrations, transactions, and repository operations.
3. `src/utils/` contains data portability, notification, and redacted logging helpers.
4. `src/components/` contains accessible React UI modules.
5. `src/App.tsx` coordinates application state and use cases without moving persistence rules into presentation components.

See [docs/architecture.md](docs/architecture.md) and [docs/adr/](docs/adr/).

## Security and privacy

TaskMint is local-first: it does not require a backend or user account and does not intentionally transmit task content. Imported files are validated and size-limited. Logging redacts common sensitive fields and is development-only. The HTML shell defines a restrictive Content Security Policy.

Browser notifications are optional. Because browsers do not provide a reliable cross-platform local background scheduler for a closed PWA, reminders are checked while TaskMint is open; this limitation is documented rather than hidden.

Read [SECURITY.md](SECURITY.md) and [PRIVACY.md](PRIVACY.md).

## Accessibility

TaskMint includes visible focus styles, semantic form controls, keyboard-accessible ordering, reduced motion, non-color-only labels, responsive touch targets, and ARIA announcements for transient status messages. See [docs/accessibility.md](docs/accessibility.md).

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md), follow the [Code of Conduct](CODE_OF_CONDUCT.md), and keep changes small, tested, accessible, and privacy-conscious.

## License

TaskMint is open source under the [MIT License](LICENSE).

## Contact and support

- Business: `sanskarin@outlook.in`
- Business: `sanskarin.business@gmail.com`
- Support: `supportramsandesh@gmail.com`
- GitHub: https://github.com/sanskarIN
- Buy Me a Coffee: https://buymeacoffee.com/sanskarIN

**Made by the Sanskar**
