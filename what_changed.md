# TaskMint — Complete Work Handoff

## Current milestone

- Project: **TaskMint**
- Repository: `https://github.com/sanskarIN/taskmint`
- Visibility/source model: **PUBLIC / OPEN SOURCE**
- License: **MIT**
- Package version: `0.1.0`
- Default branch: `main`
- Date: 2026-08-19
- Requested/verified continuation commit identity: `Sanskar <sanskarin@outlook.in>`
- Release status: **release candidate only; not released**
- `v0.1.0` tag: **NOT CREATED**
- `package-lock.json`: **NOT PRESENT**. Generate it only through a real successful npm registry resolution; never fabricate it.
- Real release screenshots: **NOT YET CAPTURED**. Capture them only from a verified browser build with fictional/demo data; never fabricate release evidence.
- Current `main` base: `4e4850eab204deeb95e4db2bca24f084aaae0d5e` — `docs: update complete RC6 work handoff`.
- Current hardening branch: `continuation/v0.1-rc7-hardening`.
- RC7 PR: **#17** — `fix: harden TaskMint v0.1 RC7 persistence and interaction safety`.
- Branch state immediately before this final handoff commit: **62 meaningful commits ahead of `main`, 0 behind**.
- PR #16: **closed as superseded**, not merged.

The complete previous RC6 handoff remains preserved verbatim at:

- `docs/handoffs/what_changed-rc6-2026-08-19.md`

This root file is the authoritative RC7 continuation checkpoint.

---

# Verification rule

Only explicit successful hosted checks attached to the **exact current PR #17 head SHA** count as verification.

Never treat these as success:

- mergeable PR state
- queued/pending workflows
- cancelled workflows
- missing checks
- checks from an older PR head
- RC6 checks
- static source review without dependency-backed execution

PR #17 has moved through multiple exact heads as real defects were found. Every older run is stale after a new commit.

After this handoff commit, fetch PR #17 again, obtain its exact resulting head SHA, and inspect CI, E2E, and CodeQL only for that SHA.

Do **not** merge until all required exact-head hosted checks explicitly succeed.

After a verified merge, verify the resulting exact `main` SHA again before release because the merge SHA may differ from the PR source SHA.

---

# RC7 hardening completed

## 1. Local and App-wide task mutation serialization

Task persistence now has two complementary protection layers.

### TaskComposer

- synchronous local submit lock
- submitting state and `aria-busy`
- form fields/cancel disabled while saving
- external App-wide disabled state
- duplicate immediate submits suppressed
- edit values reset after successful edit
- retry-safe cleanup after failure

### TaskItem

Per-row serialization covers:

- complete/reopen
- archive/restore
- delete
- keyboard reorder
- drag/drop reorder

Rows expose busy/disabled semantics and cannot create duplicate same-row mutations while persistence is pending.

### App-wide exclusive gate

A reusable gate in `src/utils/mutation.ts` prevents **different task rows or the composer** from racing writes from the same stale `tasks` snapshot.

The App-wide gate covers:

- create
- edit
- complete
- reopen
- archive
- restore
- delete
- undo delete
- keyboard reorder
- drag/drop reorder

While pending:

- composer is disabled
- all rendered rows are disabled
- list exposes busy state
- Settings cannot be opened
- global task/search shortcuts are blocked
- Undo cannot start a competing write

Tests cover competing calls, safe busy errors, action-failure cleanup, busy-state callback failure cleanup, and a full App regression involving two different task cards.

## 2. Collision-free recurring occurrence ordering

Recurring next occurrences no longer depend on a clock-millisecond manual order.

`completeTask(...)` / `makeNextOccurrence(...)` accept an explicit next order, and the App passes:

- `nextTaskOrder(tasks)`

This places the next occurrence after the current maximum order and avoids valid task-order collisions.

Tests cover explicit order use and unsafe-order rejection.

## 3. Repository write-boundary validation

`src/storage/repository.ts` now validates before persistence:

