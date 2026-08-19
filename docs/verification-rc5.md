# TaskMint v0.1 RC5 verification

This branch exists only to trigger pull-request verification against exact `main` source commit `b99764de1161e097f5347ffe94e93112f6dfc003`.

Required evidence before any v0.1.0 release decision:

- CI must finish successfully.
- Chromium E2E must finish successfully.
- CodeQL must finish successfully.
- Queued, pending, cancelled, skipped unexpectedly, or stale runs are not successful release evidence.
- A real npm-generated `package-lock.json` must be committed before release.
- The release guard must pass for `v0.1.0` against that real lockfile.
- Real browser/manual accessibility and offline checks must pass.
- Real screenshots must be captured from a verified build using fictional/demo data.

Do not merge this verification-only file into `main`; close the PR after its current verification purpose is complete unless a repository-policy reason requires otherwise.
