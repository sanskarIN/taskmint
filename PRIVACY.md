# TaskMint Privacy

TaskMint is designed to work without an account or required application backend. The core privacy model is local-first: task content is stored in the browser profile where TaskMint is used.

## Data stored locally

TaskMint stores task records and application settings in the browser's IndexedDB database named:

```text
taskmint
```

Task data can include:

- task ID;
- title;
- notes;
- priority;
- due date;
- reminder date/time;
- tags;
- project;
- recurrence;
- active/completed/archived status;
- completion/archive timestamps;
- creation/update timestamps;
- manual-order value.

Settings can include:

- theme;
- onboarding completion;
- reduced-motion preference;
- browser-notification enabled state.

Search/filter/statistics state is generally derived/in-memory rather than a separate authoritative persisted profile in the current schema.

## Local validation and recovery

TaskMint does not automatically trust IndexedDB merely because it is local.

Persisted task/settings rows are validated before entering application state.

If current local records cannot be validated safely:

- normal editing is blocked;
- the existing browser data remains in place;
- TaskMint does not silently replace the data with an empty list;
- TaskMint does not automatically delete/repair the malformed records;
- the user sees a recovery/reload state.

This design reduces accidental local data loss when browser storage is unreadable or externally modified.

## Network behavior

TaskMint has no required TaskMint application server for ordinary task operations and does not intentionally send task content to a TaskMint server as part of normal create/edit/search/filter/complete/import logic.

Network requests can still occur because of ordinary web/PWA behavior, including:

- loading the TaskMint site/static assets from its host;
- service-worker/application update checks for static assets;
- explicitly following external links such as GitHub or Buy Me a Coffee.

Task content is not intentionally attached to static application update requests.

If future versions add cloud sync, accounts, analytics, or remote services, this privacy document and architecture decision records must be updated before representing the same privacy model.

## PWA updates

TaskMint uses a waiting/prompt service-worker update model rather than automatic tab reload.

A new application version may be downloaded/cached by ordinary PWA mechanisms, but activation waits for explicit user action through the TaskMint update prompt.

This protects unsaved task input from surprise automatic reloads; it is not a mechanism for transmitting task content.

## Browser notifications

Notification permission is requested only after the user explicitly chooses the enable-notifications action.

Reminder checks run while TaskMint is open. TaskMint does not claim reliable background reminder scheduling while every TaskMint window/PWA instance is closed on every browser/OS.

### Title exposure

For a small bounded number of due reminders, individual notification bodies contain the task title.

Depending on browser/OS configuration, those titles may appear outside the TaskMint window, including:

- notification center;
- desktop banners;
- lock-screen surfaces;
- synchronized notification surfaces provided by the user's OS/browser ecosystem.

If task titles are sensitive, keep TaskMint notifications disabled or configure private notification previews at the browser/operating-system level.

### Excess reminder summary

If more reminders are due than the individual batch limit, additional reminders are represented by one summary notification containing only a count, not those excess task titles.

A failed individual/summary delivery remains eligible for retry rather than being silently marked delivered.

## JSON backups

Users can explicitly export a JSON backup from Settings.

JSON is the full-fidelity TaskMint portability format and can contain all task fields plus application settings.

A downloaded JSON backup is a readable file. Once downloaded, its privacy is controlled by the user's:

- filesystem permissions;
- backup software;
- cloud-sync folder choices;
- email/messaging/sharing choices;
- device/account security.

Deleting TaskMint's browser-local database does not delete previously exported files.

## CSV exports

CSV exports contain readable task information intended for interchange/spreadsheet use.

They can include:

- title;
- notes;
- priority;
- due/reminder values;
- tags;
- project;
- recurrence;
- status.

CSV is not encryption and should be handled as readable user data.

TaskMint neutralizes spreadsheet-formula prefixes in current marked exports as a safety measure; that protection does not make the content private.

## Import files

JSON/CSV import happens only after the user explicitly selects a file.

TaskMint reads the file in the browser, validates it, and writes accepted task data to local IndexedDB.

The selected file input value is cleared immediately after TaskMint captures the browser `File` object, before asynchronous import processing completes. This supports reliable same-file retries and does not upload the file to a TaskMint backend.

## Local deletion

Settings provides a **Delete all local data** action with confirmation.

After successful deletion, TaskMint clears its local task/settings records.

Separately, browser actions such as clearing site data/uninstalling the PWA/browser profile can remove IndexedDB/cached assets independently.

Deleting browser-local TaskMint data does not erase downloaded JSON/CSV exports stored elsewhere.

## Development diagnostic logging

TaskMint's helper logger is development-only and returns immediately outside development builds.

### Errors

`logError` intentionally records only:

- coarse error kind; or
- stable TaskMint error code.

It does not intentionally print arbitrary raw `Error.message` text, because those messages can contain browser/internal/user context.

### Event metadata

`logEvent` fails closed rather than allowing arbitrary strings by default.

Allowed retained shapes are limited to:

- `null`;
- booleans;
- numbers;
- restricted identifier strings under narrowly recognized identifier key names.

Other content is replaced with `[REDACTED]`, including:

- arbitrary strings;
- arrays;
- nested objects;
- common sensitive field names;
- unsafe identifier strings;
- ordinary lookalike keys that merely end in the letters `id`.

This reduces accidental exposure of task titles/notes/projects/tags through development diagnostics.

## No intentional analytics profile

TaskMint v0.1 does not include an application analytics/tracking system that builds a remote task/user activity profile.

GitHub hosting/repository pages, the website host, browser extensions, DNS/network providers, operating systems, or external links may have their own independent privacy behavior outside TaskMint's application code.

## Local storage is not TaskMint-encrypted

TaskMint does not currently encrypt IndexedDB records itself.

Anyone with sufficient access to the same unlocked browser/OS profile may be able to inspect local browser storage.

Users handling sensitive data should use appropriate:

- OS account lock/security;
- disk/device encryption;
- browser profile security;
- physical access controls.

## Data retention

Task data remains in the local browser profile until one of these happens:

- the user deletes it through TaskMint;
- browser/site-data controls remove it;
- the browser profile is removed/reset;
- another local process/profile action modifies the storage.

TaskMint does not operate a required remote account database whose retention can be managed independently of the user's browser profile.

## External links

TaskMint may display links to project/support/funding resources such as GitHub or Buy Me a Coffee. Following those links navigates to third-party sites governed by their own privacy practices.

## Privacy-sensitive contribution rule

Changes involving any of these require explicit privacy documentation review:

- remote synchronization;
- accounts/authentication;
- analytics/telemetry;
- crash reporting that sends data remotely;
- server-side backup;
- task sharing/collaboration;
- notification content expansion;
- external AI/API processing of task text;
- encryption/key management.

Update `docs/architecture.md`, relevant ADRs, `SECURITY.md`, and this file before shipping such a change.

## More technical detail

- `docs/data-model.md` — exact stored/exported fields.
- `docs/architecture.md` — runtime data flows.
- `docs/user-guide.md` — user controls and exports/deletion.
- `SECURITY.md` — security design/reporting.

## Contact

Privacy questions:

- `sanskarin@outlook.in`
- `supportramsandesh@gmail.com`
