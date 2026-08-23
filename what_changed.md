# TaskMint — Current Complete Work Handoff

## Current milestone

- Project: **TaskMint**
- Repository: `https://github.com/sanskarIN/taskmint`
- Visibility/source model: **PUBLIC / OPEN SOURCE**
- License: **MIT**
- Package version: `0.1.0`
- Date: **2026-08-23**
- Default branch: `main`
- Current integration branch: `integration/rc7-cross-platform`
- Current integration PR: **#20** — `feat: integrate RC7 hardening with full cross-platform support`
- PR #20 remains **draft** until the exact current head passes CI, E2E, Native CI, and CodeQL.
- Current `main` base: `4e4850eab204deeb95e4db2bca24f084aaae0d5e`
- Immediately before this handoff commit, PR #20 had **191 commits** and was mergeable.
- Requested continuation commit identity: `Sanskar <sanskarin@outlook.in>`
- Release status: **release candidate only; not released**
- `v0.1.0` tag: **NOT CREATED**

This file is the authoritative continuation checkpoint. Historical implementation details remain available in Git history and `docs/handoffs/what_changed-rc6-2026-08-19.md`.

---

# Verification rule

Only explicit successful checks for the **exact current source SHA** count as verification.

Do not treat any of these as success:

- mergeable PR status;
- queued workflows;
- pending/in-progress workflows;
- cancelled workflows;
- missing checks;
- checks attached to an older head;
- static inspection without dependency-backed execution;
- manually fabricated lockfiles, screenshots, checksums, or test output.

Every commit changes the release-candidate SHA. After the final code/documentation commit, freeze the head and require explicit successful conclusions for:

1. CI;
2. E2E;
3. Native CI;
4. CodeQL.

After merge, verify the actual resulting `main` tree again before tagging when the merge/main SHA differs from the verified PR head.

---

# Integrated RC7 reliability work already preserved

PR #20 includes the complete RC7 reliability/documentation history plus the Tauri 2 cross-platform work.

Important preserved guarantees include:

## Persistence and data integrity

- validation of task/settings reads before React state;
- validation of task/settings writes at the repository boundary;
- complete batch validation before transactions;
- duplicate task-ID rejection before bulk writes;
- transactional multi-task writes;
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

# Cross-platform implementation

TaskMint now contains a Tauri 2 native shell in addition to the web/PWA build.

Supported implementation targets:

- Web/PWA;
- Windows;
- Linux;
- macOS;
- Android;
- iOS.

Native work includes:

- `src-tauri/Cargo.toml`;
- Tauri build/main/library entry points;
- desktop and mobile capability files;
- native application icons;
- Tauri application configuration;
- browser/native runtime detection;
- native file-open/save adapter;
- native notification adapter;
- native external-link adapter;
- mobile safe-area CSS;
- native-aware Settings import/export behavior;
- native-aware PWA boundary;
- desktop Linux/Windows/macOS hosted checks;
- Android ARM64 debug hosted build;
- iOS simulator debug hosted build.

Native signing certificates, provisioning profiles, Play/App Store credentials, and store submission secrets intentionally remain outside the repository.

---

# CI bootstrap defect fixed

A concrete hosted-workflow defect was found on the integrated candidate.

`actions/setup-node@v6` automatically attempted npm dependency caching because `package.json` declares a package manager, but the repository intentionally does not yet contain the real generated `package-lock.json`. The workflow therefore failed before dependency installation.

The workflows were corrected so the pre-lockfile candidate can bootstrap honestly:

- setup-node package-manager caching is disabled until the real lockfile exists;
- CI/E2E/native jobs use the exact Node.js/npm toolchain;
- lockless candidates use `npm install --ignore-scripts`;
- once a lockfile exists, jobs automatically switch to `npm ci --ignore-scripts`;
- the CI quality job preserves a genuinely generated `package-lock.json` as a workflow artifact;
- the release workflow uses the same pinned Node.js/npm versions as CI.

Pinned hosted JavaScript toolchain:

- Node.js `22.23.2`;
- npm `12.0.2`.

The real `package-lock.json` is still **NOT COMMITTED** at this checkpoint. It must come from a real npm resolution, be reviewed, committed, added to `docs/file-index.md`, and reverified. Never fabricate it.

---

# Native reproducibility hardening

Native CI now uses locked npm installs automatically when a JavaScript lockfile is present.

The Linux desktop native job also preserves the genuinely Cargo-resolved `src-tauri/Cargo.lock` as a workflow artifact when Cargo creates it.

`src-tauri/Cargo.lock` is still **NOT COMMITTED** at this checkpoint. If the hosted native run produces it, review the real artifact, commit it, add it to the tracked-file inventory, and reverify the exact new head.

---

# Native adapter regression coverage added

New regression coverage was added for native-specific boundaries instead of relying only on static configuration assertions.

## `tests/platform-files.test.ts`

Covers:

- native save-dialog selection;
- save cancellation;
- open cancellation;
- file metadata validation before read;
- oversized import rejection before content read;
- non-file path rejection;
- valid selected-file reading.

## `tests/platform-links.test.ts`

Covers:

