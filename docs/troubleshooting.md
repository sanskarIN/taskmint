# Troubleshooting

## Tasks do not appear after reload

Check browser site-storage settings and confirm IndexedDB is allowed. Private/incognito modes may clear data differently. Export a JSON backup before clearing site data.

## PWA does not update immediately

The service worker uses auto-update behavior, but a browser may keep an existing tab alive. Close/reopen the installed PWA or reload after the new service worker activates.

## Notifications do not appear

Confirm browser/OS notification permissions and TaskMint's notification setting. Reminders are checked while TaskMint is open; TaskMint does not claim reliable closed-app background scheduling on every browser/OS combination.

## Import fails

Confirm the file is a TaskMint schema-v2 JSON backup or CSV with all exported headers. Imports above the documented size limit are rejected.

## Build or test dependency installation fails

Confirm Node 22.12+ and a working npm registry connection, then remove `node_modules` and rerun `npm install`. Do not delete TaskMint browser storage when troubleshooting build tooling unless you already exported a backup.
