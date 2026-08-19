# Release

TaskMint uses Semantic Versioning.

## Release checklist

1. Update `CHANGELOG.md`, `ROADMAP.md`, and `what_changed.md`.
2. Ensure the package version matches the intended release.
3. Confirm a real npm-generated `package-lock.json` is committed and matches `package.json`.
4. From a clean checkout, run `npm install` and `npm run check`.
5. Run `npm audit --audit-level=high`.
6. Install Chromium with `npm run test:e2e:install` and run `npm run test:e2e`.
7. Confirm required hosted CI, E2E, and CodeQL checks completed successfully for the release candidate.
8. Manually review keyboard navigation, theme modes, reduced motion, 200% zoom/reflow, offline reload, import/export, reminders, and local-data deletion.
9. Capture real screenshots from the verified release build using fictional/demo task data only.
10. Confirm repository-relative documentation links and the secret-pattern guard pass through `npm run check`.
11. Tag the verified commit as `vX.Y.Z` only after every blocker above is green.
12. The release workflow reruns `npm run check`, the high-severity dependency audit, and Chromium E2E before publishing anything.
13. Verify the GitHub Release contains both `taskmint-web-vX.Y.Z.tar.gz` and its `.sha256` checksum file.

## Release artifact integrity

On Linux/macOS, verify a downloaded archive with:

```bash
sha256sum -c taskmint-web-vX.Y.Z.tar.gz.sha256
```

On platforms without `sha256sum`, use the operating system's SHA-256 tooling and compare the digest with the published checksum file.

Do not tag a release while required verification is failing, queued without a successful conclusion, or impossible to reproduce from a clean dependency installation.
