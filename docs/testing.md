# Testing

TaskMint uses multiple test layers and treats data portability, migrations, keyboard accessibility, reminders, offline behavior, documentation integrity, and repository hygiene as release-critical paths.

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

`tests/errors.test.ts` covers typed `TaskMintError` codes, safe default messages, malformed-JSON wrapping, row-aware CSV errors, and immutable structured error details.

`tests/keyboard.test.ts` covers global shortcut resolution, modifier handling, editable-control protection, and modal blocking.

`tests/notifications.test.ts` covers successful one-time due-reminder delivery and verifies that a throwing browser `Notification` constructor is isolated instead of escaping the reminder loop.

`tests/security-config.test.ts` locks the committed production CSP to self-restricted scripts/styles/connections and rejects accidental development WebSocket or inline-style allowances in the built HTML source.

## Data portability

`tests/export.test.ts` covers:

- JSON backup round trips
- unsupported backup rejection
- duplicate task-ID rejection
- malformed timestamp rejection
- oversized backup-field rejection
- CSV quoting and multiline round trips
- deterministic stress round trips with commas, quotes, CR/LF content, Unicode, tags, projects, priorities, and recurrence
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
- `e2e/accessibility.spec.ts` checks core landmarks, rejects unnamed buttons/unlabeled interactive form controls, and verifies shortcut metadata on search/new-task inputs.

Install Playwright's Chromium runtime before the first local E2E run:

```bash
npm run test:e2e:install
npm run test:e2e
```

## Deterministic repository checks

- `npm run format:check` rejects CRLF drift, missing final newlines, and trailing whitespace across tracked text paths.
- `npm run docs:check` resolves repository-relative Markdown links and rejects links that escape the repository or point to missing local targets.
- `npm run secrets:check` scans tracked text paths for common private-key and credential-token patterns without sending repository content to a third-party service.

These checks intentionally require only Node.js and can run before npm dependencies are available.

## CI gates

Pull requests run formatting invariants, documentation-link validation, secret-pattern validation, linting, type checks, unit/component tests, production build, dependency audit, CodeQL, and Chromium E2E coverage. The E2E workflow also runs on pushes to `main`. CI, CodeQL, and E2E use concurrency cancellation so superseded runs on the same ref do not waste runner capacity.

Tagged releases rerun the combined local quality suite, high-severity dependency audit, and Chromium E2E before creating the release artifact and checksum.
