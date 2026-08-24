# TaskMint Release Guide

TaskMint follows Semantic Versioning, but package metadata alone does not make a build a release. Promotion requires reproducible dependencies, exact-source automated verification, complete documentation, manual browser review, and real artifact evidence.

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
6. ensure documentation describes the actual release tree;
7. ensure every tracked file is represented in `docs/file-index.md`;
8. ensure current tests/E2E/benchmark paths are represented in `docs/test-matrix.md`.

Do not create the Git tag yet.

## 3. Documentation preflight

Review at minimum:

- `README.md`
- `docs/README.md`
- `docs/file-index.md`
- `docs/user-guide.md`
- `docs/setup.md`
- `docs/architecture.md`
- `docs/data-model.md`
- `docs/development.md`
- `docs/testing.md`
- `docs/test-matrix.md`
- `docs/operations.md`
- `docs/accessibility.md`
- `docs/performance.md`
- `docs/release.md`
- `docs/troubleshooting.md`
- `docs/repository-reference.md`
- `docs/github.md`
- current ADRs under `docs/adr/`
- `docs/screenshots/README.md`
- `SECURITY.md`
- `PRIVACY.md`
- `SUPPORT.md`
- `CONTRIBUTING.md`

Run:

```bash
npm run docs:check
npm run docs:inventory
npm run format:check
```

`docs:inventory` uses `git ls-files`, so run it inside a real Git checkout. It is the release guard against silently skipping newly tracked files in documentation.

External links are not fetched by `docs:check`; manually review important external repository/support/funding links.

## 4. Real lockfile requirement

A real npm-generated `package-lock.json` must be committed and consistent with `package.json`.

Generate it only through npm in a network-enabled environment.

Recommended process:

1. start from the intended package graph;
2. run npm normally to generate the lockfile;
3. inspect package versions, registries, and integrity metadata;
4. run clean locked install;
5. run quality/security/browser gates;
6. commit the reviewed generated lockfile;
7. update `docs/file-index.md` because the lockfile becomes a new tracked file;
8. rerun `docs:inventory` and all exact-head checks.

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

The release must not depend on an existing developer `node_modules` tree.

## 7. Automated clean checks

Run:

```bash
npm run check
npm audit --audit-level=high
npm run test:e2e:install
npm run test:e2e
```

`npm run check` currently includes:

1. format invariants;
2. documentation links;
3. documentation inventory;
4. secret patterns;
5. lint;
6. typecheck;
7. unit/component/property/config tests;
8. production build.

## 8. Exact-source hosted checks

The release-candidate source must have explicit successful hosted:

- CI;
- E2E;
- CodeQL.

Always record/check the exact SHA.

If any source, configuration, test, documentation, screenshot, or lockfile commit changes the branch:

- the SHA changes;
- earlier hosted runs become stale for release certification;
- require fresh checks.

## 9. Merge verification

If verification occurs on a PR source branch:

1. require successful exact-head checks;
2. merge only after success;
3. obtain the resulting exact `main` SHA;
4. verify the resulting `main` tree again when required by policy.

Do not assume PR head equals final merge/main SHA.

## 10. Manual task lifecycle review

Using the exact built candidate, verify:

- create;
- edit;
- complete;
- reopen;
- recurring completion/new occurrence;
- archive;
- restore;
- delete;
- Undo.

Verify persistence failures do not leave the UI claiming success.

## 11. Mutation-safety review

Verify:

- rapid repeat task submit does not duplicate;
- rapid repeat row action does not duplicate;
- while one task write is pending, other task rows/composer are unavailable;
- Settings/global task shortcuts cannot enter competing task mutation during pending work;
- Undo cannot race another task write;
- UI re-enables after success/failure;
- recurring completion cannot create duplicate next occurrences through rapid activation.

## 12. Smart views/filter/order review

Verify:

- Inbox;
- Today;
- Upcoming;
- Overdue;
- Completed;
- Archived;
- All Tasks;
- project selection;
- search;
- priority/tag filters;
- all sort modes;
- keyboard manual reorder;
- drag/drop reorder only in intended Manual/active/rendered scope.

## 13. Date rollover/statistics review

Leave the app open across a date change or reproduce focus/visibility return around rollover.

Verify:

- Today changes correctly;
- overdue calculations refresh;
- statistics refresh;
- future completion timestamps are not counted as past seven-day completions.

## 14. Progressive rendering review

Use a large synthetic task set.

Verify:

- initial card count is bounded;
- full matching count is shown;
- Show more reveals additional cards;
- changing search/filter/sort resets the render page correctly.

## 15. Accessibility review

Follow `accessibility.md`.

At minimum verify:

- complete keyboard-only primary journey;
- current smart-view/project semantics;
- named filters/labels;
- visible focus;
- modal focus trap/restoration;
- pending busy/disabled state;
- keyboard ordering;
- 200% zoom/reflow;
- themes;
- reduced motion;
- narrow/mobile touch targets;
- update/recovery semantics.

## 16. JSON backup/restore review

Using fictional/demo data:

1. create tasks covering major fields/statuses;
2. export JSON;
3. inspect schema-v2 envelope;
4. delete local data;
5. restore backup;
6. verify tasks/settings as applicable;
7. try malformed backup and confirm current data is not cleared;
8. verify duplicate IDs, impossible dates, lifecycle errors, and unsafe orders fail safely.

## 17. CSV review

