# Development

## Important commands

- `npm run dev` — Vite development server
- `npm run format` / `npm run format:check` — formatting and deterministic text invariants
- `npm run docs:check` — verify repository-relative Markdown links resolve inside the repository
- `npm run secrets:check` — scan tracked text paths for common committed-secret patterns
- `npm run lint` — strict type-aware ESLint
- `npm run typecheck` — TypeScript project checks
- `npm test` — Vitest unit/component tests
- `npm run test:e2e` — Playwright Chromium journey tests
- `npm run build` — production build
- `npm run check` — complete local quality suite, including formatting, docs, secret guard, lint, types, tests, and build

## Architecture rules

- Put business rules in `src/domain/` rather than event handlers.
- Route persistent changes through `TaskRepository`.
- Validate imported data as untrusted input.
- Keep shared task/import limits in `src/domain/limits.ts`; do not duplicate magic length/count limits in UI/import code.
- Put visible product copy in `src/i18n/en.ts` instead of scattering independent strings across components. Domain/debug-only messages may remain internal, but user-facing controls/status copy belongs in the catalog.
- Keep global keyboard shortcuts in the pure resolver at `src/utils/keyboard.ts` and protect editable/modal contexts before adding new bindings.
- Do not add network tracking or account requirements without an ADR and privacy review.
- Keep UI actions keyboard accessible and usable at narrow widths.
- Keep task-card rendering bounded for large datasets; do not remove progressive pagination without replacing it with measured virtualization/pagination.
- Add regression coverage with bug fixes.

## Data portability rules

- JSON is the full-fidelity backup/restore format.
- CSV is a human-readable interchange format and does not preserve original completion/archive timestamps.
- Reject malformed CSV enum/date values rather than silently coercing them.
- Validate an entire JSON backup before replacing current IndexedDB data.
- Keep import byte/task-count limits aligned with `TASK_LIMITS`.

## Repository hygiene

`docs:check` validates local Markdown targets only. External URLs are intentionally not fetched during this deterministic repository check; review important external links during release preparation.

`secrets:check` is a defense-in-depth pattern guard for common credential formats and private keys. It does not replace GitHub secret scanning, credential rotation, or manual security review. Never commit a real secret merely to test the scanner.

## Dependency policy

Top-level dependencies are exact-version pinned. Dependency updates are proposed by Dependabot and should be merged only after CI/E2E verification. A real npm-generated `package-lock.json` remains required before the first release; never fabricate one by hand.
