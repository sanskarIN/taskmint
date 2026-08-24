# TaskMint — Current Complete Work Handoff

## Current milestone

- Project: **TaskMint**
- Repository: `https://github.com/sanskarIN/taskmint`
- Visibility/source model: **PUBLIC / OPEN SOURCE**
- License: **MIT**
- Package/runtime version: `0.1.0`
- Date: **2026-08-24**
- Default branch: `main`
- Integration branch: `integration/rc7-cross-platform`
- Integration PR: **#20** — `feat: integrate RC7 hardening with full cross-platform support`
- PR #20 must remain **draft** until CI, E2E, Native CI, and CodeQL all explicitly succeed for the exact final head.
- Current `main` base remains `4e4850eab204deeb95e4db2bca24f084aaae0d5e` until integration is merged.
- Immediately before this handoff update, the integration head was `22a95223fc1ce0c8b4092212ec4cb049fd92e97c`.
- Requested commit identity: `Sanskar <sanskarin@outlook.in>`
- Release status: **release candidate only; not released**
- `v0.1.0` tag: **NOT CREATED**

This file is the authoritative continuation checkpoint. Historical implementation detail remains available in Git history and `docs/handoffs/what_changed-rc6-2026-08-19.md`.

---

# Verification rule

Only explicit successful checks for the **exact current source SHA** count as release verification.

Do not treat any of these as success:

- mergeable PR status;
- queued/pending/in-progress workflows;
- cancelled workflows;
- missing checks;
- checks attached to an older head;
- static inspection without dependency-backed execution;
- fabricated lockfiles, screenshots, checksums, packages, or test output.

After the final code/documentation/lockfile commit, freeze that SHA and require explicit success for:

1. CI;
2. E2E;
3. Native CI;
4. CodeQL.

After merge, verify the actual resulting `main` tree again before tagging if its SHA differs from the verified PR source head.

---

# Integrated product/reliability state

PR #20 contains the RC7 reliability history plus the Tauri 2 cross-platform implementation.

Important preserved guarantees include:

## Persistence and data integrity

- validation of task/settings reads before React state;
- validation of task/settings writes at the repository boundary;
- complete batch validation before transactions;
- duplicate task-ID rejection before bulk writes;
- transactional multi-task writes;
- single task/settings/delete writes now execute inside explicit Dexie read-write transactions so their repository promises resolve at the transaction completion boundary;
- backup validation before destructive restore scope;
- fail-closed startup behavior for malformed local data;
- deterministic safe-integer task ordering;
- collision-free recurrence/import ordering;
- strict JSON/CSV compatibility and validation;
- spreadsheet-formula neutralization for exported user text.

## Interaction/concurrency safety

- synchronous duplicate-submit protection;
- per-task mutation protection;
- application-wide exclusive task mutation gate;
- serialized Settings/data operations;
- serialized onboarding and PWA update activation;
- deterministic E2E onboarding setup that waits for real app readiness instead of racing the initial loading screen;
- same-file browser import retry safety;
- safe busy/disabled semantics during persistence.

## Privacy/accessibility/PWA

- fail-closed development diagnostic metadata;
- restricted identifier logging;
- active-view `aria-current` semantics;
- named filter/search accessibility grouping;
- modal focus containment/restoration;
- explicit prompt-mode PWA update flow;
- no automatic update reload while user work may be in progress.

---

# TypeScript, lint, test, and Vite hardening completed on 2026-08-24

The integrated candidate previously failed before meaningful validation because Vite/browser and Node ambient types were incomplete and lint reported 80 errors.

This continuation fixed the actual causes rather than disabling rules:

- Vite client declarations now cover CSS side-effect imports and `ImportMeta.env`;
- Node typings cover repository/config tests using `node:*` modules;
- source/test assertions and unsafe-any cases were corrected;
- async mocks that did not await work were made semantically correct;
- Vitest no longer collects Playwright E2E specs;
- filesystem-backed config tests no longer depend on jsdom `import.meta.url` behavior that made paths unstable;
- the malformed future-CSV compatibility fixture was corrected;
- Settings failure-message typing was widened without removing existing UI sections;
- task order validation now narrows unknown numeric data safely;
- Vite 8 production minification uses its Oxc path instead of forcing the legacy `esbuild` minifier.

A historical candidate `f9f434aacd7f30c7cf646547a0e6d36fb5e2c61a` achieved a complete successful CI quality run: install, formatting, documentation checks, inventory, secret-pattern guard, lint, typecheck, unit/components, production build, and dependency audit. That is useful diagnostic evidence but is not final release evidence because later commits changed the head.

---

# Browser E2E status

Exact head `2eb59cbf4ff1b8ce28e1b0db41a4f612501e5048` achieved an explicit **E2E success** and **CodeQL success**.

Earlier E2E failures exposed and led to fixes for:

- checks that queried onboarding before TaskMint had left its loading state;
- keyboard shortcuts being exercised before onboarding persistence/readiness was complete;
- pagination reload racing onboarding persistence;
- stale corrupt-data recovery wording assertions;
- ambiguous `Offline` text matching the `offline-first` tagline as well as the badge.