Test current TaskMint CSV with:

- commas;
- quotes;
- multiline text;
- Unicode;
- tags containing `|`;
- literal legacy `json:` tag text;
- formula-like title/notes/project values;
- leading spaces/tabs/newlines before formula prefixes;
- blank logical records;
- malformed quotes;
- unknown encoding marker;
- invalid enum/date values;
- merge into an existing ordered task set.

Verify:

- structured marked tags round-trip;
- legacy unmarked tags retain legacy semantics;
- validation rows refer to original source records;
- blank records do not consume the task quota;
- input-size cap still applies;
- imported manual orders follow existing maximum without collision.

## 18. Same-file import retry

Verify both JSON and CSV where practical:

1. select a file;
2. allow import to fail or complete;
3. choose the same exact file again;
4. confirm the input change can fire again without selecting another file first.

Settings clears the hidden input value immediately after capturing the browser `File` object.

## 19. Local deletion/recovery review

### Delete all

Verify:

- confirmation;
- database clear before UI success;
- task UI clears;
- expected settings state remains/returns.

### Corrupt local data

Using a disposable synthetic profile:

- seed invalid current-schema data;
- verify blocking recovery UI;
- verify normal editor/settings are absent;
- verify malformed records remain untouched.

Never use real personal data for corruption testing.

## 20. Offline review

Use production build/preview or installed PWA:

1. load online to establish cached shell;
2. create local data;
3. switch offline;
4. reload/navigate within supported cached shell;
5. perform local task operations;
6. confirm Offline indicator;
7. restore network;
8. verify local data remains intact.

## 21. Notification review

With explicit permission:

- verify a small set of due reminders;
- verify individual notifications may include task title;
- verify excess due reminders are bounded and summarized without excess titles;
- verify failed delivery remains retryable where practical;
- review OS/browser preview privacy.

Closed-app portable background alarm scheduling is not promised across every browser/OS.

## 22. PWA update review

Use actual production service-worker behavior.

1. run/install current build;
2. keep unsaved task composer input;
3. make a newer build available so a worker waits;
4. confirm Update now/Later instead of forced reload;
5. confirm unsaved input remains while waiting;
6. choose Later and confirm no forced activation;
7. expose prompt again as needed;
8. choose Update now;
9. verify activation/reload;
10. verify persisted local task data remains intact;
11. verify repeated rapid Update now cannot enter multiple concurrent activations.

## 23. Theme/responsive review

Check:

- system theme;
- light;
- dark;
- reduced motion;
- desktop;
- tablet/narrow;
- mobile-like width;
- 200% zoom.

## 24. Privacy/security manual review

Confirm:

- no unintended task-content network/analytics flow;
- production CSP remains restrictive;
- dev CSP allowances remain serve-only;
- unknown raw errors are not shown to users;
- diagnostic logging still fail-closes arbitrary user content;
- imports render as React text rather than raw HTML;
- no real secret is committed;
- exported demo files/screenshots contain no private data.

## 25. Screenshot capture

Only after the exact build is verified:

- follow `screenshots/README.md`;
- use fictional/demo task data;
- capture actual product UI;
- ensure images match the candidate;
- do not use generated/mock imagery as release evidence.

When screenshot files are added, update `file-index.md` and rerun `docs:inventory` because they become tracked repository files.

## 26. Final documentation inventory after artifacts/docs changes

Immediately before tagging, run again:

```bash
npm run docs:check
npm run docs:inventory
npm run format:check
```

This final pass matters because the lockfile, screenshots, changelog promotion, and release documentation themselves may have added/changed tracked paths since earlier verification.

Any commit changes the exact candidate SHA and requires fresh hosted verification.

## 27. Tagging

Only after every blocker is green:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

The exact tag must match package version.

## 28. Tagged release workflow

GitHub Release independently reruns:

1. tag/lockfile guard;
2. `npm ci --ignore-scripts`;
3. `npm run check` including documentation inventory;
4. high-severity audit;
5. Chromium installation;
6. Playwright E2E;
7. package `dist`;
8. generate SHA-256;
9. publish release assets.

Do not manually publish a release to make a failed automated release appear successful.

## 29. Release artifacts

Expected assets:

```text
taskmint-web-vX.Y.Z.tar.gz
taskmint-web-vX.Y.Z.tar.gz.sha256
```

## 30. Checksum verification

Linux/macOS with `sha256sum`:

```bash
sha256sum -c taskmint-web-vX.Y.Z.tar.gz.sha256
```

On other systems use a SHA-256 tool and compare with the published digest.

## 31. Post-release verification

After publication:

- verify tag points to intended commit;
- verify release notes/version;
- verify archive/checksum exist;
- verify checksum;
- verify artifact can be served/used as intended;
- verify public docs/changelog match released version;
- monitor issues/security reports for regressions.

## 32. Failed release workflow

If tagged workflow fails:

1. do not describe the release as successful;
2. inspect actual job/log evidence;
3. determine whether tag/assets were partially created;
4. fix source/process deliberately;
5. follow repository policy for correcting/replacing the release;
6. never alter checksum/artifact metadata to conceal a different source tree.

## 33. Release record

After successful release, update the current handoff with:

- tag;
- release commit SHA;
- successful required check conclusions;
- artifact names/checksum verification;
- screenshot filenames;
- confirmation screenshots used fictional/demo data and the verified build;
- known limitations;
- next roadmap milestone.