- `putTask` validates one task
- `putTasks` validates the complete batch before transaction open
- `replaceAllTasks` validates the complete replacement before clear/write
- `saveSettings` validates settings

Malformed runtime values therefore fail before entering IndexedDB.

## 4. Backup restore preflight

`restoreBackup(...)` validates and normalizes the complete backup before opening the destructive Dexie transaction.

Malformed backup objects fail before:

- transaction open
- task clear
- settings clear

The audit also confirmed that existing backup validation already normalizes duplicate manual-order slots before returning the backup, so no redundant churn was added.

## 5. Duplicate task IDs rejected before bulk persistence

Bulk task arrays now reject duplicate task IDs before a write transaction begins.

Stable typed error:

- `task-batch-duplicate-id`

Tests cover repository behavior and the typed code/message/details contract.

## 6. CSV diagnostics, ordering, and limits

### Original source row numbers are preserved

Blank logical records are skipped, but source record numbers are assigned first. An invalid row after a blank row is therefore reported against the true original row.

### CSV merges are rebased after existing task orders

`csvToTasks(...)` supports a caller-provided starting order.

The App now imports with:

- `csvToTasks(csvText, nextTaskOrder(tasks))`

Valid imported tasks receive contiguous manual-order values strictly after the existing maximum, including when blank records occur between data records.

### Blank records do not consume the task-count quota

The 100,000-task count limit now applies to actual nonblank data records rather than every parsed CSV line/record.

The independent 25 MB file-size guard remains in force, so blank-record input is still bounded.

Regression coverage includes more blank records than the task-count limit and verifies that they import as zero tasks rather than triggering `csv-too-many-tasks`.

Recent commits in this area include:

- `5049a368c35a22c21d2a1e008cdcb77c0c53fec3` — preserve source row numbers
- `149d1fca7cd7477e58c43700411ccb6a4ab10112` — row-number regression
- `99f1bcc8ec56f3a7734aaf0f665d92ecdaa15463` — collision-free CSV order rebasing
- `fb7d728a67e5bd7ef002415b5ea52579ca3c6e35` — order-rebase regression
- `26b0709d1a343792084dda7fe1637eeac9b4eae9` — App uses existing-task order base
- `9b6811a6323dbd2df870b48d54ae9b8b50dcf08d` — blank records excluded from task-count limit
- `fa400342ffdbb854a562c10aac6a18369d1a8edc` — blank-record limit regression

## 7. Settings/data action serialization

Settings uses one synchronous action lock for:

- theme
- reduced motion
- notification enablement
- JSON export
- CSV export
- JSON import
- CSV import
- delete-all local data

While an action is pending:

- relevant controls/file inputs are disabled
- close is disabled
- Escape is blocked
- backdrop dismissal is blocked
- same-tick dismissal uses the synchronous ref lock

Safe error copy remains retryable and stale dialog errors clear after close/reopen.

## 8. Import file selection is cleared before asynchronous work

The hidden JSON/CSV file input previously cleared its value only **after** the asynchronous import action settled.

It now clears `event.target.value` immediately after capturing the selected `File`, before checking/awaiting asynchronous work.

Benefits:

- selecting the same file again never depends on the previous promise settling
- a stale same-value file input cannot survive into the next retry window
- file content is still captured in the local `File` object before the DOM value is cleared
- action serialization remains unchanged

`tests/SettingsDialog.test.tsx` now holds JSON import pending and verifies that the selected input value is already empty while the dialog is still `aria-busy="true"`.

Latest commits before this handoff:

- `fix: clear selected import files before async work`
- `test: clear import selection before async settle`
- `docs: record import input retry hardening`

## 9. Onboarding completion serialization

Onboarding Start uses a synchronous completion lock with disabled/busy semantics, safe failure copy, and retry-safe cleanup.

## 10. PWA update activation serialization

Update now cannot call `updateServiceWorker(true)` repeatedly while activation is pending.

Update/Later are disabled during activation, failure copy remains safe, and retry becomes available afterward.

