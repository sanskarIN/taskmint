# Testing

TaskMint uses multiple test layers and treats data portability, migrations, keyboard accessibility, reminders, offline behavior, documentation integrity, persistence atomicity, PWA update safety, native configuration, local-data corruption recovery, and repository hygiene as release-critical paths.

## Unit/domain

`tests/task.test.ts` covers:

- title and locale-independent tag normalization
- task field/count limits
- invalid calendar-date rejection
- recurrence boundaries and month-end clamping
- recurring reminders without due dates
- deterministic recurring-task ordering
- visible-slot task reordering
- smart-view filtering
- date rollover from Today to Overdue
- productivity statistics, including exclusion of future completion timestamps from the last-seven-days window

`tests/datetime.test.ts` verifies strict reminder/backup timestamp parsing, impossible-date rejection, leap-day acceptance, timezone-offset canonicalization, and compatibility with TaskMint's own exported ISO timestamps.

`tests/order.test.ts` covers:

- first/custom-step order allocation
- 100,000-entry allocation without argument spreading
- safe-integer/overflow rejection
- deterministic order+ID tie-breaking
- duplicate-order normalization while preserving visible order
- proof that normalized tied tasks become reorderable

`tests/validation-order.test.ts` verifies unsafe persisted order rejection and deterministic normalization of duplicate safe order slots during backup validation.

`tests/errors.test.ts` covers typed `TaskMintError` codes, safe default messages, malformed-JSON wrapping, row-aware CSV errors, immutable structured error details, and the UI boundary that hides unknown infrastructure messages.

`tests/logger.test.ts` verifies development diagnostics never print arbitrary `Error.message` text and that known TaskMint errors log only their stable code.

`tests/keyboard.test.ts` covers global shortcut resolution, modifier handling, editable-control protection, and modal blocking.

`tests/notifications.test.ts` covers successful one-time due-reminder delivery, isolated Notification-constructor failure, bounded individual reminder delivery, one title-free summary for excess reminders, and retryability when that summary cannot be delivered.

`tests/security-config.test.ts` locks the committed production CSP to self-restricted scripts/styles/connections and rejects accidental development WebSocket or inline-style allowances in the built HTML source.

`tests/pwa-config.test.ts` verifies prompt-mode PWA updates, absence of `autoUpdate`, the pinned `workbox-window` runtime dependency, explicit `updateServiceWorker(true)` activation, and mounting of the update prompt.

`tests/native-config.test.ts` verifies the cross-platform Tauri scripts/dependencies, native IPC CSP bridge, desktop/mobile capability sets, absence of shell capability, mobile safe-area viewport wiring, and suppression of the PWA updater in a native runtime.

`tests/repository.test.ts` verifies validated local task/settings reads, malformed-record rejection, default settings behavior, transactional bulk writes, bulk failure propagation, and empty-batch optimization.

`tests/release-guard.test.ts` executes the dependency-free release guard against isolated temporary fixtures and verifies exact tag/version matching plus fail-closed lockfile behavior.

## Data portability and generated properties

`tests/export.test.ts` covers:

- JSON backup round trips
- unsupported backup rejection
- duplicate task-ID rejection
- malformed timestamp rejection
- oversized backup-field rejection
- CSV quoting and multiline round trips
- lossless structured tag encoding, including tags containing the legacy `|` separator
- backward-compatible legacy pipe-separated tag imports
- reversible spreadsheet-formula neutralization for title/notes/project fields
- leading-apostrophe round trips and unchanged legacy CSV semantics
- deterministic stress round trips with commas, quotes, CR/LF content, Unicode, tags, projects, priorities, and recurrence
- UTF-8 BOM headers
- malformed enum/date rejection
- duplicate CSV-column rejection

`tests/csv-compat.test.ts` verifies that legacy `json:`-prefixed tag text is not confused with TaskMint's encoded format, structured decoding is used only for marked rows, malformed marked structured tags are rejected, and unknown non-empty TaskMint encoding versions fail closed.

`tests/csv-quoting.test.ts` rejects quote characters embedded in unquoted fields and characters after a closing quote while retaining valid escaped-quote parsing.

`tests/csv-security.test.ts` covers formula-like spreadsheet text after leading spaces, tabs, or newlines so restored backup-shaped notes cannot bypass export neutralization.

`tests/property.test.ts` uses seeded deterministic generation rather than production randomness to exercise hundreds of CSV/JSON round trips containing quotes, commas, CR/LF, Unicode, pipes, brackets, and other parser-sensitive characters. Its malformed structured-tag fixtures explicitly use TaskMint's encoding marker. Fixed seeds make every failure reproducible.

