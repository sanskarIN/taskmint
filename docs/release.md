# Release

TaskMint uses Semantic Versioning.

## Release checklist

1. Update `CHANGELOG.md`, `ROADMAP.md`, and `what_changed.md`.
2. Ensure the package version matches the intended release tag.
3. Confirm a real npm-generated `package-lock.json` is committed and matches `package.json`, including the pinned PWA update runtime dependency.
4. Run `npm run release:check -- vX.Y.Z`; it must confirm both the exact tag/version match and committed lockfile.
5. From a clean checkout, run `npm ci --ignore-scripts` and `npm run check`.
6. Run `npm audit --audit-level=high`.
7. Install Chromium with `npm run test:e2e:install` and run `npm run test:e2e`.
8. Confirm required hosted CI, E2E, and CodeQL checks completed successfully for the exact release-candidate commit.
9. Manually review keyboard navigation, theme modes, reduced motion, 200% zoom/reflow, offline reload, strict JSON/CSV import/export, reminders, Settings failure recovery, local-data deletion, and the fail-closed corrupt-local-data recovery screen.
10. Manually verify the installed-PWA update flow: keep an unsaved task draft, confirm the waiting update does not force a reload, save/cancel the draft, choose Update now, and confirm the waiting service worker activates successfully.
11. Manually verify notification privacy/bounding: individual reminders may display titles; excess due reminders should be summarized without excess task titles.
12. Capture real screenshots from the verified release build using fictional/demo task data only.
13. Confirm repository-relative documentation links and the secret-pattern guard pass through `npm run check`.
14. Tag the verified commit as `vX.Y.Z` only after every blocker above is green.
15. The release workflow reruns the release guard, installs with `npm ci`, runs `npm run check`, the high-severity dependency audit, and Chromium E2E before publishing anything.
16. Verify the GitHub Release contains both `taskmint-web-vX.Y.Z.tar.gz` and its `.sha256` checksum file.

## Release guard behavior

`scripts/check-release.mjs` intentionally fails when either of these conditions is true:

- the requested release tag is not exactly `v${package.json.version}`;
- `package-lock.json` is absent.

This makes the workflow fail closed: a tag cannot silently publish from a newly resolved dependency graph or from mismatched package metadata.

## Hosted verification rule

A queued, pending, cancelled, stale, or otherwise non-successful workflow is not release evidence. If `main` changes after a verification PR is created, create a fresh verification candidate from the new exact `main` commit rather than reusing checks from the older tree.

Core workflow definitions use current supported action majors and Dependabot monitors GitHub Actions updates, but the actual release decision still requires successful run conclusions on the exact candidate.

## Release artifact integrity

On Linux/macOS, verify a downloaded archive with:

```bash
sha256sum -c taskmint-web-vX.Y.Z.tar.gz.sha256
```

On platforms without `sha256sum`, use the operating system's SHA-256 tooling and compare the digest with the published checksum file.

Do not tag a release while required verification is failing, queued without a successful conclusion, or impossible to reproduce from a clean dependency installation.
