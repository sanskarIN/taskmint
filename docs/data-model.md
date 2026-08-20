# TaskMint Data Model and Portability Reference

This document is the normative human-readable reference for TaskMint v0.1 data structures, persistence, validation, JSON backup, and CSV interchange. The TypeScript source remains the executable contract.

Primary implementation files:

- `src/domain/types.ts`
- `src/domain/limits.ts`
- `src/domain/datetime.ts`
- `src/domain/order.ts`
- `src/domain/task.ts`
- `src/domain/validation.ts`
- `src/storage/db.ts`
- `src/storage/repository.ts`
- `src/utils/export.ts`

## 1. Primitive enums

### Priority

Allowed values:

- `low`
- `medium`
- `high`
- `urgent`

No other priority string is valid in persisted or imported TaskMint data.

### Recurrence

Allowed values:

- `none`
- `daily`
- `weekly`
- `monthly`

### Task status

Allowed values:

- `active`
- `completed`
- `archived`

### Theme mode

Allowed values:

- `light`
- `dark`
- `system`

### Sort mode

UI/application sort values:

- `manual`
- `created-desc`
- `due-asc`
- `priority-desc`
- `title-asc`

### Smart view

UI/application smart-view values:

- `inbox`
- `today`
- `upcoming`
- `overdue`
- `completed`
- `archived`
- `all`

## 2. Task object

The persisted `Task` shape is:

```ts
interface Task {
  id: string;
  title: string;
  notes: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string | null;
  reminderAt: string | null;
  tags: string[];
  project: string;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  status: 'active' | 'completed' | 'archived';
  completedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  order: number;
}
```

### `id`

- Required string.
- Trimmed during backup/persisted-record validation.
- Must be non-empty.
- Maximum length: 100 characters.
- New runtime tasks use `crypto.randomUUID()`.
- Task IDs must be unique within a backup or repository batch.

### `title`

- Required string.
- Interactive task creation collapses repeated whitespace and trims the result.
- Backup validation trims surrounding whitespace.
- Must remain non-empty.
- Maximum length: 240 characters.

### `notes`

- String; empty string means no notes.
- Interactive task creation trims it.
- Maximum length: 20,000 characters.

### `priority`

Must be one of the four Priority values.

### `dueDate`

- `null` or local calendar date text in exact `YYYY-MM-DD` form.
- Calendar validity is checked strictly.
- Impossible values such as `2026-02-31` are rejected rather than normalized into March.

TaskMint intentionally treats due dates as local calendar dates rather than UTC instants.

### `reminderAt`

- `null` or a strictly valid date-time string.
- Accepted input is parsed by `parseStrictDateTime(...)`.
- Persisted/validated output is canonicalized to ISO using `Date.toISOString()`.

### `tags`

- Array of strings.
- Maximum 12 canonical tags per task.
- Each tag is maximum 32 characters.
- Tags are trimmed and lower-cased with `toLowerCase()`.
- Empty tags are rejected by backup validation and omitted by interactive creation.
- Duplicate tags collapse to one canonical value.

### `project`

- String; empty string means no project.
- Trimmed before storage through normal domain creation/update and persisted-record validation.
- Maximum length: 80 characters.

### `recurrence`

One of the four Recurrence values.

### `status`

One of the three TaskStatus values. Status also constrains lifecycle timestamps; see the next section.

### `completedAt`

- ISO-compatible timestamp string or `null`.
- Active tasks must have `completedAt = null`.
- Completed tasks must have a non-null `completedAt`.
- Archived tasks may retain a prior `completedAt` because restoring an archived previously completed task returns it to Completed.

### `archivedAt`

- ISO-compatible timestamp string or `null`.
- Active tasks must have `archivedAt = null`.
- Completed tasks must have `archivedAt = null`.
- Archived tasks must have a non-null `archivedAt`.

### `createdAt`

Required strictly valid timestamp. Normal runtime creation stores the supplied/current time as ISO text.

### `updatedAt`

Required strictly valid timestamp. Mutating task operations refresh it.

### `order`

