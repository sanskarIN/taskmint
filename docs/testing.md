# Testing

TaskMint uses multiple test layers and treats data portability, migrations, keyboard accessibility, and offline behavior as release-critical paths.

## Unit/domain

`tests/task.test.ts` covers:

- title and tag normalization
- task field/count limits
- invalid calendar-date rejection
- recurrence boundaries and month-end clamping
- recurring reminders without due dates
- deterministic recurring-task ordering
- visible-slot task reordering
- smart-view filtering
- productivity statistics

`tests/keyboard.test.ts` covers global shortcut resolution, modifier handling, editable-control protection, and modal blocking.

## Data portability

`tests/export.test.ts` covers:

- JSON backup round trips
- unsupported backup rejection
- duplicate task-ID rejection
- malformed timestamp rejection
- oversized backup-field rejection
- CSV quoting and multiline round trips
- UTF-8 BOM headers
- malformed enum/date rejection
- duplicate CSV-column rejection

## Component

`tests/TaskComposer.test.tsx` exercises accessible form behavior and guards against stale edit values through Testing Library.

## End to end

- `e2e/task-flow.spec.ts` creates a task, switches the browser context offline, completes it, and verifies the Completed smart view.
- `e2e/migration.spec.ts` creates a real legacy IndexedDB v1/native-version-10 database, opens TaskMint, and verifies the Dexie v2 migration normalized the legacy task.
- `e2e/keyboard.spec.ts` verifies `Ctrl+K` search focus, `N` new-task focus, and typing-context protection.
- `e2e/backup-restore.spec.ts` downloads a real JSON backup, deletes local data, restores the backup through the file input, and verifies the task returns.
- `e2e/pagination.spec.ts` seeds 101 local tasks and verifies the UI renders 100 initially and progressively reveals the remainder.

Install Playwright's Chromium runtime before the first local E2E run:

```bash
npm run test:e2e:install
npm run test:e2e
```

## CI gates

Pull requests run formatting invariants, linting, type checks, unit/component tests, production build, dependency audit, CodeQL, and Chromium E2E coverage. The E2E workflow also runs on pushes to `main`. CI, CodeQL, and E2E use concurrency cancellation so superseded runs on the same ref do not waste runner capacity.
