# TaskMint Operations, CI, and Release Handbook

This guide documents how TaskMint is built, checked, verified, and released. It is for maintainers/contributors operating the repository rather than ordinary end users.

## 1. Operating principles

TaskMint's release process is fail-closed.

A change is not verified merely because:

- it looks correct by inspection;
- a pull request is mergeable;
- an older workflow passed;
- a workflow is queued/pending;
- a dependency install was skipped;
- an artifact can be manually assembled.

Verification evidence must belong to the exact source tree being promoted.

Never fabricate:

- `package-lock.json`;
- test results;
- screenshots;
- checksums;
- workflow conclusions.

## 2. Runtime/tool requirements

- Node.js `>=22.12`
- npm
- Git
- Chromium/Playwright dependencies for browser E2E

TaskMint itself currently needs no backend, database server, account, API key, or runtime secret.

## 3. Package scripts

The canonical list is `package.json`.

### Development

```bash
npm run dev
```

### Production build

```bash
npm run build
```

Logical stages:

1. `tsc -b`
2. Vite production build

### Production preview

```bash
npm run preview
```

### Type checking

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

Type-aware ESLint runs with zero warnings allowed.

### Formatting write

```bash
npm run format
```

### Deterministic formatting invariants

```bash
npm run format:check
```

Runs `scripts/check-format.mjs` and checks configured repository text for:

- LF-only line endings;
- final newline;
- trailing whitespace.

### Documentation links

```bash
npm run docs:check
```

Runs `scripts/check-doc-links.mjs` across root docs plus Markdown under `docs/` and `.github/`.

It validates repository-relative targets and intentionally does not fetch external URLs.

### Documentation inventory

```bash
npm run docs:inventory
```

Runs `scripts/check-doc-inventory.mjs`.

It obtains the current tracked paths from:

```bash
git ls-files
```

and enforces:

- every tracked file is present in `docs/file-index.md`;
- the detailed `docs/repository-reference.md` retains required subsystem sections;
- every tracked `tests/`, `e2e/`, `bench/`, and `src/test/setup.ts` path is present in `docs/test-matrix.md`.

This converts “document every file” from a one-time manual promise into a deterministic repository gate.

### Secret-pattern guard

```bash
npm run secrets:check
```

Runs `scripts/check-secrets.mjs` against configured repository text for common credential/private-key shapes.

It is defense in depth, not a substitute for provider rotation, GitHub secret scanning, or human review.

### Unit/component/property/config tests

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

### Benchmark

```bash
npm run bench
```

Non-gating diagnostic benchmark.

### Playwright E2E

```bash
npm run test:e2e:install
npm run test:e2e
```

### Combined quality suite

```bash
npm run check
```

Current sequence:

1. `format:check`
2. `docs:check`
3. `docs:inventory`
4. `secrets:check`
5. `lint`
6. `typecheck`
7. `test`
8. `build`

Dependency audit and E2E remain explicit additional gates.

### Release readiness guard

```bash
npm run release:check -- v0.1.0
```

Requires:

- non-empty package version;
- exact `v${package.version}` tag match;
- committed `package-lock.json`.

It intentionally fails before a real lockfile exists.

## 4. Dependency policy

Top-level dependency versions are pinned exactly.

Before the first real lockfile, CI/E2E may use:

```bash
npm install --ignore-scripts
```

Once `package-lock.json` is committed, those workflows switch to:

```bash
npm ci --ignore-scripts
```

Tagged Release never has an install fallback: it requires the release guard and `npm ci --ignore-scripts`.

## 5. Why automated install scripts are disabled

`--ignore-scripts` reduces exposure to package lifecycle scripts during CI/release installation.

If a future dependency genuinely requires install scripts, changing this should be deliberate, security-reviewed, documented, and tested.

## 6. GitHub Actions overview

Current workflows:

- CI
- E2E
- CodeQL
- Release

See `.github/workflows/` and `github.md`.

## 7. CI workflow

File: `.github/workflows/ci.yml`

Triggers:

- push to `main`;
- pull request.

Permission:

- `contents: read`.

Concurrency:

- workflow/ref scoped;
- cancel superseded in-progress run.

Runner/timeout:

- `ubuntu-latest`;
- 15 minutes.

Current quality steps:

1. checkout;
2. setup Node 22;
3. install dependencies;
4. format invariants;
5. documentation links;
6. documentation inventory;
7. secret patterns;
8. lint;
9. typecheck;
10. unit/component/property/config tests;
11. production build;
12. high-severity npm audit.

A run counts only if it concludes successfully for the exact commit being verified.

## 8. E2E workflow

File: `.github/workflows/e2e.yml`

Triggers:

- push to `main`;
- pull request;
- manual dispatch.

Permission:

- `contents: read`.

Runner/timeout:

- `ubuntu-latest`;
- 20 minutes.

Sequence:

1. checkout;
2. setup Node 22;
3. install dependencies;
4. install Chromium with system dependencies;
5. run `npm run test:e2e`;
6. upload `playwright-report/` for seven days on failure.

Inspect real failure logs/reports before changing code.

## 9. CodeQL workflow

File: `.github/workflows/codeql.yml`

Triggers:

- push to `main`;
- pull request;
- Monday 04:24 UTC schedule.

Permissions:

- `contents: read`;
- `security-events: write`.

Language:

- JavaScript/TypeScript.

Uses CodeQL v4 and ref-scoped cancellation.

## 10. Release workflow

File: `.github/workflows/release.yml`

Trigger:

