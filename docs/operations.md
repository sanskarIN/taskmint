# TaskMint Operations, CI, and Release Handbook

This guide documents how TaskMint is built, checked, verified, and released. It is intended for maintainers and contributors operating the repository rather than ordinary end users.

## 1. Operating principles

TaskMint's release process is intentionally fail-closed.

A change is not considered verified merely because:

- it compiles by inspection;
- a pull request is mergeable;
- an older workflow run passed;
- a workflow is queued/pending;
- a dependency install was skipped;
- a release artifact can be manually assembled.

Verification evidence must belong to the exact source tree being promoted.

Never fabricate:

- `package-lock.json`;
- test results;
- screenshots;
- release checksums;
- workflow conclusions.

## 2. Runtime/tool requirements

Repository engine requirement:

```text
Node.js >= 22.12
```

Primary package manager:

```text
npm
```

The application itself requires no backend service, database server, account, API key, or runtime secret.

For Chromium E2E, Playwright's browser/runtime dependencies must also be installed.

## 3. Package scripts

The canonical script list lives in `package.json`.

### Development

```bash
npm run dev
```

Starts the Vite development server.

### Production build

```bash
npm run build
```

Equivalent logical stages:

1. TypeScript project build (`tsc -b`)
2. Vite production build

### Production preview

```bash
npm run preview
```

Serves the built output for local browser/PWA verification.

### Type checking

```bash
npm run typecheck
```

Runs TypeScript project checks without pretty terminal formatting.

### Lint

```bash
npm run lint
```

Runs ESLint across the repository with zero warnings allowed.

### Formatting write

```bash
npm run format
```

Runs Prettier write mode.

### Deterministic formatting invariants

```bash
npm run format:check
```

Runs `scripts/check-format.mjs`.

It checks tracked text paths for:

- LF-only line endings;
- final newline presence;
- trailing whitespace.

It walks `src`, `tests`, `e2e`, `bench`, `docs`, `.github`, and `scripts`, plus the explicit root text/config file list.

### Documentation link verification

```bash
npm run docs:check
```

Runs `scripts/check-doc-links.mjs`.

It scans root Markdown plus Markdown under `docs/` and `.github/`, then validates repository-relative links.

It intentionally does not fetch external URLs. External-link review remains a release/manual-review responsibility.

### Secret-pattern guard

```bash
npm run secrets:check
```

Runs `scripts/check-secrets.mjs`.

The guard scans repository text for common credential/private-key shapes such as:

- private key headers;
- GitHub tokens;
- AWS access keys;
- Google API keys;
- Slack tokens;
- Stripe live keys;
- OpenAI-style secret keys.

This is defense in depth, not a substitute for GitHub secret scanning, credential rotation, or human review.

Never place a real secret in the repository to test this script.

### Unit/component/property tests

```bash
npm test
```

Runs Vitest once.

Watch mode:

```bash
npm run test:watch
```

### Benchmark

```bash
npm run bench
```

Runs the Vitest benchmark file separately from correctness gates. Benchmarks are diagnostic and are not hard pass/fail timing thresholds.

### Playwright E2E

Install Chromium and system dependencies:

```bash
npm run test:e2e:install
```

Run E2E:

```bash
npm run test:e2e
```

### Combined quality suite

```bash
npm run check
```

Current sequence:

1. `format:check`
2. `docs:check`
3. `secrets:check`
4. `lint`
5. `typecheck`
6. `test`
7. `build`

Dependency audit and browser E2E are intentionally separate commands/workflow steps rather than hidden inside this combined script.

### Release readiness guard

```bash
npm run release:check -- v0.1.0
```

This runs `scripts/check-release.mjs` and requires:

- a non-empty `package.json` version;
- exact tag match `v${package.version}`;
- a committed `package-lock.json`.

The guard is intentionally expected to fail before the real npm-generated lockfile exists.

## 4. Dependency policy

Top-level package versions are pinned exactly in `package.json`.

Current release policy requires a real npm-generated `package-lock.json` before tagging.

Before that lockfile exists, CI/E2E can use a development fallback `npm install --ignore-scripts`. Once the lockfile exists, those workflows automatically switch to:

```bash
npm ci --ignore-scripts
```

The release workflow has **no fallback** and always uses `npm ci --ignore-scripts` after the release guard.

This distinction allows pre-release engineering to continue without pretending an ungenerated lockfile is reproducible release evidence.

## 5. Why install scripts are disabled

Automated dependency installation uses `--ignore-scripts` to reduce exposure to package lifecycle scripts during CI/release installation.

