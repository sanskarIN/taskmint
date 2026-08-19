# Architecture

TaskMint is a client-side modular monolith. It deliberately avoids a backend because the product's core value is private, offline-first task management.

## Layers

### Domain — `src/domain/`

Pure task rules live here: task creation/update, lifecycle transitions, recurrence, smart-view filtering, sorting, statistics, shared data limits, visible-slot ordering, typed user-safe errors, strict datetime parsing, and backup validation. Domain functions accept explicit time values where useful so tests remain deterministic.

Task limits are centralized in `src/domain/limits.ts` so interactive creation, JSON restore, CSV import, and UI affordances do not drift into different constraints.

`src/domain/datetime.ts` performs strict calendar/time validation before JavaScript `Date` normalization. This prevents impossible values such as February 31 from rolling into a different valid day during reminder or backup parsing.

`src/domain/errors.ts` owns stable `TaskMintError` codes and default safe messages. Domain and import modules throw those typed errors instead of inventing independent validation strings. Structured details such as row number, field name, task ID, and maximum length are carried separately from the code.

`src/domain/order.ts` owns all manual-order arithmetic. It uses a deterministic `order` + task-ID comparator, safe-integer allocation, and duplicate-slot normalization. New-task ordering scans iteratively instead of spreading the entire task list into `Math.max`, keeping behavior safe at the application's large import boundary.

### Persistence — `src/storage/`

Dexie wraps IndexedDB. `TaskMintDatabase` owns versioned schemas and migrations. `TaskRepository` exposes application-oriented operations and keeps transactions out of UI components.

Schema v2 indexes task identifiers, status, due/reminder dates, project, priority, order, timestamps, and multi-entry tags. Schema upgrades initialize fields introduced after v1.

Every multi-task `putTasks` call executes inside an explicit Dexie read-write transaction. This is important because a bare `bulkPut` can otherwise persist successful rows even when another row in the same batch fails. Imports, recurring completion, and reordering therefore use all-or-nothing batch persistence.

Repository reads do not trust IndexedDB merely because the data is local. Tasks/settings are validated before they enter React state. Duplicate safe order slots are normalized in memory while preserving deterministic visible order. Malformed rows cause the initial load to fail closed; TaskMint does not delete or silently rewrite those records.

### Utilities — `src/utils/`

Data import/export, keyboard shortcut resolution, local browser notifications, and development logging are isolated utilities. Imported data is treated as untrusted and validated before replacing or appending local state.

CSV exports use a version marker for reversible spreadsheet-safe text encoding and a structured `json:` tag representation. Imports still accept the earlier unmarked pipe-separated tag representation for backwards compatibility, but reject unknown non-empty TaskMint encodings, malformed structured payloads, invalid quote placement, and unterminated quotes.

Reminder delivery is bounded: only a small number of due tasks generate individual title-bearing notifications in one polling pass. Additional due reminders are summarized in one title-free count notification, and failed delivery remains retryable.

Development logging avoids arbitrary error-message text. Event metadata is redacted by sensitive field name; error diagnostics carry only a broad error kind or stable TaskMint error code.

### Localization — `src/i18n/`

Visible English product copy is externalized in `src/i18n/en.ts`, including dynamic labels and status text. English is the only shipped locale in v0.1, but presentation components consume the catalog instead of embedding independent copies of product strings.

### Presentation — `src/components/` and `src/App.tsx`

Reusable accessible components render the application. `App.tsx` wires domain operations to the repository, tracks selected filters, coordinates side effects such as theme resolution and reminder checks, manages global keyboard shortcuts, and progressively renders matching task results in bounded pages.

`PwaUpdatePrompt` owns the installed-app update interaction through `virtual:pwa-register/react`. New service workers wait instead of automatically reloading the page. When the user explicitly chooses Update now, the component calls `updateServiceWorker(true)` to activate the waiting version.

If the repository cannot safely load current local data, `App.tsx` renders a blocked recovery state with only a reload path. The normal task editor/settings actions are not shown, preventing new writes from being mixed with unreadable hidden data.

## Data flow

1. UI emits a typed `TaskDraft` or lifecycle action.
2. Domain functions validate/normalize and create immutable task values or a typed `TaskMintError`.
3. Repository writes to IndexedDB; multi-task operations are explicitly transactional.
4. React state updates only after persistence succeeds.
5. Persisted data is revalidated before entering state on a future startup.
6. Filters/statistics are derived in memory from the current validated task set.
7. The matching result set is sliced to the current progressive-render limit before task cards mount.

This ordering avoids showing successful state that was not actually persisted, avoids partial multi-task writes, fails closed on corrupted local records, and prevents very large imports from mounting every matching card at once.

## Offline and update model

Application assets are precached by the generated PWA service worker. Task content lives in IndexedDB. No network request is required for normal task operations.

TaskMint uses a prompt/waiting service-worker update lifecycle rather than automatic tab reloads. This protects unsaved task input; activation occurs only after explicit user action.

## Content Security Policy

The committed production HTML uses origin-restricted script, style, image, connection, manifest, object, base, and form directives. Production does not include `style-src 'unsafe-inline'` or broad WebSocket schemes. The Vite development server applies a dev-only HTML transform that adds inline-style and WebSocket allowances for style injection/HMR without weakening the built release shell.

## Error boundaries and recoverable failures

Expected validation/import failures use stable typed errors and surface safe messages in the task form or import status. IndexedDB lifecycle failures are caught before React state changes and surface user-safe status text. Initial unreadable/corrupt storage blocks editing without mutating existing records. Unexpected render failures are caught by `ErrorBoundary`, which provides a reload path without intentionally mutating stored data.