- Must be a JavaScript safe integer.
- Used for Manual sort.
- Deterministic comparison uses `(order, id)`.
- Duplicate safe order slots are tolerated at read/backup-validation boundaries and normalized while preserving deterministic visible order.
- New task, recurring occurrence, and CSV merge paths allocate collision-free order values.

## 3. Lifecycle invariants

TaskMint validation enforces the following persisted-state combinations.

### Active task

```text
status = active
completedAt = null
archivedAt = null
```

### Completed task

```text
status = completed
completedAt = valid timestamp
archivedAt = null
```

### Archived task

```text
status = archived
archivedAt = valid timestamp
completedAt = null or a valid prior completion timestamp
```

An archived task with prior completion information can return to Completed when restored.

## 4. TaskDraft

UI/domain creation and update use a lighter draft shape:

```ts
interface TaskDraft {
  title: string;
  notes?: string;
  priority?: Priority;
  dueDate?: string | null;
  reminderAt?: string | null;
  tags?: string[];
  project?: string;
  recurrence?: Recurrence;
}
```

Defaults during creation include:

- priority: `medium`
- recurrence: `none`
- notes/project/tags: empty equivalents
- status: `active`

Lifecycle/status/timestamps/ID/order are created by the domain rather than accepted from the ordinary task composer.

## 5. Application settings

Persisted settings use one singleton record:

```ts
interface AppSettings {
  key: 'app';
  theme: 'light' | 'dark' | 'system';
  onboardingComplete: boolean;
  reduceMotion: boolean;
  notificationsEnabled: boolean;
}
```

Default settings are:

```text
key = app
theme = system
onboardingComplete = false
reduceMotion = false
notificationsEnabled = false
```

The repository validates settings before both returning stored values and saving new values.

## 6. UI-only derived structures

### TaskFilters

```ts
interface TaskFilters {
  search: string;
  view: SmartView;
  project: string;
  tag: string;
  priority: Priority | 'all';
  sort: SortMode;
}
```

Filters are application state, not persisted records in the v0.1 IndexedDB schema.

### ProductivityStats

```ts
interface ProductivityStats {
  active: number;
  completed: number;
  archived: number;
  overdue: number;
  dueToday: number;
  completionRate: number;
  completedLast7Days: number;
}
```

Statistics are derived in memory and are not persisted as authoritative data.

## 7. Central limits

`TASK_LIMITS` currently defines:

| Limit | Value |
| --- | ---: |
| Task ID length | 100 characters |
| Task title length | 240 characters |
| Notes length | 20,000 characters |
| Project length | 80 characters |
| Tags per task | 12 |
| Tag length | 32 characters |
| Tasks in backup/import | 100,000 |
| Import text/file size | 25,000,000 bytes/characters at the relevant boundary |

Code that handles task/import limits should use the shared constants rather than duplicating numbers.

## 8. IndexedDB database

TaskMint uses Dexie over IndexedDB.

Database name:

```text
taskmint
```

Tables:

- `tasks`
- `settings`

### Schema version 1

`tasks` indexes:

```text
id, status, dueDate, project, priority, order, createdAt
```

`settings` indexes:

```text
key
```

### Schema version 2

Current schema indexes:

```text
id, status, dueDate, reminderAt, project, priority, order, createdAt, updatedAt, *tags
```

`*tags` is a multi-entry Dexie/IndexedDB index.

`settings` continues to index `key`.

### v1 -> v2 migration

The v2 upgrade initializes fields introduced after v1 when absent:

```text
reminderAt -> null
tags -> []
project -> ''
recurrence -> 'none'
```

A browser-level E2E migration test seeds an actual legacy schema and verifies the upgrade.

## 9. Repository trust boundary

TaskMint treats IndexedDB as an untrusted serialization boundary even though it is local.

### Reads

`listTasks()`:

1. reads all persisted rows;
2. validates every task;
3. normalizes duplicate safe order slots in memory;
4. only then returns the task array to the application.

`getSettings()` validates stored settings or returns defaults if no settings row exists.

Malformed persisted data causes startup to fail closed rather than being silently discarded or converted into an empty-looking writable application.

### Writes

`putTask`, `putTasks`, `replaceAllTasks`, and `saveSettings` validate data before persistence.

