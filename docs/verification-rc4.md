# TaskMint v0.1 RC4 Verification

This one-file branch delta exists only to trigger pull-request quality gates against the exact final `main` handoff commit `0423e97069b2fd4afabfc0d1e4bbf0f9ea90465f`.

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

## Candidate rule

This RC4 branch supersedes earlier RC2/RC3 verification candidates because it starts from the exact `main` commit containing the complete `what_changed.md` handoff. A queued, pending, skipped-unexpectedly, cancelled-without-replacement, or failing check is not release success.

## Remaining non-CI release blockers

- Generate and commit a real npm `package-lock.json` from a successful clean registry resolution.
- Capture real release screenshots from a verified browser build using fictional/demo data only.
- Complete the manual checklist in `docs/release.md`.
- Promote the changelog only after all gates are green.
- Only then create `v0.1.0` and verify the release archive plus SHA-256 checksum publication.
