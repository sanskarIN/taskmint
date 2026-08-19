# Troubleshooting

## Tasks do not appear after reload

Check browser site-storage settings and confirm IndexedDB is allowed. Private/incognito modes may clear data differently. Export a JSON backup before clearing site data.

## PWA does not update immediately

The service worker uses auto-update behavior, but a browser may keep an existing tab alive. Close/reopen the installed PWA or reload after the new service worker activates.

## Notifications do not appear

Confirm browser/OS notification permissions and TaskMint's notification setting. Reminders are checked while TaskMint is open; TaskMint does not claim reliable closed-app background scheduling on every browser/OS combination.

Remember that reminder notification bodies contain task titles. If notification previews are hidden by the operating system, the reminder may arrive without visible detail until the device is unlocked.

## Import fails

Confirm the file is a TaskMint schema-v2 JSON backup or CSV with all exported headers. Imports above the documented size/task-count limits are rejected. CSV enum/date problems report the affected row; malformed JSON is reported with a stable safe message rather than the browser's parser internals.

For a full-fidelity restore, prefer TaskMint JSON backups. CSV is an interchange format and does not preserve original completion/archive timestamps.

## `npm run docs:check` fails

Read the reported Markdown file and relative target. Repository-relative links must resolve to an existing path and may not escape the repository. External URLs are intentionally not fetched by this deterministic check.

## `npm run secrets:check` fails

Inspect the reported path and line. Never work around the guard by weakening a pattern around a real credential. If a real credential was committed, revoke/rotate it first and follow `SECURITY.md`.

## Build or test dependency installation fails

Confirm Node 22.12+ and a working npm registry connection, then remove `node_modules` and rerun `npm install`. Do not fabricate `package-lock.json`; it must come from a successful npm resolution. Do not delete TaskMint browser storage when troubleshooting build tooling unless you already exported a backup.

## Playwright browser installation fails

Run `npm run test:e2e:install` from a network-enabled environment with permission to install Chromium dependencies. The release must not be tagged until browser E2E has completed successfully.