`tests/download.test.ts` verifies that the portable export operation is awaited, browser download clicks occur before object-URL cleanup, and cleanup is deferred to the next timer turn for browser compatibility.

## Component

`tests/TaskComposer.test.tsx` exercises accessible form behavior and guards against stale edit values through Testing Library.

`tests/SettingsDialog.test.tsx` verifies synchronous browser export failures are contained behind safe product copy and that stale Settings action errors disappear after close/reopen.

`src/test/setup.ts` performs shared Testing Library cleanup, restores real timers, clears mocks, un-stubs globals, and restores spies after every test so state cannot leak between cases.

## End to end

- `e2e/task-flow.spec.ts` creates a task, switches the browser context offline, completes it, and verifies the Completed smart view.
- `e2e/migration.spec.ts` creates a real legacy IndexedDB v1/native-version-10 database, opens TaskMint, and verifies the Dexie v2 migration normalized the legacy task.
- `e2e/corrupt-local-data.spec.ts` seeds malformed current-schema IndexedDB data and verifies TaskMint blocks the editor, leaves stored data untouched, and exposes only the recovery/reload path.
- `e2e/keyboard.spec.ts` verifies `Ctrl+K` search focus, `N` new-task focus, and typing-context protection.
- `e2e/backup-restore.spec.ts` downloads a real JSON backup, deletes local data, restores the backup through the file input, and verifies the task returns.
- `e2e/pagination.spec.ts` seeds 101 local tasks and verifies the UI renders 100 initially and progressively reveals the remainder.
- `e2e/accessibility.spec.ts` checks core landmarks, rejects unnamed buttons/unlabeled interactive form controls, and verifies shortcut metadata on search/new-task inputs.

Install Playwright's Chromium runtime before the first local E2E run:

```bash
npm run test:e2e:install
npm run test:e2e
```

## Native build validation

`.github/workflows/native.yml` provides source/build validation that cannot be represented by browser-only tests:

- Linux desktop Rust/Tauri check with the documented WebKitGTK/native prerequisites;
- Windows desktop Rust/Tauri check;
- macOS desktop Rust/Tauri check;
- Android ARM64 Rust target + generated-project initialization + debug package build;
- iOS Rust targets + generated-project initialization + simulator debug build on macOS.

These jobs validate buildability, not store publishing. Physical-device signing, notarization, Android release signing, Apple provisioning, and store review remain release-stage checks with owner-controlled credentials.

## Performance benchmark

`bench/task.bench.ts` uses Vitest 4's top-level `bench()` API to provide repeatable 10,000-task filtering/sorting and statistics benchmarks. Run them separately from pass/fail tests:

```bash
npm run bench
```

Benchmark timings are diagnostic rather than CI pass/fail thresholds because runner hardware and load vary. See `docs/performance.md` for comparison guidance.

## Deterministic repository checks

- `npm run format:check` rejects CRLF drift, missing final newlines, and trailing whitespace across tracked text paths, including `bench/`.
- `npm run docs:check` resolves repository-relative Markdown links and rejects links that escape the repository or point to missing local targets.
- `npm run secrets:check` scans tracked text paths, including benchmarks, for common private-key and credential-token patterns without sending repository content to a third-party service.
- `npm run release:check -- vX.Y.Z` verifies exact tag/package-version alignment and requires a committed `package-lock.json` before a release can proceed.

The first three checks intentionally require only Node.js and can run before npm dependencies are available. The release guard also uses only Node.js, but it is intentionally expected to fail until the real npm lockfile is committed.

## CI gates

Pull requests run formatting invariants, documentation-link validation, secret-pattern validation, linting, type checks, unit/component/property/config tests, production build, dependency audit, CodeQL, Chromium E2E coverage, and a separate native workflow. CI and E2E use `npm ci` automatically once a lockfile exists and otherwise retain the pre-release fallback install so development verification can continue before the first lockfile is generated. The E2E workflow also runs on pushes to `main`. CI, CodeQL, E2E, and Native CI use concurrency cancellation so superseded runs on the same ref do not waste runner capacity.

Current workflow definitions use supported current major versions for checkout/setup-node/upload-artifact and CodeQL, while Dependabot monitors GitHub Actions monthly.

Tagged web releases have no dependency-install fallback: they require the release guard, install only with `npm ci`, rerun the combined quality suite, high-severity dependency audit, and Chromium E2E, then create the release artifact and checksum. Native signed/store release automation remains separate because its credentials and platform-specific publishing requirements must not be committed.
