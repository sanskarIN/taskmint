# Testing

TaskMint uses multiple test layers.

## Unit/domain

`tests/task.test.ts` covers normalization, recurrence boundaries, smart views, and statistics.

## Data portability

`tests/export.test.ts` covers JSON backup validation and CSV quoting/newline round trips.

## Component

`tests/TaskComposer.test.tsx` exercises accessible form behavior through Testing Library.

## End to end

`e2e/task-flow.spec.ts` creates a task, switches the browser context offline, completes it, and verifies the completed smart view.

Install Playwright's Chromium runtime before the first local E2E run:

```bash
npm run test:e2e:install
npm run test:e2e
```

## CI gates

Pull requests run formatting, linting, type checks, tests, production build, dependency audit, CodeQL, and Chromium E2E coverage.