```text
v*.*.* tag push
```

Permission:

- `contents: write`.

Runner/timeout:

- `ubuntu-latest`;
- 30 minutes.

Sequence:

1. checkout;
2. setup Node 22;
3. verify tag/lockfile;
4. locked `npm ci --ignore-scripts`;
5. `npm run check` (including documentation inventory);
6. high-severity audit;
7. install Chromium;
8. E2E;
9. package `dist/`;
10. SHA-256 checksum;
11. GitHub Release with generated notes;
12. attach archive + checksum.

Artifacts:

```text
taskmint-web-<tag>.tar.gz
taskmint-web-<tag>.tar.gz.sha256
```

## 11. Release evidence hierarchy

### Source review

Useful but not execution evidence.

### Exact PR-head hosted verification

Require successful:

- CI;
- E2E;
- CodeQL.

If the PR receives another commit, older results are stale.

### Exact `main` after merge

Verify the resulting final tree rather than assuming merge SHA equals source PR SHA.

### Locked release gates

After real lockfile exists:

```bash
npm ci --ignore-scripts
npm run check
npm audit --audit-level=high
npm run test:e2e:install
npm run test:e2e
```

### Manual browser review

Follow `release.md`.

### Real screenshots

Capture from the verified build with fictional/demo data.

### Tag/release workflow

Only then tag and require the tagged workflow to pass independently.

## 12. Workflow status interpretation

Valid required result:

```text
status = completed
conclusion = success
```

Not success:

- queued;
- in progress;
- waiting;
- pending;
- cancelled;
- unexpectedly skipped;
- neutral where success is required;
- missing;
- success attached to an older SHA.

Mergeability is not a test conclusion.

## 13. Concurrency and stale runs

CI/E2E/CodeQL cancel superseded work on the same ref where GitHub scheduling permits.

Regardless of cancellation timing, every older run becomes stale for release evidence after the head changes.

Always verify:

1. current SHA;
2. runs for that SHA;
3. conclusions for those runs only.

## 14. Dependabot

`.github/dependabot.yml` proposes dependency/workflow updates.

Automation does not remove the need for code review, changelog/API review, security review, and CI/E2E verification.

## 15. Formatting guard

`scripts/check-format.mjs` is dependency-free Node code and covers configured root/source/test/E2E/bench/docs/GitHub/script text paths.

If a new top-level text location is introduced, inspect/update its roots/list.

## 16. Documentation link guard

`scripts/check-doc-links.mjs` validates local Markdown targets.

It rejects:

- invalid percent encoding;
- repository escapes;
- missing relative targets.

External links are deliberately not fetched.

## 17. Documentation inventory guard

`scripts/check-doc-inventory.mjs` requires a real Git checkout because it uses `git ls-files`.

It is intentionally dependency-free and should run before lint/test/build in CI.

Maintenance rules:

- add/remove/rename tracked path -> update `docs/file-index.md`;
- test/E2E/benchmark path change -> update `docs/test-matrix.md`;
- subsystem responsibility change -> update `docs/repository-reference.md`.

Do not suppress a missing path simply to make CI green; either document the file or remove it intentionally.

## 18. Secret-pattern guard

`scripts/check-secrets.mjs` scans configured source/tests/E2E/bench/docs/GitHub/scripts/public/root text.

It reports path/line/category without intentionally printing the matched secret.

If it catches a real secret:

1. revoke/rotate it;
2. remove it from active configuration;
3. follow security incident handling;
4. do not just weaken the pattern.

## 19. CSP/development policy

`index.html` holds production CSP.

`vite.config.ts` serve mode adds only dev inline-style/WebSocket allowances for Vite HMR.

Never move those dev relaxations into the production policy as a workaround.

## 20. PWA operations

Current PWA update mode:

```text
registerType = prompt
```

Use:

```bash
npm run build
npm run preview
```

to verify real manifest/service-worker/cache/IndexedDB/waiting-worker behavior.

Dev-server HMR is not production PWA evidence.

## 21. Browser data operations

Authoritative task data is IndexedDB `taskmint`.

Operational invariants:

- persistence before React success state;
- transactional multi-task writes;
- validated startup reads;
- fail-closed malformed startup data;
- backup preflight before destructive restore;
- transactional delete-all.

See `data-model.md` and `architecture.md`.

## 22. Lockfile procedure

When network access is available:

1. review intended `package.json` graph;
2. generate lockfile through npm;
3. review package/registry/integrity changes;
4. run locked install/check/audit/E2E;
5. commit generated lockfile;
6. require fresh CI/E2E using `npm ci`;
7. never hand-edit it to imitate npm output.

## 23. Screenshot procedure

Follow `screenshots/README.md`.

Screenshots must be:

- from a verified production build;
- real UI;
- fictional/demo data;
- free of private browser/user information;
- aligned with the exact release candidate.

## 24. Failure/incident workflow

For a failing workflow:

1. identify exact head SHA;
2. identify workflow/job;
3. inspect actual log/artifact;
4. reproduce when possible;
5. fix proven defect;
6. add regression coverage;
7. update docs if behavior/process changes;
8. push focused commit;
9. mark older results stale;
10. require fresh exact-head success.

## 25. Documentation maintenance

Behavioral/architectural/storage/workflow/security/accessibility/setup/release changes should update coupled docs in the same PR.

Use:

```bash
npm run docs:check
npm run docs:inventory
npm run format:check
```

The compact complete inventory is `file-index.md`; detailed ownership/coupling is `repository-reference.md`.
