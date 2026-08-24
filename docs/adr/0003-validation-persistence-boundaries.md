# ADR 0003: Validate at serialization and persistence boundaries

- Status: Accepted
- Date: 2026-08-19

## Context

TaskMint stores data locally, but local storage is still a serialization boundary. IndexedDB rows can outlive application versions, be modified through browser developer tools, be produced by older code, or be reached through future JavaScript callers that bypass compile-time TypeScript assumptions.

Import files are even less trustworthy. JSON and CSV can contain malformed types, impossible dates, invalid lifecycle combinations, unsafe order values, duplicate IDs, oversized content, or unsupported versions.

Validating only in the UI is therefore insufficient. Validating only on startup is also insufficient because malformed runtime values could be written and become a future startup failure.

## Decision

TaskMint validates at multiple explicit boundaries:

1. Domain creation/update validates and normalizes ordinary interactive task input.
2. JSON/CSV parsing validates imported content before it is accepted.
3. `TaskRepository` validates tasks/settings again immediately before persistence.
4. Batch/replacement operations validate the complete set before opening their write transaction.
5. Backup restore performs complete validation/normalization before the destructive clear/write transaction opens.
6. Startup reads validate persisted tasks/settings before they enter React state.
7. Persisted duplicate safe order slots are normalized deterministically after validation.

Malformed startup data fails closed: the normal editor is not presented and TaskMint does not silently delete/rewrite the unreadable records.

## Consequences

### Positive

- UI validation cannot accidentally become the only safety layer.
- Future JavaScript/runtime callers still encounter repository validation.
- Destructive restore does not clear valid local data before discovering malformed input.
- React state contains validated records rather than raw IndexedDB values.
- Corrupt local data is visible as a recovery condition instead of an empty writable app that could hide data loss.
- Data contracts are easier to regression-test in isolation.

### Costs

- Some values can be validated more than once.
- Validation code must stay aligned with domain types, limits, schema migrations, and import/export code.
- New persisted fields require coordinated updates across multiple modules and tests.

These costs are accepted because local-first does not mean trust-without-validation.

## Invariants

- React task state changes only after the corresponding persistent write succeeds.
- Multi-task writes remain transactional.
- Complete batches are preflight-validated before transaction open.
- Unknown backup schema versions fail rather than being guessed.
- Persisted data recovery must not silently destroy the original records.

## Related files

- `src/domain/types.ts`
- `src/domain/limits.ts`
- `src/domain/validation.ts`
- `src/domain/errors.ts`
- `src/storage/db.ts`
- `src/storage/repository.ts`
- `src/utils/export.ts`
- `tests/repository.test.ts`
- `tests/export.test.ts`
- `tests/validation-order.test.ts`
- `e2e/corrupt-local-data.spec.ts`
- `e2e/migration.spec.ts`

## Documentation impact

Changes to this decision should update:

- `../architecture.md`
- `../data-model.md`
- `../development.md`
- `../testing.md`
- `../operations.md` when release/recovery behavior changes.
