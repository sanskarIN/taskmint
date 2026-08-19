# Contributing to TaskMint

Thank you for improving TaskMint.

## Ground rules

- Keep TaskMint offline-first, privacy-friendly, accessible, and understandable.
- Never add real credentials, private task data, or tracking without an explicit architecture decision and privacy review.
- Prefer small focused changes with tests over broad rewrites.
- Keep domain rules outside React components when practical.
- Put visible product copy in the i18n layer; use stable typed error codes for validation rather than exposing arbitrary infrastructure messages.
- Keep shared task/import constraints in `src/domain/limits.ts` instead of duplicating magic limits.
- Preserve the production CSP boundary; development-only HMR/style allowances must not leak into the committed production policy.

## Local workflow

1. Fork or branch from the latest `main`.
2. Run `npm install`.
3. Create a focused branch such as `feat/task-bulk-actions`.
4. Make the change and add regression coverage.
5. Run `npm run check`.
6. Run `npm run test:e2e` when a primary user journey, persistence behavior, PWA behavior, or accessibility interaction changed.
7. Run `npm audit --audit-level=high` for dependency or release-related changes.
8. Update documentation and `what_changed.md` when behavior, architecture, setup, security, or release state changes.
9. Open a pull request using the repository template.

## Commit style

Conventional Commits are preferred: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `perf:`, `build:`, `ci:`, and `chore:`.

Keep commits single-purpose when practical. Do not split one inseparable correctness change merely to increase commit count.

## Accessibility review

Test keyboard navigation, visible focus, labels, reduced motion, zoom/reflow, and non-color-only information for UI changes.

## Security reports

Do not open public issues for vulnerabilities that could put users at risk. Follow `SECURITY.md`.
