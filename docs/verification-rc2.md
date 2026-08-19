# TaskMint v0.1 RC2 Verification

This document exists to provide a minimal pull-request delta that triggers all pull-request quality gates against the complete current release-candidate source tree. This update re-synchronizes the PR after notification-delivery hardening and its regression test landed on `main`.

## Automated gates required before `v0.1.0`

- [ ] CI formatting invariants
- [ ] ESLint
- [ ] TypeScript project checks
- [ ] Vitest unit/component/parser/keyboard/notification regression suite
- [ ] Production Vite/PWA build
- [ ] High-severity npm dependency audit
- [ ] Chromium Playwright E2E suite
- [ ] CodeQL JavaScript/TypeScript analysis

## E2E journeys expected in RC2

- Offline task creation/completion
- IndexedDB v1→v2 migration
- Global keyboard shortcuts and typing safeguards
- JSON backup → local deletion → JSON restore
- Progressive large-list rendering
- Browser accessibility smoke checks

## Release rule

Do not create the `v0.1.0` tag from this checklist alone. Record completed hosted conclusions in `what_changed.md`, capture real release screenshots, generate a real npm lockfile from successful registry resolution, and complete the documented release checklist first.
