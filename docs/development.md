# Development

## Important commands

- `npm run dev` — Vite development server
- `npm run format` / `npm run format:check` — Prettier
- `npm run lint` — strict type-aware ESLint
- `npm run typecheck` — TypeScript project checks
- `npm test` — Vitest unit/component tests
- `npm run test:e2e` — Playwright Chromium journey tests
- `npm run build` — production build
- `npm run check` — complete local quality suite

## Architecture rules

- Put business rules in `src/domain/` rather than event handlers.
- Route persistent changes through `TaskRepository`.
- Validate imported data as untrusted input.
- Do not add network tracking or account requirements without an ADR and privacy review.
- Keep UI actions keyboard accessible and usable at narrow widths.
- Add regression coverage with bug fixes.

## Dependency policy

Top-level dependencies are exact-version pinned. Dependency updates are proposed by Dependabot and should be merged only after CI/E2E verification.
