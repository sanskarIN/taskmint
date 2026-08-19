# Testing

TaskMint uses multiple test layers.

## Unit/domain

`tests/task.test.ts` covers normalization, invalid calendar dates, recurrence boundaries, recurring reminders, smart views, and statistics.

## Data portability

`tests/export.test.ts` covers JSON backup validation, duplicate/corrupt backup rejection, and CSV quoting/newline round trips.

## Component

`tests/TaskComposer.test.tsx` exercises accessible form behavior and guards against stale edit values through Testing Library.

## End to end

- `e2e/task-flow.spec.ts` creates a task, switches the browser context offline, completes it, and verifies the Completed smart view.
- `e2e/migration.spec.ts` creates a real legacy IndexedDB v1/native-version-10 database, opens TaskMint, and verifies the Dexie v2 migration normalized the legacy task.

Install Playwright's Chromium runtime before the first local E2E run:

```bash
npm run test:e2e:install
npm run test:e2e
```

## CI gates

Pull requests run formatting invariants, linting, type checks, unit/component tests, production build, dependency audit, CodeQL, and Chromium E2E coverage. Superseded CI and CodeQL runs on the same ref are cancelled to avoid wasting runner capacity.