If a future dependency genuinely requires install scripts, changing this policy should be deliberate, documented, security-reviewed, and tested.

## 6. GitHub Actions overview

TaskMint currently defines four workflows:

- `CI`
- `E2E`
- `CodeQL`
- `Release`

Core checkout/setup actions are on current supported majors used by the repository. Dependabot monitors package and/or GitHub Actions dependencies according to `.github/dependabot.yml`.

## 7. CI workflow

File:

- `.github/workflows/ci.yml`

Triggers:

- push to `main`
- every pull request

Permissions:

- `contents: read`

Concurrency:

- group by workflow + ref
- `cancel-in-progress: true`

This means a newer run on the same ref supersedes an older in-progress run.

### CI quality job

Runner:

```text
ubuntu-latest
```

Timeout:

```text
15 minutes
```

Steps:

1. checkout
2. setup Node 22
3. install dependencies
4. format invariant check
5. documentation-link check
6. secret-pattern check
7. lint
8. typecheck
9. unit/component/property tests
10. production build
11. `npm audit --audit-level=high`

A CI run is successful only when the job concludes successfully for the exact commit being verified.

## 8. E2E workflow

File:

- `.github/workflows/e2e.yml`

Triggers:

- push to `main`
- pull request
- manual `workflow_dispatch`

Permissions:

- `contents: read`

Concurrency:

- ref-scoped cancellation enabled

Job:

```text
chromium
```

Runner:

```text
ubuntu-latest
```

Timeout:

```text
20 minutes
```

Steps:

1. checkout
2. setup Node 22
3. install dependencies
4. install Playwright Chromium with OS dependencies
5. run `npm run test:e2e`
6. upload `playwright-report/` for seven days if the job fails

Failure artifacts should be inspected before changing code. Do not guess at an E2E failure if the real report/log is available.

## 9. CodeQL workflow

File:

- `.github/workflows/codeql.yml`

Triggers:

- push to `main`
- pull request
- weekly schedule: Monday at 04:24 UTC

Permissions:

- `contents: read`
- `security-events: write`

Language:

```text
javascript-typescript
```

Concurrency cancellation is enabled per workflow/ref.

The workflow initializes and runs GitHub CodeQL analysis using `github/codeql-action` v4.

## 10. Release workflow

File:

- `.github/workflows/release.yml`

Trigger:

```text
push tag matching v*.*.*
```

Permission:

```text
contents: write
```

Runner:

```text
ubuntu-latest
```

Timeout:

```text
30 minutes
```

### Release sequence

1. checkout
2. setup Node 22
3. run release tag/lockfile guard
4. install with locked `npm ci --ignore-scripts`
5. run `npm run check`
6. run high-severity npm audit
7. install Chromium
8. run Playwright E2E
9. package `dist/` into a `.tar.gz`
10. generate SHA-256 checksum
11. create GitHub Release with generated release notes
12. attach archive + checksum

Release archive name follows:

```text
taskmint-web-<tag>.tar.gz
```

Checksum file:

```text
taskmint-web-<tag>.tar.gz.sha256
```

## 11. Release evidence hierarchy

Before tagging, require evidence in this order.

### Source-level review

Confirms design/code/documentation coherence but is not execution evidence.

### Pull-request exact-head checks

Require explicit successful:

- CI
- E2E
- CodeQL

All must refer to the current PR head.

If a new commit is pushed, every older run becomes stale for release purposes.

### Exact-main checks after merge

After merge, verify the actual resulting `main` tree. Do not assume the PR source SHA equals the resulting main/merge SHA.

### Locked local/hosted release checks

After a real lockfile exists:

```bash
npm ci --ignore-scripts
npm run check
npm audit --audit-level=high
npm run test:e2e:install
npm run test:e2e
```

### Manual browser verification

Complete the documented checklist in `release.md`.

### Real screenshots

Capture from the verified build using fictional/demo data only.

### Tag/release workflow

Only then create the version tag and require the tagged workflow to pass independently.

## 12. Workflow status interpretation

Use exact conclusions.

### Acceptable release evidence

```text
status = completed
conclusion = success
```

for every required workflow/job.

### Not success

- queued
- in_progress
- waiting
- pending
- cancelled
- skipped when the gate was required
- neutral when success is required
- no check returned
- success for an older SHA

Mergeability is a Git merge-state property, not test evidence.

## 13. Concurrency and stale runs

CI, E2E, and CodeQL use cancellation groups to reduce wasted runner capacity.

Even if GitHub does not immediately cancel an older run, maintainers must treat it as stale after a newer commit changes the verified tree.