Full batches are validated before a transaction begins.

Bulk task arrays must not contain duplicate IDs.

Multi-task writes use explicit read-write transactions.

## 10. JSON backup format

JSON is the full-fidelity TaskMint backup format.

Shape:

```ts
interface TaskBackup {
  schemaVersion: 2;
  exportedAt: string;
  app: 'TaskMint';
  tasks: Task[];
  settings?: AppSettings;
}
```

Example skeleton:

```json
{
  "schemaVersion": 2,
  "exportedAt": "2026-08-19T10:00:00.000Z",
  "app": "TaskMint",
  "tasks": [],
  "settings": {
    "key": "app",
    "theme": "system",
    "onboardingComplete": true,
    "reduceMotion": false,
    "notificationsEnabled": false
  }
}
```

### Backup validation sequence

TaskMint requires:

- top-level JSON object;
- `app === 'TaskMint'`;
- `schemaVersion === 2`;
- `tasks` array;
- at most 100,000 tasks;
- every task to satisfy the complete Task validation contract;
- unique task IDs;
- valid optional settings;
- valid `exportedAt` timestamp.

Validated timestamps are canonicalized to ISO.

Validated tags are canonicalized and deduplicated.

Duplicate task order slots are normalized in the returned backup while preserving deterministic order.

### Restore safety

The repository validates the complete backup again before opening the transaction that clears/replaces tables. This provides a non-destructive preflight boundary even if a future caller bypasses the ordinary file parser.

## 11. JSON versioning policy

The current accepted backup schema is exactly version 2.

An unknown backup schema version is rejected rather than guessed or silently downgraded.

Future schema support should be explicit, versioned, migrated, tested, and documented before changing this behavior.

## 12. CSV format

CSV is a human-readable interchange format. It does **not** preserve the complete TaskMint lifecycle history.

Required task columns:

```text
title
notes
priority
dueDate
reminderAt
tags
project
recurrence
status
```

New TaskMint exports append:

```text
taskmintEncoding
```

Current encoding marker:

```text
safe-text-v1
```

The header emitted by current TaskMint therefore ends with `taskmintEncoding`.

## 13. CSV field semantics

### Title / notes / project

Current TaskMint-marked exports reversibly neutralize spreadsheet-formula prefixes in user-controlled text.

Neutralization applies even when formula characters appear after leading:

- spaces
- tabs
- carriage returns
- newlines

A leading apostrophe also round-trips safely under the marked TaskMint encoding.

Legacy unmarked CSV is not retroactively reinterpreted by this decoder.

### Priority

Must be an exact supported Priority value.

### Due date

Empty means `null`; otherwise strict `YYYY-MM-DD` and valid calendar date.

### Reminder

Empty means `null`; otherwise strict date-time input accepted by the shared parser and canonicalized to ISO through task creation.

### Tags

Current encoded exports store:

```text
json:["tag-one","tag-two"]
```

inside the CSV cell.

The `json:` structured representation is interpreted only when the row/file declares `safe-text-v1`.

Unmarked legacy CSV continues to treat tag cells as pipe-separated text:

```text
work|release|urgent
```

An unmarked legacy tag literally beginning with `json:` remains ordinary tag text; it is not parsed as structured JSON.

### Recurrence / status

Must be exact supported enum values.

### Lifecycle timestamps

CSV does not carry original `completedAt`, `archivedAt`, `createdAt`, or `updatedAt` columns.

On CSV import:

- a new Task is created at import time;
- imported Completed status receives a completion timestamp at import time;
- imported Archived status receives an archive timestamp at import time;
- original lifecycle timestamps from another TaskMint instance cannot be reconstructed from CSV.

Use JSON backup for full-fidelity archival/restore.

## 14. CSV parser safety rules

CSV import rejects:

- file/text larger than the import limit;
- missing required columns;
- duplicate column names;
- unsupported non-empty TaskMint encoding marker;
- invalid enum values;
- invalid task data;
- malformed structured tags;
- quote characters placed inside unquoted fields;
- non-delimiter characters after a closing quote;
- unterminated quoted fields.

A UTF-8 BOM on the first header is tolerated and stripped before header validation.

