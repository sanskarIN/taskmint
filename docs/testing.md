# Testing

TaskMint uses multiple test layers and treats data portability, migrations, keyboard accessibility, reminders, offline behavior, documentation integrity, persistence atomicity, and repository hygiene as release-critical paths.

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
- productivity statistics

`tests/errors.test.ts` covers typed `TaskMintError` codes, safe default messages, malformed-JSON wrapping, row-aware CSV errors, immutable structured error details, and the UI boundary that hides unknown infrastructure messages.

`tests/keyboard.test.ts` covers global shortcut resolution, modifier handling, editable-control protection, and modal blocking.

`tests/notifications.test.ts` covers successful one-time due-reminder delivery and verifies that a throwing browser `Notification` constructor is isolated instead of escaping the reminder loop.

`tests/security-config.test.ts` locks the committed production CSP to self-restricted scripts/styles/connections and rejects accidental development WebSocket or inline-style allowances in the built HTML source.

`tests/repository.test.ts` verifies that multi-task writes are routed through a read-write transaction, bulk failures propagate, and empty batches do not open unnecessary transactions.

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

`tests/property.test.ts` uses seeded deterministic generation rather than production randomness to exercise hundreds of CSV/JSON round trips containing quotes, commas, CR/LF, Unicode, pipes, brackets, and other parser-sensitive characters. It also checks malformed structured-tag payloads. The fixed seeds make every failure reproducible.

`tests/download.test.ts` verifies that export download clicks occur before object-URL cleanup and that cleanup is deferred to the next timer turn for browser compatibility.

## Component

`tests/TaskComposer.test.tsx` exercises accessible form behavior and guards against stale edit values through Testing Library.

`src/test/setup.ts` performs shared Testing Library cleanup, restores real timers, clears mocks, un-stubs globals, and restores spies after every test so state cannot leak between cases.

## End to end

- `e2e/task-flow.spec.ts` creates a task, switches the browser context offline, completes it, and verifies the Completed smart view.
- `e2e/migration.spec.ts` creates a real legacy IndexedDB v1/native-version-10 database, opens TaskMint, and verifies the Dexie v2 migration normalized the legacy task.
- `e2e/keyboard.spec.ts` verifies `Ctrl+K` search focus, `N` new-task focus, and typing-context protection.
- `e2e/backup-restore.spec.ts` downloads a real JSON backup, deletes local data, restores the backup through the file input, and verifies the task returns.
- `e2e/pagination.spec.ts` seeds 101 local tasks and verifies the UI renders 100 initially and progressively reveals the remainder.
- `e2e/accessibility.spec.ts` checks core landmarks, rejects unnamed buttons/unlabeled interactive form controls, and verifies shortcut metadata on search/new-task inputs.

Install Playwright's Chromium runtime before the first local E2E run:

```bash
npm run test:e2e:install
npm run test:e2e
```

## Performance benchmark

`bench/task.bench.ts` provides a repeatable 10,000-task benchmark for filtering/sorting and statistics. Run it separately from pass/fail tests:

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

Pull requests run formatting invariants, documentation-link validation, secret-pattern validation, linting, type checks, unit/component/property tests, production build, dependency audit, CodeQL, and Chromium E2E coverage. CI and E2E use `npm ci` automatically once a lockfile exists and otherwise retain the pre-release fallback install so development verification can continue before the first lockfile is generated. The E2E workflow also runs on pushes to `main`. CI, CodeQL, and E2E use concurrency cancellation so superseded runs on the same ref do not waste runner capacity.

Tagged releases have no fallback: they require the release guard, install only with `npm ci`, rerun the combined quality suite, high-severity dependency audit, and Chromium E2E, then create the release artifact and checksum.
