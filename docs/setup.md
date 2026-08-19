# TaskMint Setup Guide

This guide covers development, production preview, test browser installation, and local PWA/storage inspection.

For repository commands/CI policy see `operations.md`. For implementation rules see `development.md`.

## 1. Requirements

### Required

- Node.js 22.12 or newer
- npm
- Git
- modern browser

The package engine requirement is defined in `package.json`.

### For browser E2E

Playwright Chromium and its system dependencies are required. The repository provides a command to install them.

### Not required

TaskMint currently needs no:

- backend server;
- database server;
- hosted account;
- API key;
- application secret;
- cloud storage provider;
- external authentication service.

Task data lives in browser IndexedDB.

## 2. Clone

```bash
git clone https://github.com/sanskarIN/taskmint.git
cd taskmint
```

For contribution work, branch from the latest intended base rather than making unrelated changes directly on a release branch.

## 3. Verify Node/npm

```bash
node --version
npm --version
```

Node should satisfy:

```text
>=22.12
```

If multiple Node installations exist, confirm the shell used by your editor/terminal resolves the same intended version.

## 4. Dependency installation during development

Current pre-release development setup:

```bash
npm install
```

A real npm-generated `package-lock.json` is required before release but is intentionally not fabricated when registry resolution is unavailable.

Once the repository has a reviewed committed lockfile, reproducible clean installs should use:

```bash
npm ci --ignore-scripts
```

Do not hand-create a lockfile.

## 5. Environment file

`.env.example` documents the current environment shape:

```text
VITE_APP_NAME=TaskMint
```

It also explicitly states that TaskMint currently requires no secrets/backend configuration.

Ordinary `.env` files are ignored by Git.

Never put credentials into a committed example file.

## 6. Start development server

```bash
npm run dev
```

Open the local URL printed by Vite.

### Development CSP note

The committed `index.html` contains the restrictive production CSP.

Vite serve mode injects only development-specific allowances required for style injection and HMR WebSockets. If HMR works differently from production, do not weaken the production CSP as a shortcut.

## 7. Production build

```bash
npm run build
```

This runs TypeScript project build checks and creates the Vite `dist/` output.

`dist/` is generated and ignored by Git.

## 8. Preview production build

```bash
npm run preview
```

Use production preview for realistic PWA/service-worker verification rather than relying on the HMR development server.

## 9. Basic quality verification

Run the combined non-E2E quality suite:

```bash
npm run check
```

It includes:

- format invariants;
- documentation links;
- secret-pattern guard;
- ESLint;
- TypeScript;
- Vitest;
- production build.

Dependency audit is separate:

```bash
npm audit --audit-level=high
```

## 10. Playwright installation

Install Chromium + required system dependencies:

```bash
npm run test:e2e:install
```

Run E2E:

```bash
npm run test:e2e
```

Playwright builds and previews TaskMint automatically using `playwright.config.ts`.

Local E2E uses:

```text
http://127.0.0.1:4173
```

## 11. Benchmark

Optional diagnostic benchmark:

```bash
npm run bench
```

This is not a correctness gate or universal timing threshold.

## 12. Recommended editor settings

The repository includes `.editorconfig`:

- UTF-8;
- LF;
- final newline;
- 2-space indentation;
- trailing whitespace cleanup outside Markdown exception.

Prettier config uses:

- single quotes;
- semicolons;
- no trailing commas;
- print width 100.

An editor with EditorConfig + Prettier + TypeScript/ESLint integration is convenient but not required; repository commands remain authoritative.

## 13. Browser storage inspection

Use browser developer tools -> Application/Storage to inspect local TaskMint browser state.

Expected storage areas include:

- IndexedDB database `taskmint`;
- PWA service worker;
- Cache Storage created by Workbox/service worker;
- manifest metadata.

Current IndexedDB tables:

- `tasks`;
- `settings`.

Do not manually alter real personal data merely to test corruption behavior. Use dedicated test profiles/fixtures.

## 14. PWA verification setup

Run:

```bash
npm run build
npm run preview
```

Then inspect:

1. manifest is available;
2. TaskMint icon/name are correct;
3. service worker registers;
4. application shell can reload after cached while offline;
5. local task data persists through IndexedDB;
6. update behavior uses a waiting prompt rather than automatic page reload;
7. Update now activates the waiting worker;
8. unsaved form input is not unexpectedly replaced by automatic service-worker activation.

## 15. Offline development testing

For user-flow testing, Playwright includes an offline task journey.

For manual testing:

1. run production preview;
2. load TaskMint once online so assets can be cached;
3. use browser network/offline controls;
4. reload/open supported cached shell;
5. create/complete/edit local tasks as appropriate;
6. restore network and verify state remains local/intact.

Remember: `navigator.onLine` is a coarse browser signal, not a guarantee that every network path is reachable.

## 16. Notification testing

Notifications require explicit user permission.

Use a test browser profile when possible. Permission behavior varies by browser/OS.

TaskMint checks reminders while the app is open; do not expect a closed PWA to provide a portable cross-browser background alarm scheduler.

## 17. Import/export testing setup

Use fictional fixture content.

### JSON

Test:

- backup download;
- delete local data;
- restore through file picker;
- malformed backup rejection without destructive clear.

### CSV

Test:

- quotes/commas/multiline text;
- structured tags;
- legacy pipe tags;
- formula-like text;
- blank records;
- invalid row reporting;
- merge into existing tasks/manual order.

Do not use private personal task exports in public bug reports/screenshots.

## 18. Troubleshooting dependency installation

If install fails:

- verify Node/npm version;
- inspect the exact npm error;
- confirm network/registry/DNS access;
- do not create a fake lockfile to bypass the error;
- do not weaken package integrity/release checks just to obtain a green-looking run.

See `troubleshooting.md`.

## 19. Clean generated outputs

Generated/local paths include:

- `node_modules/`
- `dist/`
- `coverage/`
- `playwright-report/`
- `test-results/`

They are ignored by Git and can be regenerated from source/tooling.

Be careful not to confuse deleting generated output with deleting browser IndexedDB user data.

## 20. Setup completion checklist

A development environment is ready when you can:

- run `npm run dev`;
- run `npm run typecheck`;
- run `npm test`;
- run `npm run build`;
- preview the production build;
- install/run Chromium E2E when browser testing is required.

Release readiness additionally requires a real committed lockfile and the full release process; a working development server is not release certification.
