# Contributing to TaskMint

Thank you for improving TaskMint.

## Ground rules

- Keep TaskMint offline-first, privacy-friendly, accessible, and understandable.
- Never add real credentials, private task data, or tracking without an explicit architecture decision and privacy review.
- Prefer small focused changes with tests over broad rewrites.
- Keep domain rules outside React components when practical.
- User-facing strings should remain ready to move into the i18n layer.

## Local workflow

1. Fork or branch from the latest `main`.
2. Run `npm install`.
3. Create a focused branch such as `feat/task-bulk-actions`.
4. Make the change and add regression coverage.
5. Run `npm run check`.
6. Run `npm run test:e2e` when a primary user journey changed.
7. Update documentation and `what_changed.md` when behavior, architecture, setup, or release state changes.
8. Open a pull request using the repository template.

## Commit style

Conventional Commits are preferred: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `perf:`, `build:`, `ci:`, and `chore:`.

## Accessibility review

Test keyboard navigation, visible focus, labels, reduced motion, zoom/reflow, and non-color-only information for UI changes.

## Security reports

Do not open public issues for vulnerabilities that could put users at risk. Follow `SECURITY.md`.
