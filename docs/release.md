# TaskMint Release Guide

TaskMint follows Semantic Versioning, but package metadata alone does not make a build a release. Release promotion requires reproducible dependency state, exact-source automated verification, manual browser review, and real artifact evidence.

For workflow internals see `operations.md`.

## 1. Non-negotiable release rules

Do not release when any required gate is:

- queued;
- pending/in progress;
- cancelled without a successful replacement;
- failing;
- missing;
- successful only for an older commit;
- impossible to reproduce from a clean dependency install.

Do not fabricate:

- `package-lock.json`;
- screenshots;
- test output;
- workflow conclusions;
- artifact checksums.

A mergeable PR is not release-ready by itself.

## 2. Version preparation

Before verification:

1. choose intended SemVer version;
2. ensure `package.json` version is exact;
3. prepare `CHANGELOG.md` release notes from Unreleased content;
4. reconcile `ROADMAP.md` milestone state;
5. update `what_changed.md` continuation/release state;
6. ensure documentation describes the actual release tree.

Do not create the Git tag yet.

## 3. Documentation preflight

Review at minimum:

- `README.md`
- `docs/README.md`
- `docs/user-guide.md`
- `docs/setup.md`
- `docs/architecture.md`
- `docs/data-model.md`
- `docs/development.md`
- `docs/testing.md`
- `docs/test-matrix.md`
- `docs/operations.md`
- `docs/accessibility.md`
- `docs/release.md`
- `docs/troubleshooting.md`
- `docs/repository-reference.md`
- `SECURITY.md`
- `PRIVACY.md`
- `SUPPORT.md`
- `CONTRIBUTING.md`

Run:

```bash
npm run docs:check
npm run format:check
```

External links are not fetched by `docs:check`; manually review important external support/funding/repository links before release.

## 4. Real lockfile requirement

A real npm-generated `package-lock.json` must be committed and consistent with `package.json`.

Generate it only through npm in a network-enabled environment.

Recommended process:

1. start from intended package graph;
2. run npm normally to resolve/generate lockfile;
3. inspect package versions/registries/integrity metadata;
4. run clean locked install;
5. run quality/security/browser gates;
6. commit the reviewed generated lockfile.

Never manually construct lockfile content to satisfy the release guard.

## 5. Release guard

Before tagging:

```bash
npm run release:check -- vX.Y.Z
```

`scripts/check-release.mjs` requires:

- non-empty package version;
- exact requested tag `v${package.json.version}`;
- `package-lock.json` present.

This guard is intentionally fail-closed.

## 6. Clean locked install

From a clean checkout of the exact candidate:

```bash
npm ci --ignore-scripts
```

The release must not depend on a developer's existing `node_modules` tree.

## 7. Automated local/clean checks

Run:

```bash
npm run check
npm audit --audit-level=high
npm run test:e2e:install
npm run test:e2e
```

`npm run check` includes:

- format invariants;
- docs link check;
- secret-pattern guard;
- lint;
- typecheck;
- unit/component/property/config tests;
- production build.

E2E then verifies built/previewed output in Chromium.

## 8. Exact-source hosted checks

The release-candidate source must have explicit successful hosted:

- CI;
- E2E;
- CodeQL.

Always record/check the exact SHA.

If any source or documentation commit changes the branch:

- the SHA changes;
- earlier hosted runs are stale for release certification;
- require fresh checks.

## 9. Merge verification

If verification occurs on a PR source branch:

1. require successful exact-head checks;
2. merge only after success;
3. obtain the resulting exact `main` SHA;
4. verify the resulting `main` tree again as required by repository policy.

Do not assume PR head equals merge/main SHA.

## 10. Manual functional review

Using the exact built candidate, verify:

### Task lifecycle

- create;
- edit;
- complete;
- reopen;
- recurring completion/new occurrence;
- archive;
- restore;
- delete;
- Undo.

### Mutation safety

- rapid repeat task submit does not duplicate;
- rapid repeat row action does not duplicate;
- while one task write is pending, other task rows/composer are unavailable;
- Settings/global task shortcuts cannot enter competing task action during pending mutation;
- UI re-enables after failure/success.

### Smart navigation/filtering

- Inbox/Today/Upcoming/Overdue/Completed/Archived/All;
- project selection;
- search;
- priority/tag filters;
- all sort modes;
- manual keyboard reorder;
- drag/drop reorder in Manual mode only.

### Date rollover

- leave app open across current-date boundary or simulate relevant focus/visibility return;
- verify Today/Overdue/statistics refresh.

### Progressive rendering

- verify initial bounded list and Show more behavior with a large task set.

## 11. Manual accessibility review

Follow `accessibility.md`.

At minimum:

- keyboard-only primary journey;
- current smart-view/project semantics;
- named filters/labels;
- visible focus;
- modal focus trap/restoration;
- pending busy/disabled state;
- keyboard reordering;
- 200% zoom/reflow;
- themes;
- reduced motion;
- narrow/mobile touch targets;
- update/recovery status semantics.

## 12. JSON backup/restore review

Using fictional/demo data:

1. create tasks covering fields/statuses;
2. export JSON;
3. inspect expected schema-v2 envelope;
4. delete local data;
5. restore backup;
6. verify tasks/settings restoration as applicable;
7. try malformed backup and confirm current data is not cleared;
8. verify duplicate IDs/impossible dates/unsafe orders fail safely.

