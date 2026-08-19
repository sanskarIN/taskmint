# Troubleshooting

## Tasks do not appear after reload

Check browser site-storage settings and confirm IndexedDB is allowed. Private/incognito modes may clear data differently. Export a JSON backup before clearing site data.

If TaskMint shows **Could not safely load local TaskMint data**, it detected a storage/read/validation problem and intentionally blocked the normal editor. Reload after resolving the browser-storage problem. Do not clear site data merely to make the message disappear unless you understand that clearing it removes the local records; preserve or inspect the browser profile first if the data matters.

## PWA update is waiting

TaskMint intentionally does not use automatic tab reloads for updates because an automatic reload can discard unsaved task input. When a new version is ready, the app shows a TaskMint update notice with **Update now** and **Later**.

Save any current task draft, then choose **Update now** to activate the waiting service worker and reload. Choosing **Later** dismisses the notice for the current session. If activation fails, TaskMint shows safe error text and leaves local task data unchanged.

## Notifications do not appear

Confirm browser/OS notification permissions and TaskMint's notification setting. Reminders are checked while TaskMint is open; TaskMint does not claim reliable closed-app background scheduling on every browser/OS combination.

Individual reminder notification bodies contain task titles. If more than the small individual batch are due at once, TaskMint combines the excess into one count-only summary notification. If notification previews are hidden by the operating system, an individual reminder may arrive without visible detail until the device is unlocked.

## Import fails

Confirm the file is a TaskMint schema-v2 JSON backup or CSV with all required headers. Imports above the documented size/task-count limits are rejected.

JSON rejects impossible calendar/timestamp values, unsafe task-order numbers, duplicate task IDs, incompatible status timestamps, malformed settings, and oversized fields before replacing current data.

CSV rejects missing/duplicate required columns, malformed enums/dates/timestamps, unsupported non-empty TaskMint encoding versions, malformed structured tags, invalid quote placement, unterminated quotes, and task-field limit violations. Row-aware errors identify the affected record where applicable. Unmarked legacy pipe-separated tag cells remain supported, including legacy tag text beginning with `json:`.

For a full-fidelity restore, prefer TaskMint JSON backups. CSV is an interchange format and does not preserve original completion/archive timestamps.

## Export fails

Browser Blob/object-URL/download APIs can fail because of browser policy or environment problems. TaskMint contains those failures inside Settings and shows generic export failure text instead of exposing browser internals. Existing local data is not changed by a failed export.

## `npm run docs:check` fails

Read the reported Markdown file and relative target. Repository-relative links must resolve to an existing path and may not escape the repository. External URLs are intentionally not fetched by this deterministic check.

## `npm run secrets:check` fails

Inspect the reported path and line. Never work around the guard by weakening a pattern around a real credential. If a real credential was committed, revoke/rotate it first and follow `SECURITY.md`.

## Build or test dependency installation fails

Confirm Node 22.12+ and a working npm registry connection, then remove `node_modules` and rerun `npm install`. Do not fabricate `package-lock.json`; it must come from a successful npm resolution. Do not delete TaskMint browser storage when troubleshooting build tooling unless you already exported a backup.

## Playwright browser installation fails

Run `npm run test:e2e:install` from a network-enabled environment with permission to install Chromium dependencies. The release must not be tagged until browser E2E has completed successfully.