- external URL routing through the OS opener;
- nested click targets;
- unsupported protocols;
- non-primary clicks;
- browser builds not installing native interception;
- same-origin links remaining inside the native webview.

## `tests/native-notifications.test.ts`

Covers:

- existing native notification grants;
- permission request flow;
- denied permission;
- native due-reminder delivery;
- no delivery/ID marking without permission.

## `tests/SettingsDialog.test.tsx`

Extended to cover:

- native JSON restore through the Tauri picker;
- absence of browser file inputs in native mode;
- native CSV import;
- native picker cancellation;
- deterministic busy-state completion before repeated native selection.

The new standalone test paths are included in `docs/file-index.md` and `docs/test-matrix.md`.

---

# Native same-origin link bug fixed

A real cross-platform navigation bug was identified during the native adapter audit.

The original native link handler treated every `http:`/`https:` anchor as external. Tauri can expose the packaged application under an HTTP localhost-style native origin on supported platforms, so a same-origin internal link such as the TaskMint brand `/` link could be sent to the system browser.

The handler now:

- continues to externalize supported off-origin `http:`, `https:`, `mailto:`, and `tel:` links;
- leaves same-origin HTTP(S) navigation inside the native webview;
- leaves unsupported protocols untouched;
- leaves non-primary clicks untouched.

A regression test protects the same-origin behavior.

---

# Native least-privilege security hardening

The native capability audit found broader plugin defaults than TaskMint requires.

## Opener

TaskMint only opens URLs. It does not open filesystem paths or reveal files in the OS file manager.

Desktop and mobile capabilities now grant only:

- `opener:allow-open-url`;
- `opener:allow-default-urls`.

They explicitly no longer use `opener:default`, and tests forbid path/reveal opener permissions.

## Notifications

TaskMint only:

- checks whether notification permission is granted;
- requests notification permission;
- sends notifications.

Desktop and mobile capabilities now grant only:

- `notification:allow-is-permission-granted`;
- `notification:allow-request-permission`;
- `notification:allow-notify`.

They explicitly no longer use `notification:default`.

`tests/native-config.test.ts` now protects both opener and notification least-privilege rules.

`core:default` was intentionally not narrowed speculatively because native runtime/core dependencies must be proven before reducing those permissions further.

---

# Documentation state

The repository already contains the deep documentation system from RC7, including:

- documentation hub;
- user guide;
- data model;
- architecture;
- setup/development/testing guides;
- operations/release guides;
- accessibility/performance/troubleshooting guides;
- cross-platform guide;
- complete tracked-file index;
- complete test matrix;
- repository ownership/coupling reference;
- ADRs;
- screenshot policy;
- security/privacy/support/governance documentation.

`npm run docs:inventory` enforces that every tracked file is represented in `docs/file-index.md` and that test/E2E/benchmark paths remain represented in `docs/test-matrix.md`.

When the real npm or Cargo lockfiles are committed, update the inventory in the same release-hardening sequence.

---

# Current release blockers that must not be fabricated

## 1. Exact-head hosted verification

At the last pre-handoff check, CI/E2E/Native CI/CodeQL for the then-current head were queued or pending. That is **not success**.

After this handoff commit becomes the new head, fetch workflows for that exact SHA and require explicit successful conclusions.

## 2. Real npm lockfile

`package-lock.json` must be produced by genuine npm registry resolution and then committed/reverified.

## 3. Real Cargo lockfile

If Cargo produces `src-tauri/Cargo.lock` during native validation, preserve/review/commit the real file and reverify.

## 4. Real screenshots

Release screenshots are still not present. Capture them only from the real verified application using fictional/demo data. Never fabricate screenshots or claim screenshots were manually verified when they were not.

## 5. Manual release checklist

Still requires real execution where automation cannot prove the result, including relevant browser/device checks for:

- keyboard navigation;
- focus behavior;
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

## 6. Signing/store credentials

Real production signing and store submission require external credentials. Do not commit or fabricate them.

---

# Next continuation sequence

Continue in this order:

1. treat this handoff commit as the new PR #20 head;
2. freeze the candidate head long enough for CI/E2E/Native CI/CodeQL to execute;
3. inspect exact-head failures, if any, and fix only concrete failures with focused commits;
4. if CI uploads a real `package-lock.json`, download/review/commit it;
5. if Native CI uploads a real `src-tauri/Cargo.lock`, download/review/commit it;
6. update `docs/file-index.md` for newly committed lockfiles;
7. rerun exact-head CI/E2E/Native CI/CodeQL and require explicit success;
8. only after exact-head verification, mark PR #20 ready and merge it;
9. verify the actual resulting `main` SHA again;
10. close superseded PRs #17, #18, and #19 after successful integration;
11. perform the real manual release checklist and capture real screenshots;
12. run the release guard, locked install, audit, quality suite, and browser E2E on the final release tree;
13. create `v0.1.0` only after all release gates genuinely pass.

---

# Commit policy

Continue using small, meaningful, focused commits rather than artificial no-op history. Prefer Conventional Commit prefixes such as:

- `fix:`
- `feat:`
- `test:`
- `security:`
- `ci:`
- `docs:`
- `chore:`

Do not merge merely to increase commit count. Reliability, reproducibility, and traceable release evidence remain the priority.
