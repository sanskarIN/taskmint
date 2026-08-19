# Architecture

TaskMint is a client-side modular monolith. It deliberately avoids a backend because the product's core value is private, offline-first task management.

## Layers

### Domain — `src/domain/`

Pure task rules live here: task creation/update, lifecycle transitions, recurrence, smart-view filtering, sorting, statistics, and backup validation. Domain functions accept explicit time values where useful so tests remain deterministic.

### Persistence — `src/storage/`

Dexie wraps IndexedDB. `TaskMintDatabase` owns versioned schemas and migrations. `TaskRepository` exposes application-oriented operations and keeps transactions out of UI components.

Schema v2 indexes task identifiers, status, due/reminder dates, project, priority, order, timestamps, and multi-entry tags. Schema upgrades initialize fields introduced after v1.

### Utilities — `src/utils/`

Data import/export, local browser notifications, and development logging are isolated utilities. Imported data is treated as untrusted and validated before replacing local state.

### Presentation — `src/components/` and `src/App.tsx`

Reusable accessible components render the application. `App.tsx` wires domain operations to the repository, tracks selected filters, and coordinates side effects such as theme resolution and reminder checks.

## Data flow

1. UI emits a typed `TaskDraft` or lifecycle action.
2. Domain functions validate/normalize and create immutable task values.
3. Repository writes to IndexedDB.
4. React state updates only after persistence succeeds.
5. Filters/statistics are derived in memory from the current task set.

This ordering avoids showing successful state that was not actually persisted.

## Offline model

Application assets are precached by the generated PWA service worker. Task content lives in IndexedDB. No network request is required for normal task operations.

## Error boundaries

Expected user/data errors are surfaced near the action or through status toasts. Unexpected render failures are caught by `ErrorBoundary`, which provides a reload path without intentionally mutating stored data.
