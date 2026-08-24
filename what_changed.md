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
- PR #20 remains **draft** until CI, E2E, Native CI, and CodeQL explicitly succeed for the exact final source head.
- `main` base remains `4e4850eab204deeb95e4db2bca24f084aaae0d5e` until integration is merged.
- Immediately before this handoff commit, the integration head was `6ea580eaa69dac1644aac3a5a5c00fdce9f38bb3`.
- Requested commit identity: `Sanskar <sanskarin@outlook.in>`
- Release status: **release candidate only; not released**
- `v0.1.0` tag: **NOT CREATED**

This file is the authoritative continuation checkpoint. Older implementation detail remains in Git history and `docs/handoffs/what_changed-rc6-2026-08-19.md`.

---

# Exact-SHA verification rule

Only explicit successful checks for the **exact current source SHA** count as release verification.

Do not treat any of these as success:

- mergeable PR status;
- queued, pending, in-progress, cancelled, or missing workflows;
- checks attached to an older source SHA;
- static inspection without dependency-backed execution;
- fabricated lockfiles, screenshots, checksums, packages, or manual-test claims.

After this handoff commit, freeze the source unless a concrete exact-head failure requires a focused fix. Require explicit success for:

1. CI;
2. E2E;
3. Native CI;
4. CodeQL.

After merge, verify the resulting `main` SHA again before tagging if it differs from the verified PR source head.

---

# Integrated product and reliability state

PR #20 combines the complete RC7 reliability/documentation history with the Tauri 2 cross-platform implementation.

Preserved guarantees include:

## Persistence and data integrity

- validated task/settings reads before React state;
- validated task/settings writes at the repository boundary;
- complete batch validation before transaction entry;
- duplicate task-ID rejection before bulk persistence;
- atomic multi-task writes;
- explicit Dexie read-write transactions for single task/settings/delete operations so repository completion follows the transaction boundary;
- complete backup validation before destructive restore scope;
- fail-closed startup for malformed local data;
- deterministic safe-integer ordering and duplicate-order normalization;
- collision-free recurrence/import ordering;
- strict JSON/CSV format and encoding-version validation;
- spreadsheet-formula neutralization for user-controlled exported text;
- strict calendar/timestamp parsing without JavaScript date rollover acceptance.

## Interaction/concurrency safety

- synchronous duplicate-submit protection;
- per-task mutation guards;
- application-wide exclusive task mutation gate;
- serialized Settings/data operations;
- serialized onboarding and PWA activation;
- deterministic browser-test onboarding that waits for real application readiness rather than racing the loading screen;
- same-file import retry safety;
- safe pending/busy semantics during persistence.

## Privacy, accessibility, and PWA

- fail-closed development diagnostics and redacted unknown metadata;
- restricted identifier logging;
- active navigation `aria-current` semantics;
- named search/filter grouping;
- modal focus containment/restoration;
- prompt-mode PWA updates;
- no automatic update reload over unsaved task input;
- responsive themes, reduced-motion support, keyboard workflows, and accessibility regression coverage.

---

# TypeScript, lint, build, and test hardening completed on 2026-08-24

The integrated candidate originally stopped early with 80 lint errors plus TypeScript/Vite/Node ambient-type failures.

This continuation fixed the causes without disabling quality rules:

- Vite client declarations now cover CSS imports and `ImportMeta.env`;
- Node typings cover tests using `node:*` modules;
- unnecessary assertions and unsafe-any cases were removed or narrowed;
- no-await async mocks were corrected;
- Vitest excludes Playwright E2E files;
- config filesystem tests use stable paths under jsdom;
- malformed CSV compatibility fixtures were corrected;
- Settings failure-message typing was widened without removing existing UI;
- task-order validation safely narrows unknown numeric values;
- Vite 8 production minification uses Oxc instead of forcing the legacy esbuild minifier.

Historical candidate `f9f434aacd7f30c7cf646547a0e6d36fb5e2c61a` achieved a complete green CI quality run including install, formatting, docs, inventory, secret checks, lint, typecheck, unit/components, production build, and dependency audit. It remains diagnostic evidence only because later source changes superseded it.

---

# Browser E2E hardening

Exact head `2eb59cbf4ff1b8ce28e1b0db41a4f612501e5048` achieved explicit **E2E success** and **CodeQL success**.

Earlier browser failures led to concrete fixes for:

- checking onboarding before TaskMint left the loading screen;
- keyboard shortcuts running before onboarding became persisted/ready;
- pagination reload racing onboarding persistence;
- stale corrupt-data recovery copy assertions;
- ambiguous `Offline` matching the `offline-first` tagline.

The current browser setup waits for the actual onboarding control/completion and uses unambiguous locators.

Later source commits mean E2E and CodeQL must succeed again on the final locked candidate.

---

# Repository commit-barrier regression test fixed

On exact head `2eb59cbf4ff1b8ce28e1b0db41a4f612501e5048`, CI reached the unit suite after successfully passing install, generated-lock preservation, formatting, documentation, inventory, secret checks, lint, and typecheck.