When diagnosing release readiness, always:

1. fetch the current PR/main SHA;
2. fetch runs attached to that SHA;
3. inspect conclusions for those runs only.

## 14. Dependabot

`.github/dependabot.yml` is the repository automation entry point for dependency update proposals.

Dependency PRs must still pass the same quality/security/browser expectations as ordinary changes. Do not merge solely because an update is automated.

## 15. Repository formatting guard

`scripts/check-format.mjs` is deliberately dependency-free Node code so basic text hygiene can be checked before npm dependencies are available.

It covers the root configuration/documentation files plus recursive code/test/docs/workflow/script directories.

When adding a new text-bearing top-level file or a new directory outside its existing roots, update the guard if that file should be part of deterministic repository hygiene.

## 16. Documentation-link guard

`scripts/check-doc-links.mjs` walks:

- `docs/`
- `.github/`
- root documentation files listed in the script

It ignores:

- anchors-only links;
- external HTTP(S) URLs;
- mailto/tel/data URLs.

It rejects:

- malformed percent-encoding;
- repository-relative links escaping repository root;
- missing repository-relative targets.

When adding a new root Markdown document, add it to the script's `rootMarkdown` list if it is not under an already-walked documentation directory.

## 17. Secret-pattern guard

`scripts/check-secrets.mjs` recursively covers source, tests, E2E, benchmarks, docs, workflows, scripts, and public text assets plus its explicit root-file list.

It emits path + line number + pattern category, but does not intentionally print the matched secret text.

If it ever catches a real secret:

1. treat the credential as compromised;
2. rotate/revoke it at the provider;
3. remove it from repository history as appropriate;
4. do not merely suppress the pattern and continue using the secret.

## 18. CSP and development-server policy

`index.html` contains the restrictive production Content Security Policy.

`vite.config.ts` contains a plugin applied only in `serve` mode that relaxes two directives for Vite development behavior:

- adds `'unsafe-inline'` to `style-src` for dev style injection;
- adds `ws:` / `wss:` to `connect-src` for HMR.

These allowances must not be copied into the committed production CSP just to resolve a development-server issue.

`tests/security-config.test.ts` guards this boundary.

## 19. PWA operations

`vite-plugin-pwa` is configured with:

```text
registerType = prompt
```

not `autoUpdate`.

The generated service worker precaches application assets matching the configured Workbox patterns and uses `/index.html` as navigation fallback.

For realistic PWA verification:

```bash
npm run build
npm run preview
```

Then use browser Application/Storage tooling to inspect:

- manifest
- service worker state
- precache/runtime cache
- IndexedDB
- waiting-worker update behavior

Do not use dev-server HMR behavior as proof of production service-worker behavior.

## 20. Browser data operations

TaskMint's authoritative user data is in IndexedDB database `taskmint`.

Operationally important rules:

- writes update React state only after persistence success;
- multi-task writes are transactional;
- startup reads are validated;
- malformed startup data fails closed and remains untouched;
- JSON restore validates before destructive transaction open;
- delete-all clears both task and settings tables transactionally.

See `data-model.md` and `architecture.md`.

## 21. Release lockfile procedure

When network access is available and the dependency graph is ready:

1. ensure working tree dependencies in `package.json` are intentional;
2. run npm in a clean/network-enabled environment to generate `package-lock.json`;
3. review registry/package/version/integrity changes;
4. run locked install/check/audit/E2E;
5. commit the generated lockfile;
6. let CI/E2E rerun using `npm ci` automatically;
7. do not edit lockfile content manually to simulate npm output.

## 22. Screenshot procedure

`docs/screenshots/README.md` defines the intended release capture set.

Screenshots must:

- come from a verified production build;
- use fictional/demo task content;
- avoid personal/private browser data;
- match the actual released UI;
- not be AI-generated or mocked and presented as release evidence.

## 23. Incident/debug workflow

For a failing PR/workflow:

1. identify exact head SHA;
2. identify failing workflow and job;
3. inspect the actual log/artifact;
4. reproduce locally when possible;
5. fix the proven defect;
6. add/adjust regression coverage;
7. update documentation if behavior/operations changed;
8. push a focused commit;
9. discard older check results as stale;
10. require fresh exact-head success.

## 24. Documentation maintenance rule

Behavioral, architectural, storage, workflow, security, accessibility, setup, or release changes should update the relevant guide in the same pull request.

Use `repository-reference.md` to identify which docs are coupled to each implementation area.

Run:

```bash
npm run docs:check
npm run format:check
```

before considering documentation work complete.
