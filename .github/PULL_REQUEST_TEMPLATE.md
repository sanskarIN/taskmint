## Summary

Describe the change, the problem it solves, and why it belongs in TaskMint.

## Scope and risk

- Persistence/data-model impact:
- Import/export compatibility impact:
- Accessibility impact:
- Privacy/security impact:
- PWA/offline impact:
- New/removed/renamed tracked files:

## Verification

- [ ] `npm run format:check`
- [ ] `npm run docs:check`
- [ ] `npm run docs:inventory`
- [ ] `npm run secrets:check`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] Relevant E2E tests pass or the limitation is explained.
- [ ] `npm audit --audit-level=high` was run when dependencies/release readiness are affected.

## Documentation inventory

- [ ] Every added/removed/renamed tracked path is reflected in `docs/file-index.md`.
- [ ] File ownership/coupling changes are reflected in `docs/repository-reference.md`.
- [ ] Test/E2E/benchmark/shared-test-setup path changes are reflected in `docs/test-matrix.md`.
- [ ] Relevant behavior guides/ADR/changelog/`what_changed.md` were updated.

## Quality checklist

- [ ] No secrets, private task data, private backups, or production credentials are included.
- [ ] Persistence-first state and transactional/write-validation invariants were preserved where applicable.
- [ ] Task-writing entry points use the required mutation serialization path where applicable.
- [ ] Keyboard, focus, screen-reader semantics, reduced motion, zoom/reflow, and touch behavior were considered for UI changes.
- [ ] User-facing/bug-fix changes include suitable regression tests.
- [ ] Data-format changes preserve explicit JSON/CSV version/legacy compatibility or document a deliberate migration.
- [ ] Production CSP was not weakened to solve a development-only issue.
- [ ] No lockfile, screenshot, test result, or release evidence was fabricated.

## Hosted checks

Before merge, verify required CI/E2E/CodeQL conclusions belong to this exact current PR head SHA. Older-head, queued, pending, cancelled, or missing checks are not successful current verification.
