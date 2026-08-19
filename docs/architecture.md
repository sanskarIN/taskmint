# Architecture

TaskMint is a client-side modular monolith. It deliberately avoids a backend because the product's core value is private, offline-first task management.

## Layers

### Domain — `src/domain/`

Pure task rules live here: task creation/update, lifecycle transitions, recurrence, smart-view filtering, sorting, statistics, shared data limits, visible-slot ordering, and backup validation. Domain functions accept explicit time values where useful so tests remain deterministic.

Task limits are centralized in `src/domain/limits.ts` so interactive creation, JSON restore, CSV import, and UI affordances do not drift into different constraints.

### Persistence — `src/storage/`

Dexie wraps IndexedDB. `TaskMintDatabase` owns versioned schemas and migrations. `TaskRepository` exposes application-oriented operations and keeps transactions out of UI components.

Schema v2 indexes task identifiers, status, due/reminder dates, project, priority, order, timestamps, and multi-entry tags. Schema upgrades initialize fields introduced after v1.

### Utilities — `src/utils/`

Data import/export, keyboard shortcut resolution, local browser notifications, and development logging are isolated utilities. Imported data is treated as untrusted and validated before replacing or appending local state.

### Localization — `src/i18n/`

Visible English product copy is externalized in `src/i18n/en.ts`, including dynamic labels and status text. English is the only shipped locale in v0.1, but presentation components consume the catalog instead of embedding independent copies of product strings.

### Presentation — `src/components/` and `src/App.tsx`

Reusable accessible components render the application. `App.tsx` wires domain operations to the repository, tracks selected filters, coordinates side effects such as theme resolution and reminder checks, manages global keyboard shortcuts, and progressively renders matching task results in bounded pages.

## Data flow

1. UI emits a typed `TaskDraft` or lifecycle action.
2. Domain functions validate/normalize and create immutable task values.
3. Repository writes to IndexedDB.
4. React state updates only after persistence succeeds.
5. Filters/statistics are derived in memory from the current task set.
6. The matching result set is sliced to the current progressive-render limit before task cards mount.

This ordering avoids showing successful state that was not actually persisted and prevents very large imports from mounting every matching card at once.

## Offline model

Application assets are precached by the generated PWA service worker. Task content lives in IndexedDB. No network request is required for normal task operations.

## Error boundaries and recoverable failures

Expected validation errors are surfaced in the task form or import status. IndexedDB lifecycle failures are caught before React state changes and surface user-safe status text. Unexpected render failures are caught by `ErrorBoundary`, which provides a reload path without intentionally mutating stored data.