Its only failure was the regression test proving that a settings write does not resolve before the mocked transaction reports completion. The application persistence implementation was not the failing component; the test could invoke an optional release callback before the callback had been assigned, causing a no-op and timeout.

Focused fix:

- `f2976d375c3b23b5a99122e4a155f3c03e302195` — `test: synchronize repository commit barrier`

The test now waits until the release callback exists, asserts that the repository promise is still unresolved, then releases the mocked transaction.

---

# Cross-platform native status and Windows fix

On exact head `2eb59cbf4ff1b8ce28e1b0db41a4f612501e5048`, Native CI produced:

- Linux desktop: **success**;
- macOS desktop: **success**;
- Android ARM64 debug: **success**;
- iOS simulator debug: **success**;
- Windows desktop: **failure**.

The Windows frontend build succeeded. Rust `cargo check` failed while evaluating `tauri::generate_context!()` because `src-tauri/icons/icon.ico` was not structurally complete (`failed to fill whole buffer`).

The Windows icon was regenerated from the existing TaskMint teal/checkmark branding. An initial larger binary upload was detected as connector-truncated before it was treated as valid release evidence.

The final compact replacement is confirmed in the GitHub tree:

- path: `src-tauri/icons/icon.ico`;
- Git blob: `739115de482b2b59faaefa3b024a01bd102cbdfe`;
- repository size: **5,554 bytes**;
- generated SHA-256: `d2f26daf0dd846259c7541a943602e04a1ae7fd73e1cb185ba20fdbbed3e909e`;
- embedded resolutions: 16×16, 32×32, 48×48, and 256×256.

Relevant commits:

- `53d24ade58f6cc0d165a133fe5ec1fb7d6945833` — initial icon regeneration attempt;
- `db905fde3afc5c6f89a7e81e272721e6bdedf7a8` — `test: validate Windows icon resource bounds`;
- `22a95223fc1ce0c8b4092212ec4cb049fd92e97c` — `fix: replace truncated Windows icon asset`.

`tests/native-config.test.ts` now validates the ICO header, directory size, every entry offset, every image length, and each image payload bound. A future truncated icon should therefore fail ordinary CI before reaching Tauri's Windows resource macro.

Fresh final-head Native CI must still prove Windows acceptance of the replacement.

---

# Reproducible dependency locks are now committed

The release reproducibility blocker is now materially closed in the repository. Both lockfiles came from genuine hosted dependency resolution; neither was manually fabricated.

## npm lock

Original hosted artifact:

- source head: `2eb59cbf4ff1b8ce28e1b0db41a4f612501e5048`;
- artifact ID: `9504681684`;
- artifact name: `dependency-lock-2eb59cbf4ff1b8ce28e1b0db41a4f612501e5048`;
- resolved file: `package-lock.json`;
- file size before commit: **318,056 bytes**;
- SHA-256: `da2556048830390fba7a2c4f382ae42202ec55298c194b4bf91ae792570faabe`;
- generating install reported zero vulnerabilities.

The committed lock is npm lockfile version 3 and retains application version `0.1.0`.

## Cargo lock

Original hosted artifact:

- source head: `2eb59cbf4ff1b8ce28e1b0db41a4f612501e5048`;
- artifact ID: `9504722021`;
- artifact name: `native-cargo-lock-2eb59cbf4ff1b8ce28e1b0db41a4f612501e5048`;
- resolved file: `src-tauri/Cargo.lock`;
- file size before commit: **127,939 bytes**;
- SHA-256: `f6ccc1f203de1ce9a2739374b084a185d099203f0e9a3df477c09fb1d5988a3f`.

## Exact-byte bootstrap and cleanup

Because the connector's normal text/binary write path is unsuitable for safely reconstructing large generated lockfiles, a one-purpose integration-branch workflow was used to:

1. download those exact artifact IDs with the repository Actions token;
2. verify both known SHA-256 hashes before copying;
3. commit the exact files with `Sanskar <sanskarin@outlook.in>`;
4. push only to `integration/rc7-cross-platform`.

Resulting lock commit:

- `290101d926db3ab493e173cab20953230263d439` — `chore: commit verified dependency lockfiles`.

Immediately after the lock commit, the temporary write-enabled workflow was removed:

- `7bb5bd5865fb9565ed1b659f793efb852fa0133d` — `ci: remove one-time lockfile bootstrap`.

The temporary workflow is **not** part of the final automation surface.

Documentation/release bookkeeping:

- `ca3e822859972fd5450352e90c0c61617fe6fd37` — `docs: inventory reproducible dependency locks`;
- `6ea580eaa69dac1644aac3a5a5c00fdce9f38bb3` — `docs: mark dependency lock reproducibility complete`.

`docs/file-index.md` now tracks both:

- `package-lock.json`;
- `src-tauri/Cargo.lock`.

Hosted JavaScript jobs should now use the repository's locked-install path (`npm ci --ignore-scripts`) rather than re-resolving dependencies.

---

# Native security/capability state

TaskMint continues to use feature-scoped Tauri permissions.

Opener grants are restricted to URL behavior including:

- `opener:allow-open-url`;
- `opener:allow-default-urls`.

