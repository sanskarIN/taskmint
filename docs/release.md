# Release

TaskMint uses Semantic Versioning.

## Release checklist

1. Update `CHANGELOG.md`, `ROADMAP.md`, and `what_changed.md`.
2. Ensure the package version matches the intended release.
3. Run `npm run check` from a clean checkout.
4. Run `npm run test:e2e` in Chromium.
5. Manually review keyboard navigation, theme modes, offline reload, import/export, and local-data deletion.
6. Capture real screenshots from the release build.
7. Tag the verified commit as `vX.Y.Z`.
8. The release workflow reruns the quality suite, builds `dist/`, creates a compressed web artifact, and publishes generated GitHub release notes.

Do not tag a release while required CI is failing.