## 13. CSV review

Test current TaskMint export/import with:

- commas;
- quotes;
- multiline text;
- Unicode;
- tags containing `|`;
- literal legacy `json:` tag text;
- formula-like title/notes/project values;
- leading spaces/tabs/newlines before formula prefix;
- blank logical records;
- malformed quotes;
- unknown TaskMint encoding marker;
- invalid enum/date values;
- CSV merge into an existing ordered task set.

Verify:

- marked structured tags round-trip;
- legacy unmarked tags retain legacy semantics;
- error row numbers refer to original source records;
- blank records do not consume task quota;
- imported manual orders follow existing max without collisions.

## 14. Same-file import retry

Explicitly verify:

1. select a JSON/CSV file that fails or completes;
2. reopen/select the **same exact file** again;
3. confirm the file input change can be triggered again without requiring a different file first.

Settings clears the selected DOM input value immediately after capturing the `File` object to support this.

## 15. Local-data deletion/recovery review

### Delete all

- confirmation appears;
- database clear succeeds before UI claims success;
- tasks disappear;
- appropriate settings state remains/returns as designed.

### Corrupt storage

Using a dedicated test profile/fixture:

- seed invalid current-schema data;
- verify blocking recovery UI;
- verify normal editor/settings are absent;
- verify malformed stored data remains untouched.

Do not use real personal data for corruption testing.

## 16. Offline review

Use production build/preview or installed PWA:

1. load online to establish cached shell;
2. create local data;
3. switch offline;
4. reload/navigate within supported cached app shell;
5. perform local task operations;
6. confirm Offline indicator;
7. restore network;
8. verify local data intact.

## 17. Notification review

With explicit permission:

- verify a small set of due reminders;
- verify individual notifications may include title;
- verify an excess set is bounded and summarized without excess titles;
- verify a failed notification remains retryable where practical;
- verify privacy expectation on OS lock/notification surfaces.

Remember that closed-app background reminder scheduling is not promised across every browser/OS.

## 18. PWA update review

Use actual production service-worker behavior.

1. run/install current build;
2. create/keep unsaved task composer input;
3. make a newer build available so a waiting worker exists;
4. confirm TaskMint shows Update now/Later rather than forcing reload;
5. confirm unsaved input remains while waiting;
6. choose Later and verify no forced activation;
7. trigger notice again as needed;
8. choose Update now;
9. verify activation/reload succeeds;
10. verify local persisted task data remains intact.

Also verify rapid Update now activation does not enter multiple concurrent update calls.

## 19. Theme and responsive review

Check:

- system theme follows OS/browser preference;
- light;
- dark;
- reduced motion;
- desktop width;
- tablet/narrow width;
- mobile-like width;
- 200% zoom.

## 20. Privacy/security manual review

Confirm:

- no new task-content network/analytics flow was introduced unintentionally;
- production CSP remains restrictive;
- development CSP allowances remain serve-only;
- raw unknown errors are not shown to users;
- diagnostic logger still redacts arbitrary content;
- imports are rendered as React text rather than raw HTML;
- no real secret exists in repository/config;
- exported demo files/screenshots contain no private user data.

## 21. Screenshot capture

Only after the exact build is verified:

- use fictional/demo task data;
- capture actual product UI;
- follow `screenshots/README.md` capture set;
- ensure images match the candidate being released;
- do not use generated/mock imagery as evidence of a real build.

## 22. Tagging

Only after every blocker is green:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

The exact tag must match package version.

## 23. Tagged release workflow

The GitHub Release workflow independently reruns:

1. release tag/lockfile guard;
2. `npm ci --ignore-scripts`;
3. `npm run check`;
4. `npm audit --audit-level=high`;
5. Chromium installation;
6. Playwright E2E;
7. package `dist`;
8. generate SHA-256;
9. publish GitHub Release assets.

Do not manually publish a release to bypass a failing workflow unless the repository formally changes its release process and documents why.

## 24. Release artifacts

Expected assets:

```text
taskmint-web-vX.Y.Z.tar.gz
taskmint-web-vX.Y.Z.tar.gz.sha256
```

## 25. Checksum verification

Linux/macOS with `sha256sum`:

```bash
sha256sum -c taskmint-web-vX.Y.Z.tar.gz.sha256
```

On other platforms use an OS SHA-256 tool and compare the digest with the published checksum.

## 26. Post-release verification

After GitHub Release publication:

- verify tag points to intended commit;
- verify release notes/version;
- verify both archive/checksum assets exist;
- verify checksum;
- verify install/serve artifact as appropriate;
- verify public docs/changelog match released version;
- monitor issues/security reports for regressions.

## 27. Failed release workflow

If tagged workflow fails:

1. do not describe the release as successful;
2. inspect actual workflow/job/log evidence;
3. determine whether tag/release assets were partially created;
4. fix source/process deliberately;
5. follow repository policy for correcting/replacing the release;
6. never alter checksum/artifacts to conceal a different source tree.

## 28. Release record

After successful release, update current continuation/handoff documentation with:

- tag;
- release commit SHA;
- successful required check conclusions;
- artifact names/checksum verification;
- screenshot set;
- known limitations;
- next roadmap milestone.