Multiline quoted cells and escaped `""` quote pairs are supported.

## 15. CSV record numbering

Completely blank logical data records are skipped.

TaskMint assigns source row/record numbers **before** filtering those blank records. Therefore a validation error points to the original logical CSV record rather than a compacted post-filter index.

## 16. CSV count and size limits

The task-count limit applies to nonblank data records that would create tasks.

Blank logical records do not consume the 100,000-task quota.

The independent 25 MB input-size limit still bounds the complete CSV input, including blank content.

## 17. CSV merge ordering

CSV import appends tasks to the current local task set.

The application calculates the next safe manual-order slot from existing tasks and supplies that value to `csvToTasks(...)`.

Imported nonblank rows receive contiguous order values:

```text
firstOrder
firstOrder + 1
firstOrder + 2
...
```

This prevents a valid merge from introducing collisions with current local task order slots.

## 18. Manual-order rules

Manual task ordering is intentionally centralized in `src/domain/order.ts`.

Important invariants:

- order values are safe integers;
- comparisons break equal orders using task ID;
- allocation checks overflow/safe-integer limits;
- duplicate persisted slots can be normalized deterministically;
- reordering operates on explicit visible task slots;
- recurrence and CSV merges request collision-free new slots rather than relying on `Date.now()` alone.

## 19. Date-time rules

TaskMint uses strict parsing rather than `new Date(input)` as a validity test.

This matters because JavaScript can normalize impossible calendar input in surprising ways.

Validation must reject impossible dates before those values become persisted state.

Due dates and timestamps serve different purposes:

- `dueDate` is a local calendar date (`YYYY-MM-DD`);
- reminder/lifecycle/export timestamps represent instants and are canonicalized to ISO.

## 20. Normalization summary

### Interactive task creation/update

- title: collapse whitespace + trim
- notes: trim
- project: trim
- tags: trim, lower-case, remove empty values, deduplicate
- due date/timestamp: strict validation

### Persisted/backup task validation

- id/title/project: trim
- notes: preserve content subject to length limit
- tags: trim + lower-case + reject empty/oversized + deduplicate
- timestamps: strict parse + ISO canonicalization
- order: safe integer
- lifecycle/status relationship: enforced

This distinction is intentional: persisted-data validation validates/normalizes the serialization contract without inventing arbitrary content rewrites.

## 21. Error model

Validation and import failures use stable `TaskMintError` codes defined in `src/domain/errors.ts`.

Structured details may include:

- maximum length/count
- field name
- task ID
- CSV row number
- duplicate/missing columns
- a safe wrapped validation message

Unknown browser/IndexedDB infrastructure messages are not supposed to be exposed directly as user-facing copy.

## 22. Compatibility guidance for contributors

When changing the data model:

1. update `src/domain/types.ts`;
2. update shared limits if necessary;
3. update task-domain normalization;
4. update persisted/backup validation;
5. update Dexie schema/migration when persisted shape or indexes change;
6. update JSON backup version only when compatibility actually requires it;
7. update CSV encoding version if existing marked semantics cannot remain backward compatible;
8. add migration/import/export/property tests;
9. update this document, `architecture.md`, `testing.md`, and release notes;
10. do not silently reinterpret previously valid user data.

## 23. Authoritative implementation/test references

Runtime:

- `src/domain/types.ts`
- `src/domain/limits.ts`
- `src/domain/datetime.ts`
- `src/domain/order.ts`
- `src/domain/task.ts`
- `src/domain/validation.ts`
- `src/storage/db.ts`
- `src/storage/repository.ts`
- `src/utils/export.ts`

Tests include:

- `tests/task.test.ts`
- `tests/datetime.test.ts`
- `tests/order.test.ts`
- `tests/validation-order.test.ts`
- `tests/repository.test.ts`
- `tests/export.test.ts`
- `tests/csv-compat.test.ts`
- `tests/csv-quoting.test.ts`
- `tests/csv-security.test.ts`
- `tests/property.test.ts`
- `e2e/migration.spec.ts`
- `e2e/backup-restore.spec.ts`
- `e2e/corrupt-local-data.spec.ts`
