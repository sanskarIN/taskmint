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
- Branch state immediately before this final handoff commit: **58 meaningful commits ahead of `main`, 0 behind**.
- PR #16: **closed as superseded**, not merged.

The prior complete RC6 handoff is preserved verbatim at:

- `docs/handoffs/what_changed-rc6-2026-08-19.md`

This root file is now the authoritative RC7 continuation checkpoint.

---

# Verification rule

Only explicit successful hosted checks attached to the **exact current PR #17 head SHA** count as verification.

Never treat these as success:

- mergeable PR state
- queued workflows
- pending workflows
- cancelled workflows
- missing checks
- runs for an older PR head
- RC6 workflow results
- source/static review without dependency-backed execution

PR #17 moved through multiple heads while real defects were found and fixed. Every older run becomes stale as soon as the branch head changes.

After this final handoff commit, fetch PR #17 again and inspect CI, E2E, and CodeQL only for the resulting exact SHA.

Do not merge until all required exact-head hosted checks explicitly succeed.

After a verified merge, verify the resulting exact `main` SHA again before release because a merge SHA may differ from the PR source head.

---

# RC7 hardening completed

## 1. TaskComposer serialization

`src/components/TaskComposer.tsx` now prevents duplicate create/update submissions while persistence is pending.

Implemented:

- synchronous local submit lock
- visible submitting state
- `aria-busy`
- disabled task fields/buttons/cancel while pending
- external App-wide `disabled` support
- retry-safe lock cleanup

Tests cover immediate duplicate submits, external locking, and edit reset behavior.

Key commits:

- `edb097e7a29f03866fa54765ea7d869a4d701dae` — `fix: serialize task composer submissions`
- `5599bebba057a0582322049fa734649aa91b2605` — `test: cover duplicate composer submission lock`

## 2. Task-row serialization

`src/components/TaskItem.tsx` now serializes each row's asynchronous actions:

- complete/reopen
- archive/restore
- delete
- move up/down
- drag/drop reorder

Rows expose local busy state and also honor the App-wide task lock. Edit/drag/mutation controls are disabled while blocked.

Key commits:

- `76b17f453b8a2a9911d79be804644a4fe3f1c15d` — `fix: serialize task row mutations`
- `e057f1b42db128738c3af272445a55507f14decc` — `test: cover task row mutation lock`

## 3. App-wide exclusive task mutation gate

Per-row locks do not stop two different cards from racing writes from the same stale `tasks` snapshot. RC7 therefore adds a reusable gate in:

- `src/utils/mutation.ts`

One synchronous App-owned lock now covers:

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

- TaskComposer is disabled
- all rendered TaskItems are disabled
- the task list exposes busy state
- Settings cannot be opened
- global task/search shortcuts are blocked
- Undo cannot start a competing task write

The utility is regression-tested for:

- competing calls
- safe busy-error behavior
- action failure cleanup
- cleanup even if entering the busy UI state throws

`tests/AppMutation.test.tsx` additionally verifies two **different task cards** cannot write concurrently and that the second becomes usable after the first persistence call completes.

## 4. Collision-free recurring task order allocation

Recurring next occurrences previously defaulted to a clock-millisecond manual order that could collide with an existing order slot.

`completeTask(...)` / `makeNextOccurrence(...)` now accept an explicit next order, and the App supplies:

- `nextTaskOrder(tasks)`

Tests verify explicit order usage and unsafe-order rejection.

## 5. Repository write-boundary validation

`src/storage/repository.ts` now validates records before persistence:

- `putTask` validates one task
- `putTasks` validates the full batch before transaction open
- `replaceAllTasks` validates the full replacement before clear/write
- `saveSettings` validates settings

Malformed runtime values cannot silently enter IndexedDB and fail only on a later read.

Key commits:

- `a0660603794233c83b0d337e1ec4bc65df9aa228` — `fix: validate records before local persistence`
- `8c4750aff8dbc6266fa28df44294a338a86c9b37` — `test: cover repository write validation`

## 6. Non-destructive backup restore preflight

`restoreBackup(...)` runs complete `validateBackup(...)` validation/normalization before opening the destructive Dexie transaction.

Malformed backup objects therefore fail before:

- transaction open
- task clear
- settings clear