Notification grants remain limited to:

- `notification:allow-is-permission-granted`;
- `notification:allow-request-permission`;
- `notification:allow-notify`.

Tests forbid broader opener defaults/path/reveal access and broad notification defaults. Same-origin HTTP(S) navigation stays inside the native webview while supported off-origin links route through the OS opener.

---

# Future-version preparation

The package/runtime version remains **`0.1.0`**. Roadmap preparation does not claim that future releases already exist.

## v1.5.0

The v1.5 power-workflow milestone remains planned around:

- bulk workflows;
- saved smart views;
- templates;
- local command palette;
- advanced recurrence;
- local automation;
- import conflict preview;
- recovery tooling;
- additional locales;
- large-dataset performance budgets;
- v1.x migration compatibility;
- full cross-platform release requirements.

Tracking issue: **#21**.

## v1.6.0

This continuation prepared the next planned milestone around portable local planning/interoperability:

- calendar/timeline planning from local task data;
- selective portable task/project/view bundles;
- preflight bundle import and conflict resolution;
- human-readable bundle summaries;
- timezone-aware scheduled local automation with bounded catch-up and pause controls;
- local backup-health metadata without uploading backup contents;
- bounded recovery checkpoints where practical;
- accessible keyboard/screen-reader/reduced-motion/touch planning surfaces;
- granular reminder controls and permission diagnostics;
- versioned selective-bundle schema and migrations;
- property/fuzz coverage for bundle/scheduling/recurrence/timezone/rollback boundaries;
- v1.5-to-v1.6 compatibility tests;
- web/Windows/Linux/macOS/Android/iOS parity or explicit secure limitations;
- no required background network service solely for these local workflows.

Roadmap commit:

- `71726fdb288dbd5a09ff10558e2579b7710c18e8` — `docs: prepare TaskMint v1.6.0 roadmap`.

Tracking issue:

- **#22** — `roadmap: TaskMint v1.6.0 portable planning and local interoperability`.

Do not change the package/runtime version to `1.5.0` or `1.6.0` until prerequisite compatibility milestones are actually being released.

---

# Documentation state

The repository contains the documentation hub, user guide, data model, architecture, setup/development/testing guides, operations/release guides, accessibility/performance/troubleshooting guides, cross-platform guide, exhaustive tracked-file index, test matrix, ownership/coupling reference, ADRs, screenshot policy, security/privacy/support/governance documents, and this handoff.

`npm run docs:inventory` remains an exact-head release gate. The two newly tracked dependency locks are represented in `docs/file-index.md`.

---

# Remaining release blockers

## 1. Final exact-head hosted verification

The source SHA created by this handoff commit must explicitly succeed in:

- CI;
- E2E;
- Native CI;
- CodeQL.

This verification must prove, among other things:

- locked npm installation works from the committed `package-lock.json`;
- the repository commit-barrier regression passes;
- production web build succeeds;
- browser E2E remains green;
- Linux/macOS/Android/iOS remain green;
- Windows Tauri/Rust accepts the compact valid ICO;
- Cargo uses the committed lock successfully;
- documentation inventory includes both locks.

## 2. Real screenshots

Capture release screenshots only from a real verified application build using fictional/demo data. Never fabricate screenshots or manual verification claims.

## 3. Manual release matrix

Still requires real execution where hosted automation cannot prove user-facing behavior, including relevant checks for:

- keyboard navigation and focus;
- zoom/reflow;
- light/dark/system themes;
- reduced motion;
- offline behavior;
- PWA update UX;
- JSON backup/restore;
- CSV import/export;
- notification permissions;
- native open/save dialogs;
- native external links;
- target-platform packaging/signing.

## 4. Signing/store credentials

Production signing, provisioning, notarization, Play/App Store submission, and associated secrets require real external credentials and intentionally remain outside the repository.

## 5. Release tag

`v0.1.0` must not be created until all release gates, post-merge verification, and required manual/external release steps are genuinely complete.

---

# Next continuation sequence

1. Treat this handoff commit as the new PR #20 release-candidate head.
2. Freeze it long enough for CI, E2E, Native CI, and CodeQL to complete.
3. Inspect exact-head failures, if any, and fix only demonstrated defects with focused commits.
4. Once all four exact-head gates explicitly succeed, mark PR #20 ready for review and integrate it according to repository policy.
5. Verify the resulting `main` SHA again; a different merge SHA requires its own evidence before tagging.
6. Close superseded integration PRs only after successful integration.
7. Perform the real manual browser/device release matrix and capture real screenshots.
8. Run release guard, locked install, dependency audit, quality suite, browser E2E, native package verification, and checksums on the final release tree.
9. Complete real signing/provisioning/store work where credentials are available.
10. Create `v0.1.0` only when every required release gate genuinely passes.

---

# Commit policy

Continue using small, meaningful, focused commits rather than artificial/no-op history. Prefer Conventional Commit prefixes such as:

- `fix:`
- `feat:`
- `test:`
- `security:`
- `ci:`
- `docs:`
- `chore:`

Reliability, reproducibility, traceable evidence, and maintainable history take priority over raw commit count.