The E2E setup now waits for the real onboarding control and completion rather than relying on immediate `isVisible()` checks during startup.

Because later commits changed the source head, E2E and CodeQL must succeed again on the final candidate before merge.

---

# CI regression-test barrier fixed

On exact head `2eb59cbf4ff1b8ce28e1b0db41a4f612501e5048`, CI passed:

- dependency installation;
- generated-lock preservation;
- formatting;
- documentation links;
- documentation inventory;
- secret-pattern checks;
- lint;
- typecheck.

The only unit failure was the repository regression test `does not resolve a settings write until the transaction reports commit completion`.

The application persistence implementation was not the cause. The test waited until the mocked settings table write was observed, but could attempt to invoke its optional transaction-release callback before that callback had actually been assigned. The optional call then became a no-op and the test waited until Vitest timed out.

Focused fix:

- `f2976d375c3b23b5a99122e4a155f3c03e302195` — `test: synchronize repository commit barrier`
- the test now waits for the commit-release callback itself to exist before asserting unresolved state and releasing the transaction.

This preserves the intended durability regression coverage without weakening its assertion.

---

# Cross-platform native status and Windows fix

On exact head `2eb59cbf4ff1b8ce28e1b0db41a4f612501e5048`, Native CI produced these explicit results:

- Linux desktop: **success**;
- macOS desktop: **success**;
- Android ARM64 debug: **success**;
- iOS simulator debug: **success**;
- Windows desktop: **failure**.

The Windows frontend build succeeded. Rust `cargo check` failed while evaluating `tauri::generate_context!()` because the checked-in `src-tauri/icons/icon.ico` could not be fully parsed (`failed to fill whole buffer`).

The asset was regenerated from TaskMint's existing teal/checkmark branding as a standards-valid multi-resolution Windows ICO.

An initial larger replacement attempt exposed that the connector write path had truncated that binary payload. That intermediate result was detected before treating it as verified release evidence.

The final replacement is deliberately compact and has been confirmed in the GitHub tree:

- path: `src-tauri/icons/icon.ico`;
- Git blob: `739115de482b2b59faaefa3b024a01bd102cbdfe`;
- repository size: **5,554 bytes**;
- local generated SHA-256: `d2f26daf0dd846259c7541a943602e04a1ae7fd73e1cb185ba20fdbbed3e909e`;
- embedded resolutions: 16×16, 32×32, 48×48, and 256×256.

Relevant commits:

- `53d24ade58f6cc0d165a133fe5ec1fb7d6945833` — initial Windows icon regeneration attempt;
- `db905fde3afc5c6f89a7e81e272721e6bdedf7a8` — `test: validate Windows icon resource bounds`;
- `22a95223fc1ce0c8b4092212ec4cb049fd92e97c` — `fix: replace truncated Windows icon asset`.

`tests/native-config.test.ts` now parses the ICO directory header and every image entry and asserts that each declared image payload remains inside the actual file bounds. A future truncated/corrupt ICO should therefore fail ordinary CI before Tauri's Windows macro reaches it.

Windows Native CI still requires fresh exact-head execution to prove the replacement fixes the hosted Rust/Tauri check.

---

# Dependency reproducibility artifacts now available

Real hosted dependency resolution has produced both required lockfile artifacts. They were downloaded and unpacked during this continuation; neither has been fabricated.

## npm

From exact source head `2eb59cbf4ff1b8ce28e1b0db41a4f612501e5048`:

- artifact ID: `9504681684`;
- artifact name: `dependency-lock-2eb59cbf4ff1b8ce28e1b0db41a4f612501e5048`;
- resolved file: `package-lock.json`;
- file size: **318,056 bytes**;
- file SHA-256: `da2556048830390fba7a2c4f382ae42202ec55298c194b4bf91ae792570faabe`.

The dependency installation that generated it reported zero vulnerabilities.

## Cargo

From Native CI source head `2eb59cbf4ff1b8ce28e1b0db41a4f612501e5048`:

- artifact ID: `9504722021`;
- artifact name: `native-cargo-lock-2eb59cbf4ff1b8ce28e1b0db41a4f612501e5048`;
- resolved file: `Cargo.lock`;
- file size: **127,939 bytes**;
- file SHA-256: `f6ccc1f203de1ce9a2739374b084a185d099203f0e9a3df477c09fb1d5988a3f`.

The commits after that source head changed tests, documentation, and the Windows icon only; dependency manifests were not changed. Prefer fresh final-head artifacts when available, then commit the genuine lockfiles and add them to the tracked-file documentation inventory.

At this handoff update, `package-lock.json` and `src-tauri/Cargo.lock` are still **NOT COMMITTED**. Do not mark the reproducibility work complete until they are checked into Git and exact-head validation has rerun using the locks.

---

# Native security/capability state

TaskMint continues to use least-privilege feature-scoped Tauri permissions.