## 11. Fail-closed development diagnostics

`logError(...)` omits arbitrary exception message text and emits only coarse error kind or stable TaskMint error code.

`logEvent(...)` keeps only:

- `null`
- booleans
- numbers
- restricted identifier strings under restricted identifier-key forms

Identifier key forms:

- `id`
- camel/Pascal `...Id` / `...ID`
- snake-case `..._id`

Identifier values:

- `[A-Za-z0-9._:-]{1,128}`

Everything else is redacted.

A deeper audit replaced an overly broad `/id$/i` matcher because ordinary words such as `valid` and `grid` also end in those letters.

## 12. Sidebar accessibility semantics

Sidebar now exposes:

- active smart view with `aria-current="page"`
- active project with `aria-current="page"`
- no simultaneous current smart view while project selection is active
- both smart-view and project selectors inside the `<nav>` landmark

Recent commits:

- `2d0a83649cab6b1dcb2ab6c5397403f63caf5481` — project controls inside navigation landmark
- `0c25af92da58fc9e085a3760732f29225eb74aa6` — landmark regression

## 13. Toolbar accessibility grouping

Search/filter controls now live in a named semantic group:

- `role="group"`
- `aria-label={strings.searchFiltersLabel}`

Tests preserve shortcut metadata and priority/tag/sort callback behavior.

## 14. Documentation synchronization

`ROADMAP.md` records the RC7 reliability/accessibility/import/concurrency hardening.

`CHANGELOG.md` records:

- cross-row mutation serialization
- collision-free recurrence/CSV ordering
- CSV source-row diagnostics
- blank-row limit correction
- diagnostic privacy tightening
- accessibility semantics
- immediate import-input clearing

The previous RC6 handoff remains archived unchanged.

---

# Current changed-file inventory relative to `main`

## Runtime/source

- `src/App.tsx`
- `src/components/Onboarding.tsx`
- `src/components/PwaUpdatePrompt.tsx`
- `src/components/SettingsDialog.tsx`
- `src/components/Sidebar.tsx`
- `src/components/TaskComposer.tsx`
- `src/components/TaskItem.tsx`
- `src/components/Toolbar.tsx`
- `src/domain/errors.ts`
- `src/domain/task.ts`
- `src/storage/repository.ts`
- `src/utils/export.ts`
- `src/utils/logger.ts`
- `src/utils/mutation.ts` — new

## Tests

- `tests/AppMutation.test.tsx` — new
- `tests/Onboarding.test.tsx` — new
- `tests/PwaUpdatePrompt.test.tsx` — new
- `tests/SettingsDialog.test.tsx`
- `tests/Sidebar.test.tsx` — new
- `tests/TaskComposer.test.tsx`
- `tests/TaskItem.test.tsx` — new
- `tests/Toolbar.test.tsx` — new
- `tests/csv-compat.test.ts`
- `tests/errors.test.ts`
- `tests/logger.test.ts`
- `tests/mutation.test.ts` — new
- `tests/repository.test.ts`
- `tests/task.test.ts`

## Documentation

- `CHANGELOG.md`
- `ROADMAP.md`
- `docs/handoffs/what_changed-rc6-2026-08-19.md`
- `what_changed.md`

The final pre-handoff comparison reported **62 commits ahead, 0 behind**, with 32 changed files relative to `main`. This handoff commit itself increases the branch to 63 commits ahead.

---

# New/expanded regression coverage

RC7 explicitly covers:

