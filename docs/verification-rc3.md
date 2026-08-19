# TaskMint v0.1 RC3 Verification

This minimal pull-request delta exists only to trigger pull-request quality gates against the complete current `main` release-candidate tree.

## Required automated conclusions

- [ ] Formatting invariants
- [ ] Repository-relative documentation links
- [ ] Common secret-pattern guard
- [ ] ESLint
- [ ] TypeScript project checks
- [ ] Vitest unit/component/data/security regression suite
- [ ] Production Vite/PWA build
- [ ] High-severity npm dependency audit
- [ ] Chromium Playwright E2E suite
- [ ] CodeQL JavaScript/TypeScript analysis

## RC3 behavior represented by the base tree

- Stable typed validation/import errors with safe unknown-error fallbacks
- Strict JSON/CSV validation and shared task/import limits
- Locale-independent canonical tag normalization
- Transactional IndexedDB restore/delete and atomic recurring completion
- Reminder suppression reset only after a successful changed-reminder save
- Time-based Today/Upcoming/Overdue/statistics refresh during long-running sessions
- Deferred export object-URL cleanup
- Progressive large-list rendering
- Keyboard shortcuts and modal/focus accessibility
- Production CSP without Vite development-only inline-style/WebSocket relaxations
- Deterministic docs-link and secret-pattern repository checks
- Release workflow gated by quality, audit, E2E, and SHA-256 artifact checksums

## Release rule

A mergeable PR is not release evidence by itself. Do not create `v0.1.0` until CI, E2E, and CodeQL have explicit successful conclusions for this current candidate; a real npm-generated `package-lock.json` is committed from a successful clean registry resolution; the release checklist is complete; and real release screenshots are captured from the verified build.