The audit rechecked duplicate-order restore behavior: `validateBackup(...)` already normalizes duplicate order slots before returning the backup, so no redundant rewrite was added.

Key commits:

- `a0760bd2610e10ebcacd23196c722bf6d1c1ef67` — `fix: preflight backup restores before clearing data`
- `1e1533aa64b06345ad4140ad35a4ac838a55e279` — `test: verify restore preflight is non-destructive`

## 7. Duplicate task-ID rejection before bulk writes

Bulk task writes now reject duplicate task IDs before transaction open instead of depending on last-write-wins storage behavior.

Stable typed error added:

- `task-batch-duplicate-id`

Its code/message/details contract is directly regression-tested.

Key commits:

- `1605716279fc27e9fe2e7f1c6db93fb3e5fcfc23` — `refactor: add duplicate task batch error`
- `5970f334d9cea0653002af3ac11059a1578e0beb` — `fix: reject duplicate ids in task batches`
- `58adbdcf6bcc41e078e2cf34b8eaa438bcc322e8` — `test: reject duplicate ids before bulk persistence`
- `67d4ff739869d3b69a0238b965b3e4848c94fb94` — `test: cover duplicate task batch error contract`

## 8. CSV source-record diagnostics

Blank logical CSV records are skipped, but their physical/logical positions must still count when an error reports a row number.

The CSV pipeline now assigns the source record number before blank-row filtering.

Regression coverage verifies an invalid row 3 remains reported as row 3 when row 2 is blank.

Commits:

- `5049a368c35a22c21d2a1e008cdcb77c0c53fec3` — `fix: preserve CSV record numbers after blank rows`
- `149d1fca7cd7477e58c43700411ccb6a4ab10112` — `test: preserve CSV error row after blanks`

## 9. CSV merge order rebasing

CSV-created tasks now support a caller-provided starting order.

The App imports CSV using:

- `csvToTasks(csvText, nextTaskOrder(tasks))`

Valid imported rows receive contiguous manual-order slots strictly after the existing task maximum, including when blank records are skipped.

Commits:

- `99f1bcc8ec56f3a7734aaf0f665d92ecdaa15463` — `feat: support collision-free CSV order rebasing`
- `fb7d728a67e5bd7ef002415b5ea52579ca3c6e35` — `test: cover rebased CSV import ordering`
- `26b0709d1a343792084dda7fe1637eeac9b4eae9` — `fix: rebase CSV imports after existing task orders`

## 10. Blank CSV rows no longer consume the task-count quota

A final parser-boundary audit found that the 100,000-task limit was previously checked against every parsed CSV record before blank records were removed. A file with many blank records could therefore be rejected as having too many tasks even though those records create no tasks.

The parser now:

1. parses within the existing 25 MB file-size cap
2. validates the header
3. assigns original record numbers
4. filters completely blank data records
5. applies `TASK_LIMITS.backupTasks` to the remaining actual task records
6. creates tasks

The independent file-size limit remains unchanged, so blank-record input is still bounded.

Regression coverage generates more blank logical records than the task-count limit and verifies they import as zero tasks rather than triggering `csv-too-many-tasks`.

Commits:

- `9b6811a6323dbd2df870b48d54ae9b8b50dcf08d` — `fix: exclude blank CSV records from task limits`
- `fa400342ffdbb854a562c10aac6a18369d1a8edc` — `test: exclude blank CSV rows from task limit`
- `2407d45e2e88941d86b38fb9b146b6296057ba6a` — `docs: record blank CSV limit correction`

## 11. Settings/data operation serialization

`src/components/SettingsDialog.tsx` now has one synchronous action lock covering theme, reduced motion, notifications, export, import, and delete-all operations.

While pending:

- relevant controls/file inputs are disabled
- close is disabled
- Escape is blocked
- backdrop dismissal is blocked
- same-tick dismissal is guarded by the ref lock

Key commits:

- `58441682aa0f59fa7e9f99aa284c3a69426b0075` — `fix: serialize settings and data actions`
- `80a6d60ce07b141fc47d0e61d10025fa044cc0dc` — `test: cover serialized settings actions`
- `8954ca44fbfebc7fcc0869228c7cc23ba5745109` — `fix: guard settings dismissal with action lock`

## 12. Onboarding completion serialization