- duplicate TaskComposer submission
- external TaskComposer mutation lock
- duplicate TaskItem mutation
- external TaskItem mutation lock
- App cross-row write exclusion
- exclusive gate competing calls
- exclusive gate safe busy errors
- exclusive gate action-failure cleanup
- exclusive gate busy-state callback failure cleanup
- repository task/settings write validation
- full batch validation before transaction
- duplicate batch IDs
- duplicate batch typed error contract
- backup validation before destructive restore transaction
- Settings action serialization
- Settings no-dismiss behavior
- immediate import input clearing while async import remains pending
- onboarding duplicate completion and safe failure
- PWA duplicate activation and safe retry
- fail-closed event metadata
- safe identifier retention and lookalike key redaction
- explicit recurring order allocation
- invalid recurring order rejection
- CSV source-row preservation
- contiguous caller-provided CSV ordering
- blank CSV records excluded from task-count limit
- active smart-view/project semantics
- Sidebar navigation containment
- Toolbar named group and callbacks

These extend the earlier unit/property/stress/migration/offline/browser/accessibility/security/release test inventory documented in the archived RC6 handoff.

---

# Verification attempted in this continuation

A clean local clone was also attempted to obtain independent dependency-backed evidence, but this execution environment cannot resolve external GitHub/network hosts. Therefore no local npm/test pass has been fabricated or claimed.

Hosted GitHub workflows have repeatedly been created for exact PR heads, but when last checked they were queued/pending rather than successful. Because the head moved again for the final import-selection hardening, those earlier runs are stale.

---

# Still not dependency-backed verified

These remain release blockers:

- clean dependency resolution
- real npm-generated `package-lock.json`
- `npm ci --ignore-scripts`
- `npm run check`
- full Vitest execution including RC7 tests
- `npm audit --audit-level=high`
- Playwright browser installation
- Chromium E2E
- production PWA browser verification
- manual release checklist
- real release screenshots

No source review, mergeability state, queued run, or stale successful run may replace these gates.

---

# Exact next work

## 1. Verify the exact current PR #17 head

After this handoff commit:

1. fetch PR #17
2. obtain the exact resulting head SHA
3. fetch CI/E2E/CodeQL runs for that SHA only
4. require explicit success for all required workflows
5. inspect actual failing job/log evidence if any fail
6. fix only proven failures and repeat exact-head verification if the branch changes

## 2. Merge only after exact-head success

Do not merge because the PR is merely mergeable.

## 3. Verify resulting exact `main`

After merge, verify the actual resulting `main` tree again.

## 4. Generate the real npm lockfile

Use npm in a network-enabled environment, review the generated lockfile, and commit it. Never fabricate it.

## 5. Run locked release gates

Required:

- `npm ci --ignore-scripts`
- `npm run check`
- `npm audit --audit-level=high`
- `npm run test:e2e:install`
- `npm run test:e2e`

## 6. Complete manual browser verification

Verify:

- keyboard-only task lifecycle
- global shortcuts and pending-mutation guards
- cross-row write exclusion
- busy/disabled semantics
- Settings focus/no-dismiss behavior
- same-file JSON/CSV import retry
- Sidebar/Toolbar accessibility semantics
- 200% zoom/reflow
- light/dark/system themes
- reduced motion
- offline lifecycle
- JSON restore
- CSV export/import, blank rows, limits, and merge ordering
- reminder permission/privacy/aggregation
- corrupt local-data recovery
- PWA waiting update with unsaved draft
- explicit Update now
- delete-all local data

## 7. Capture real screenshots

Only from the verified real browser build with fictional/demo data.

## 8. Release only after every gate is green

Run:

- `npm run release:check -- v0.1.0`

Only then create `v0.1.0`.

The tagged workflow must independently pass quality/audit/E2E and publish the artifact plus SHA-256 checksum.

---

# Continuation rules

1. Read this file first.
2. Use `docs/handoffs/what_changed-rc6-2026-08-19.md` for deeper previous history.
3. Check PR #17 on its exact current head.
4. Never call queued/pending/cancelled/missing/stale checks successful.
5. Fix only proven CI/E2E/CodeQL failures or concrete source defects.
6. Keep commits atomic and meaningful; no fake churn.
7. Preserve `Sanskar <sanskarin@outlook.in>` commit identity.
8. Do not fabricate `package-lock.json`.
9. Do not fabricate screenshots.
10. Do not create `v0.1.0` until every required gate is actually verified.
