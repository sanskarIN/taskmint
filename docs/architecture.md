# Architecture

TaskMint is a local-first modular application with a shared React/TypeScript core. It deliberately avoids a backend because the product's core value is private, offline-first task management. The same core runs in browsers/PWAs and inside Tauri 2 native shells for desktop and mobile.

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

Data import/export, keyboard shortcut resolution, bounded reminder orchestration, and development logging are isolated utilities. Imported data is treated as untrusted and validated before replacing or appending local state.

CSV exports use a version marker for reversible spreadsheet-safe text encoding and a structured `json:` tag representation. Imports still accept the earlier unmarked pipe-separated tag representation for backwards compatibility, but reject unknown non-empty TaskMint encodings, malformed structured payloads, invalid quote placement, and unterminated quotes.

Reminder delivery is bounded: only a small number of due tasks generate individual title-bearing notifications in one polling pass. Additional due reminders are summarized in one title-free count notification, and failed delivery remains retryable.

Development logging avoids arbitrary error-message text. Event metadata is redacted by sensitive field name; error diagnostics carry only a broad error kind or stable TaskMint error code.

### Platform boundary — `src/platform/`

Platform adapters keep browser/native differences out of domain and presentation logic.

- `runtime.ts` is the canonical Tauri-runtime detector.
- `files.ts` uses browser Blob downloads in web/PWA builds and Tauri system open/save dialogs plus scoped filesystem operations in native builds. Native import size is checked before file contents are read.
- `links.ts` keeps normal browser navigation on the web and delegates external HTTP(S), mail, and telephone links to the operating system in native builds.
- Notification delivery selects the Web Notifications API or the Tauri notification plugin at runtime while preserving the same bounded/retryable reminder policy.

The browser/PWA implementation remains the fallback whenever the application is not running inside Tauri.

### Native shell — `src-tauri/`

Tauri 2 wraps the shared frontend for Windows, macOS, Linux, Android, and iOS/iPadOS.

- `src/lib.rs` is the shared native entry point and carries the mobile entry-point attribute.
- `src/main.rs` is the desktop executable entry point.
- `tauri.conf.json` owns the native window, native CSP, bundling, and application icons.
- `capabilities/desktop.json` and `capabilities/mobile.json` declare least-privilege permissions for dialogs, text-file metadata/reads/writes, notifications, and operating-system URL opening.
- `icons/` contains native PNG/ICO/ICNS assets derived from the TaskMint logo.

The native layer intentionally does not expose shell/process execution or broad filesystem access for normal product operations.

### Localization — `src/i18n/`

Visible English product copy is externalized in `src/i18n/en.ts`, including dynamic labels and platform-aware status text. English is the only shipped locale in v0.1, but presentation components consume the catalog instead of embedding independent copies of product strings.

### Presentation — `src/components/` and `src/App.tsx`

Reusable accessible components render the application. `App.tsx` wires domain operations to the repository, tracks selected filters, coordinates side effects such as theme resolution and reminder checks, manages global keyboard shortcuts, installs the native external-link boundary, and progressively renders matching task results in bounded pages.

`PwaUpdatePrompt` owns the installed-web-app update interaction through `virtual:pwa-register/react`. New service workers wait instead of automatically reloading the page. When the user explicitly chooses Update now, the component calls `updateServiceWorker(true)` to activate the waiting version. The component returns no updater inside a native Tauri runtime because native package updates belong to the platform distribution channel.

`SettingsDialog` keeps one user flow while selecting the appropriate file boundary: browser file inputs/downloads on the web and native system dialogs in Tauri.

If the repository cannot safely load current local data, `App.tsx` renders a blocked recovery state with only a reload path. The normal task editor/settings actions are not shown, preventing new writes from being mixed with unreadable hidden data.

## Data flow

1. UI emits a typed `TaskDraft` or lifecycle action.
2. Domain functions validate/normalize and create immutable task values or a typed `TaskMintError`.
3. Repository writes to IndexedDB; multi-task operations are explicitly transactional.
4. React state updates only after persistence succeeds.
5. Persisted data is revalidated before entering state on a future startup.
6. Filters/statistics are derived in memory from the current validated task set.
7. The matching result set is sliced to the current progressive-render limit before task cards mount.
8. Platform integrations are resolved only at the boundary; they do not change task-domain state rules.

This ordering avoids showing successful state that was not actually persisted, avoids partial multi-task writes, fails closed on corrupted local records, prevents very large imports from mounting every matching card at once, and keeps native/web differences from fragmenting core behavior.

## Offline and update model

Application assets are precached by the generated PWA service worker in browser/PWA builds. Native packages bundle the frontend assets directly. Task content lives in IndexedDB in either runtime. No network request is required for normal task operations.

The web/PWA build uses a prompt/waiting service-worker update lifecycle rather than automatic tab reloads. This protects unsaved task input; activation occurs only after explicit user action. Native builds do not register that PWA updater and are updated through their package/store distribution path.

TaskMint currently checks due reminders while the application is running. Native notification delivery improves system integration but does not claim platform background scheduling after the app is fully terminated.

## Native build/CI model

`.github/workflows/native.yml` validates native source separately from the existing web quality workflow:

- Linux, Windows, and macOS desktop Rust/native checks;
- Android initialization plus ARM64 debug build;
- iOS initialization plus a simulator debug build on macOS.

Signed installers, store packages, physical-device provisioning, notarization, and publishing remain release-stage concerns because they require vendor credentials that must not be committed to the repository.

## Content Security Policy

The committed production HTML uses origin-restricted script, style, image, connection, manifest, object, base, and form directives. Production does not include `style-src 'unsafe-inline'` or broad WebSocket schemes. The Vite development server applies a dev-only HTML transform that adds inline-style and WebSocket allowances for style injection/HMR without weakening the built release shell.

The native Tauri window has its own explicit CSP for bundled assets and IPC plus prototype freezing. Capability files provide the second layer of native authorization. Do not widen either boundary merely for development convenience.

## Error boundaries and recoverable failures

Expected validation/import failures use stable typed errors and surface safe messages in the task form or import status. IndexedDB lifecycle failures are caught before React state changes and surface user-safe status text. Initial unreadable/corrupt storage blocks editing without mutating existing records. Native/browser integration failures use safe product copy and content-safe logging. Unexpected render failures are caught by `ErrorBoundary`, which provides a reload path without intentionally mutating stored data.

See [cross-platform.md](cross-platform.md) for the detailed platform matrix, prerequisites, capabilities, and release boundaries.