Onboarding Start now uses a synchronous completion lock, busy semantics, disabled action state, safe error copy, and retry-safe cleanup.

Key commits:

- `190f2f86a887f8479870e99aa4b2f4abe5394c96` — `fix: serialize onboarding completion`
- `ab97ff7149ccb76fc9d8f2b6685e9a07e4845b08` — `test: cover onboarding completion lock`

## 13. PWA update activation serialization

The explicit Update now action can no longer call `updateServiceWorker(true)` repeatedly while activation is pending.

It now exposes busy state, disables Update/Later while pending, preserves safe failure copy, and becomes retryable afterward.

Key commits:

- `2bdbe9a50ea6a9cee411255347b6f2b6972a5e64` — `fix: serialize PWA update activation`
- `72e7f6d78650507a3064247713d6893ec4f28716` — `test: cover PWA update activation lock`

## 14. Diagnostic privacy fails closed

Development `logError(...)` omits arbitrary exception message text and retains only coarse error kind or stable TaskMint error code.

Development `logEvent(...)` now retains only:

- `null`
- booleans
- numbers
- restricted identifier strings under restricted identifier key forms

Identifier key allowlist:

- `id`
- camel/Pascal `...Id` / `...ID`
- snake-case `..._id`

Identifier value pattern:

- `[A-Za-z0-9._:-]{1,128}`

All other strings, nested structures, arrays, sensitive-key metadata, unsafe IDs, and lookalike ordinary keys are redacted.

A deeper audit fixed an earlier `/id$/i` matcher because words such as `valid` and `grid` also end with those letters.

Key commits:

- `6509c65f55341e1f795856a170106ed4d8775750` — `fix: fail closed for diagnostic event metadata`
- `0b35e5e5fb3fd232e4e27212a9cf29db80f30e2f` — `test: cover fail-closed event metadata logging`
- `4d6db22f67dc417da529c8bea5dca224240373fe` — `security: restrict diagnostic identifier keys`
- `1979d2e240e33fb2170f9bf121938bcc64802f94` — `test: reject lookalike diagnostic id keys`

## 15. Sidebar accessibility semantics

The Sidebar now exposes current selection correctly and keeps all navigation controls inside the navigation landmark:

- active smart view -> `aria-current="page"`
- active project -> `aria-current="page"`
- smart view not simultaneously current when a project is selected
- project buttons are inside `<nav>`

Recent commits:

- `2d0a83649cab6b1dcb2ab6c5397403f63caf5481` — `fix: keep project controls inside navigation landmark`
- `0c25af92da58fc9e085a3760732f29225eb74aa6` — `test: keep project selectors in sidebar navigation`

## 16. Toolbar accessibility grouping

The Toolbar's search/filter container now has meaningful group semantics:

- `role="group"`
- `aria-label={strings.searchFiltersLabel}`

Tests preserve search shortcut metadata and verify priority/tag/sort callbacks.

## 17. Documentation synchronized

`ROADMAP.md` records the RC7 second-wave reliability work.

- `918d734636d6ba4bb623f070c09aae14ea4add2b` — `docs: record second RC7 hardening wave`

`CHANGELOG.md` records cross-row mutation hardening, collision-free ordering, CSV diagnostics/limits, logger privacy tightening, and accessibility fixes.

- `fdd742aa361aa94baf7b6eae3abf5527b5675220` — `docs: record cross-row and import hardening`
- `2407d45e2e88941d86b38fb9b146b6296057ba6a` — `docs: record blank CSV limit correction`

The previous RC6 handoff was archived before root refresh:

- `ed984f1754081943dcd53a624e7fb1a73db93a38` — `docs: archive RC6 continuation handoff`

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
- `docs/handoffs/what_changed-rc6-2026-08-19.md` — archived previous handoff
- `what_changed.md` — this final RC7 handoff

The final pre-handoff comparison reported **58 commits ahead, 0 behind**, with 32 changed files relative to `main`. This handoff commit increases the branch count by one.

---

# Regression coverage added/expanded

RC7 explicitly covers:

- duplicate TaskComposer submissions
- externally locked TaskComposer
- duplicate TaskItem mutations
- externally locked TaskItem
- App cross-row mutation exclusion
- exclusive gate competing calls
- exclusive gate busy-error behavior
- exclusive gate action-failure cleanup
- exclusive gate busy-state-entry failure cleanup
- repository task/settings write validation
- complete batch validation before transaction open
- duplicate batch IDs
- duplicate batch stable error contract
- restore validation before destructive transaction
- Settings serialization/busy/no-dismiss behavior
- onboarding duplicate completion and safe failure
- PWA duplicate activation and safe retry
- logger arbitrary metadata redaction
- safe identifier retention
- unsafe/lookalike identifier redaction
- explicit recurring order allocation
- invalid recurring order rejection
- CSV row-number preservation after blanks
- CSV contiguous caller-provided ordering
- blank CSV rows excluded from task-count limit
- active smart-view semantics
- active project semantics
- Sidebar navigation containment
- Toolbar named group and callbacks

These extend the earlier unit/property/stress/migration/offline/browser/accessibility/security/release test inventory preserved in the archived RC6 handoff.

---

# Static/code audit performed

The continuation reviewed current code around:

- startup/load failure behavior
- create/edit/complete/reopen/archive/restore/delete/undo
- recurrence generation
- manual-order allocation/reordering
- cross-row asynchronous persistence
- TaskComposer
- TaskItem
- Sidebar
- Toolbar
- Settings
- Onboarding
- PWA waiting-worker activation
- repository/Dexie boundaries
- backup validation/normalization
- CSV parsing/import merge/limits
- reminders
- diagnostic logging/privacy
- TypeScript strict project configuration
- type-aware ESLint boundaries
- existing and new relevant tests
- branch comparison against exact current `main`

Where an audited path was already correct, no artificial commit was added just to inflate count.

---

# Still not dependency-backed verified

The following remain release blockers until real runners prove them for the exact current tree:

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

Do not substitute source review, PR mergeability, queued jobs, or stale workflow conclusions for these gates.

---

# Exact next work

## 1. Freeze and verify PR #17 current head

After this commit:

1. fetch PR #17
2. obtain the exact resulting head SHA
3. fetch workflow runs for that SHA only
4. require CI success
5. require E2E success
6. require CodeQL success
7. inspect actual failing jobs/logs if any fail
8. fix proven failures and repeat exact-head verification if the branch changes again

## 2. Merge only after successful exact-head checks

Do not merge on mergeability alone.

## 3. Re-verify resulting exact `main`

After merge, verify CI/E2E/CodeQL on the actual resulting `main` tree.

## 4. Generate the real npm lockfile

Use a network-enabled environment and npm itself. Review and commit the generated file. Never fabricate it.

## 5. Run locked release gates

Required:

- `npm ci --ignore-scripts`
- `npm run check`
- `npm audit --audit-level=high`
- `npm run test:e2e:install`
- `npm run test:e2e`

## 6. Complete manual verification

Verify:

- keyboard-only task lifecycle
- global shortcuts and pending-mutation blocking
- cross-row write blocking
- busy/disabled semantics
- Settings focus and no-dismiss behavior
- Sidebar/Toolbar accessibility semantics
- 200% zoom/reflow
- system/light/dark themes
- reduced motion
- offline lifecycle
- JSON restore
- CSV export/import, blank records, and merges into existing tasks
- browser reminder permission/privacy/aggregation
- corrupt local-data recovery state
- PWA waiting update with unsaved draft
- explicit Update now activation
- delete-all local data

## 7. Capture real screenshots

Use the verified real browser build with fictional/demo data only.

## 8. Release only after every gate is green

Run:

- `npm run release:check -- v0.1.0`

Only then create `v0.1.0`.

The tagged release workflow must independently pass quality/audit/E2E and publish the web artifact plus SHA-256 checksum.

---

# Continuation rules

1. Read this file first.
2. Read `docs/handoffs/what_changed-rc6-2026-08-19.md` only for deeper previous history.
3. Check PR #17 on its exact current head.
4. Never call queued/pending/cancelled/missing/stale checks successful.
5. Fix only proven CI/E2E/CodeQL failures or concrete source defects.
6. Keep commits atomic and meaningful; no fake churn.
7. Preserve `Sanskar <sanskarin@outlook.in>` commit identity.
8. Do not fabricate `package-lock.json`.
9. Do not fabricate screenshots.
10. Do not create `v0.1.0` until every required gate is actually verified.
