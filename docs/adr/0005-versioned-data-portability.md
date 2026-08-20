# ADR 0005: Version TaskMint portability formats explicitly

- Status: Accepted
- Date: 2026-08-19

## Context

TaskMint promises local ownership of task data. Export/import therefore has to remain predictable across application changes and across tools such as spreadsheet software.

Two formats serve different purposes:

- JSON backup must preserve the complete TaskMint data model.
- CSV must remain human-readable and spreadsheet-friendly while representing fields such as tags without delimiter loss or formula-injection surprises.

Implicit format changes are dangerous because an old file can look syntactically valid while being interpreted with new semantics.

## Decision

Use explicit format/version markers and fail closed on unknown marked versions.

### JSON

Full backup envelope includes:

```text
app = TaskMint
schemaVersion = 2
```

Only the explicitly supported schema version is accepted. Schema evolution must be deliberate rather than guessed from field presence.

### CSV

Required task columns remain stable for human interchange. Current TaskMint exports add:

```text
taskmintEncoding = safe-text-v1
```

The marker enables reversible TaskMint-specific semantics such as:

- spreadsheet-formula neutralization for user-controlled text;
- structured `json:` tag arrays so tag values can safely contain the legacy `|` character.

Unknown non-empty TaskMint encoding versions are rejected.

### Legacy CSV compatibility

Unmarked legacy CSV remains supported with its original semantics:

- tags are pipe-separated;
- a literal `json:` prefix is ordinary text;
- marked text-decoding rules are not retroactively applied.

This prevents newer TaskMint versions from silently reinterpreting previously valid legacy data.

## Consequences

### Positive

- Format evolution has an explicit compatibility boundary.
- New CSV exports can be safer without corrupting legacy semantics.
- Unknown future marked encodings fail rather than producing plausible but wrong task data.
- JSON remains the full-fidelity restore format while CSV remains a practical interchange format.
- Compatibility behavior is testable through deterministic fixtures/property tests.

### Costs

- Import code must support both current marked and legacy unmarked CSV semantics.
- Changing marked semantics may require a new encoding version rather than modifying `safe-text-v1` in place.
- JSON schema changes require explicit migration/version design.

These costs are accepted to preserve user ownership and predictable portability.

## Additional portability invariants

- CSV parser validates strict quoting rather than silently repairing malformed syntax.
- Source record numbers are preserved in validation errors even when blank records are skipped.
- Blank records do not count as imported tasks, while total input remains bounded by the file-size limit.
- CSV merge ordering is rebased after existing local task orders.
- Formula neutralization must remain reversible for TaskMint-marked rows.
- JSON restore validates completely before destructive persistence begins.
- CSV must not be presented as preserving original lifecycle timestamps; JSON is the archival format.

## Related files

- `src/utils/export.ts`
- `src/domain/types.ts`
- `src/domain/limits.ts`
- `src/domain/validation.ts`
- `src/domain/errors.ts`
- `src/App.tsx`
- `tests/export.test.ts`
- `tests/csv-compat.test.ts`
- `tests/csv-quoting.test.ts`
- `tests/csv-security.test.ts`
- `tests/property.test.ts`
- `e2e/backup-restore.spec.ts`

## Documentation impact

Portability changes should update:

- `../data-model.md`
- `../user-guide.md`
- `../architecture.md`
- `../development.md`
- `../testing.md`
- release notes and migration guidance when compatibility changes.
