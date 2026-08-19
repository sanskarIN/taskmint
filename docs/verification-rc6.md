# TaskMint v0.1 RC6 verification

This branch exists only to trigger pull-request verification for the exact final `main` handoff commit:

`4e4850eab204deeb95e4db2bca24f084aaae0d5e`

RC6 includes the complete current source-level hardening pass, including:

- strict timestamp validation
- strict/versioned/backward-compatible CSV parsing
- spreadsheet-formula defenses
- safe integer/deterministic task ordering
- duplicate-order normalization
- validated IndexedDB reads and fail-closed corruption recovery
- transactional multi-task writes
- bounded reminder aggregation
- explicit PWA waiting/update activation
- safe Settings/export failures
- content-safe diagnostic logging
- corrected Vitest 4 benchmarks
- current GitHub Actions majors
- expanded unit/property/component/E2E coverage

This verification file does not change production application behavior.

Do not treat this PR as release approval merely because it is mergeable. The release candidate requires explicit successful CI, E2E, and CodeQL conclusions. The first release additionally requires a real npm-generated `package-lock.json`, a clean `npm ci`/check/audit/E2E run, manual release verification, and real browser screenshots.