Opener grants only the required URL operations, including:

- `opener:allow-open-url`;
- `opener:allow-default-urls`.

Notification grants are limited to:

- `notification:allow-is-permission-granted`;
- `notification:allow-request-permission`;
- `notification:allow-notify`.

Tests continue to forbid broader opener defaults/path/reveal capabilities and broad notification defaults.

Same-origin HTTP(S) links remain inside the native webview; supported off-origin links are routed through the OS opener.

---

# Future version preparation

The runtime/package version remains `0.1.0`. Future roadmap preparation does **not** change the released version.

## v1.5.0

The existing v1.5 power-workflow roadmap remains the planned milestone for bulk workflows, saved smart views, templates, command palette, advanced recurrence, local automation, import conflict preview, recovery tooling, locale expansion, performance budgets, migration compatibility, and cross-platform release parity.

Tracking issue: **#21**.

## v1.6.0

This continuation added the next roadmap milestone:

- calendar/timeline planning from local task data;
- selective portable task/project/view bundles;
- safe bundle import preview and conflict resolution;
- human-readable bundle summaries;
- timezone-aware scheduled local automation with bounded catch-up;
- local backup-health information without uploading backup content;
- bounded local recovery checkpoints where practical;
- accessible keyboard/screen-reader/reduced-motion/touch planning surfaces;
- granular reminder controls and permission diagnostics;
- versioned bundle schema and migration fixtures;
- fuzz/property testing for bundle/scheduling/recurrence/rollback boundaries;
- v1.5-to-v1.6 compatibility tests;
- full web/desktop/mobile capability parity or explicitly documented secure limitations;
- no required background network service for these local workflows.

Roadmap commit:

- `71726fdb288dbd5a09ff10558e2579b7710c18e8` — `docs: prepare TaskMint v1.6.0 roadmap`.

Tracking issue:

- **#22** — `roadmap: TaskMint v1.6.0 portable planning and local interoperability`.

Do not change the package/runtime version to `1.5.0` or `1.6.0` until the prerequisite compatibility milestones are actually being released.

---

# Documentation state

The repository continues to include the documentation hub, user guide, data model, architecture, setup/development/testing guides, operations/release guides, accessibility/performance/troubleshooting guides, cross-platform guide, tracked-file index, test matrix, ownership/coupling reference, ADRs, screenshot policy, security/privacy/support/governance documentation, and this continuation handoff.

`npm run docs:inventory` remains a release gate. When the genuine npm/Cargo lockfiles are committed, add both paths to `docs/file-index.md` in the same hardening sequence.

---

# Remaining release blockers

## 1. Final exact-head verification

The newest source after this handoff commit must receive explicit successful CI, E2E, Native CI, and CodeQL conclusions. Older green runs remain diagnostic evidence only.

## 2. Commit genuine dependency locks

Commit the real generated `package-lock.json` and `src-tauri/Cargo.lock`, update `docs/file-index.md`, and rerun all exact-head gates using the committed locks.

## 3. Real screenshots

Capture screenshots only from a real verified release build using fictional/demo data. Never fabricate or claim manual screenshot verification that did not occur.

## 4. Manual release matrix

Still requires real execution where automation cannot prove the outcome, including relevant browser/device checks for:

- keyboard navigation and focus behavior;
- zoom/reflow;
- light/dark/system themes;
- reduced motion;
- offline behavior;
- PWA update UX;
- JSON backup/restore;
- CSV import/export;
- notification permission behavior;
- native open/save dialogs;
- native external links;
- target-platform packaging/signing where applicable.

## 5. Signing/store credentials

Production signing, provisioning, notarization/store submission, and related secrets require real external credentials and must remain outside the repository.

---

# Next continuation sequence

Continue in this order:

1. treat this handoff commit as the new PR #20 source head;
2. freeze the head and inspect CI/E2E/Native CI/CodeQL for that exact SHA;
3. confirm that the synchronized repository test passes and that Windows Tauri/Rust accepts the compact ICO;
4. fix only concrete exact-head failures with focused commits;
5. obtain the newest genuine `package-lock.json` and `src-tauri/Cargo.lock` artifacts when final-head workflows generate them;
6. commit both genuine locks and add them to `docs/file-index.md`;
7. rerun CI/E2E/Native CI/CodeQL on the new lockfile head and require explicit success;
8. only after final exact-head success, mark PR #20 ready and merge it;
9. verify the resulting `main` SHA again;
10. close superseded integration PRs after successful integration;
11. perform the real manual release checklist and capture real screenshots;
12. run release guard, locked install, audit, quality suite, browser E2E, native package verification, and checksums on the final release tree;
13. create `v0.1.0` only when every required release gate genuinely passes.

---

# Commit policy

Continue using small, meaningful, focused commits rather than artificial/no-op history. Conventional prefixes remain preferred:

- `fix:`
- `feat:`
- `test:`
- `security:`
- `ci:`
- `docs:`
- `chore:`

Reliability, reproducibility, release evidence, and maintainable history take priority over raw commit count.
