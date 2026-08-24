# TaskMint Troubleshooting Guide

This guide is organized by symptom. Preserve local user data before taking destructive browser-storage actions.

For setup see `setup.md`. For CI/release failures see `operations.md` and `release.md`. For exact stored/imported shapes see `data-model.md`.

## 1. TaskMint does not start after cloning

Check:

```bash
node --version
npm --version
```

Node must satisfy `>=22.12`.

Then install dependencies:

```bash
npm install
```

and start:

```bash
npm run dev
```

If dependency installation fails, diagnose the actual npm/network/registry error. Do not create a fake `package-lock.json` to bypass it.

## 2. Development server works but production build fails

Run individual stages:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The development server can tolerate conditions that strict type/lint/build gates reject. Fix the reported source/config error rather than weakening CI globally.

## 3. Vite HMR/CSP behaves differently from production

This difference is intentional.

`index.html` contains the restrictive production CSP.

`vite.config.ts` injects dev-only allowances for:

- inline development style injection;
- HMR WebSocket connections.

Do not copy those relaxations into production HTML merely to make development HMR work.

Use:

```bash
npm run build
npm run preview
```

when testing real production CSP/PWA behavior.

## 4. Tasks do not appear after reload

Check browser site-storage settings and confirm IndexedDB is available.

Private/incognito modes may clear/persist data differently.

If the data matters, export a JSON backup before clearing site data whenever the app is still usable.

Use browser Application/Storage tools to inspect IndexedDB database:

```text
taskmint
```

Tables:

- `tasks`;
- `settings`.

## 5. TaskMint shows “Could not safely load local TaskMint data”

This is a deliberate fail-closed recovery state.

TaskMint detected a storage/read/validation failure and intentionally did **not** present an empty writable editor.

Do not clear site data merely to make the warning disappear unless you understand that doing so deletes local records.

Recommended approach:

1. preserve the browser profile/site-data copy if the tasks matter;
2. inspect browser console/storage for the local problem in a trusted environment;
3. reload after resolving browser-storage access problems;
4. use explicit future recovery tooling if/when the project provides it;
5. only clear site data when accepting the loss of those local records.

The existing malformed records are not intentionally auto-rewritten/deleted by this startup path.

## 6. A task action is temporarily disabled

TaskMint serializes persistence-sensitive mutations to prevent stale-state races.

While one task write is pending, other task rows/the composer/Settings entry can be temporarily disabled.

This is expected for operations such as:

- create/edit;
- complete/reopen;
- archive/restore;
- delete/Undo;
- reorder.

If controls remain disabled indefinitely, inspect for a real unresolved browser/IndexedDB promise/error and reproduce with tests. The mutation gate is designed to release in `finally` on success/failure.

## 7. A rapid double click only performs one task action

Expected behavior.

TaskComposer and TaskItem use local synchronous locks, and App uses a global task mutation gate. Duplicate same-tick task writes are intentionally suppressed.

This prevents cases such as duplicate recurring next occurrences.

## 8. Recurring task appears at an unexpected manual position

Current App completion allocates the next recurring occurrence after the current maximum safe task order.

If order looks wrong:

- confirm you are using Manual sort;
- inspect task `order` values in a test profile;
- verify persisted values are safe integers;
- verify no new code bypassed `nextTaskOrder(...)`;
- run `tests/order.test.ts`, `tests/task.test.ts`, and relevant App tests.

Persisted duplicate safe order slots are normalized deterministically at validated read/backup boundaries.

## 9. PWA update is waiting

Expected behavior.

TaskMint does not use automatic tab reloads for updates because that could discard unsaved task input.

When a new worker waits, TaskMint shows:

- **Update now**
- **Later**

Save/cancel important draft input before Update now.

Update activation is serialized. Repeated clicks should not create competing update calls.

If activation fails, TaskMint shows safe error text and leaves local task data unchanged.

## 10. PWA update never appears

Use a production build/preview or real deployed PWA—not only `npm run dev`.

Check browser Application tools:

- current service worker;
- waiting worker;
- update check timing;
- cache/storage;
- manifest.

Ensure `vite.config.ts` still uses `registerType: 'prompt'` and the update prompt is mounted.

## 11. Offline reload fails

First load the production/deployed app online so service-worker assets can be cached.

Then test offline.

If it fails:

- confirm service worker is registered/controlling the page;
- inspect cache entries;
- confirm navigation fallback exists;
- confirm you are not testing only the HMR dev server;
- check browser PWA/service-worker policy.

Task content itself should remain in IndexedDB independent of network availability.

## 12. Offline badge seems inaccurate

The badge is based on `navigator.onLine`, which is a coarse browser connectivity signal. A browser can report online while a particular host/DNS path fails, or report state changes differently by platform.

Do not use the badge as a network diagnostic tool; it is a user hint.

## 13. Notifications do not appear

Check:

- TaskMint notification setting;
- browser site permission;
- OS notification permission/focus mode;
- TaskMint is currently open;
- reminder timestamp is due;
- task status is active.

TaskMint does not promise reliable closed-app background scheduling across all browsers/OSes.

## 14. Too many reminders are due

TaskMint intentionally bounds delivery.

A small number can receive individual notifications with task titles. Excess due reminders are combined into one count-only summary.

This prevents large imported datasets from producing an unbounded title-bearing notification burst.

## 15. Notification title appeared on lock screen

Individual reminders may include task titles, and the OS/browser decides preview visibility.

If titles are sensitive:

- disable TaskMint notifications; or
- configure private notification previews in browser/OS settings.

See `../PRIVACY.md`.

## 16. JSON import fails

The file must be a valid TaskMint schema-v2 JSON backup.

Potential failures include:

- invalid JSON;
- wrong `app`/schema version;
- too many tasks;
- duplicate task IDs;
- malformed/oversized fields;
- invalid enum values;
- impossible dates/timestamps;
- invalid active/completed/archived timestamp combinations;
- invalid settings;
- unsafe task order.

TaskMint validates before destructive replacement. A malformed restore should not clear current valid tasks.

See `data-model.md`.

## 17. JSON restore asks for confirmation

Expected when current tasks exist.

JSON restore replaces the local task set rather than appending. Confirm only when you intend replacement.

Take a backup first if needed.

## 18. CSV import fails

CSV requires all expected task headers:

- title;
- notes;
- priority;
- dueDate;
- reminderAt;
- tags;
- project;
- recurrence;
- status.

Current TaskMint exports additionally include `taskmintEncoding`.

Failures can include:

- missing/duplicate headers;
- invalid priority/recurrence/status;
- impossible date/timestamp;
- malformed task fields;
- unknown non-empty encoding version;
- malformed structured tags;
- invalid quote placement;
- unterminated quote;
- input too large;
- too many nonblank task records.

## 19. CSV error row seems after a blank row

Current parser preserves the original logical source record number before blank-record filtering.

For example, if row 2 is blank and row 3 contains an invalid priority, the error should identify row 3.

If it reports a compacted row instead, this is a regression in `src/utils/export.ts` / `tests/csv-compat.test.ts`.

## 20. CSV with many blank rows reports too many tasks

That should not happen in current RC7 behavior.

Blank logical records are excluded before the 100,000-task count check. The independent 25 MB input-size limit still applies.

If the error is **file too large**, reducing blank content can still be necessary.

## 21. CSV imported tasks collide/reorder strangely

CSV append ordering should start at `nextTaskOrder(existingTasks)` and assign contiguous orders to actual nonblank imported rows.

Check:

- `src/App.tsx` passes the current next order;
- `csvToTasks(...)` receives/uses its caller-provided base;
- imported order arithmetic stays within safe integers;
- Manual sort is active when evaluating visible order.

## 22. Legacy `json:` tag changes unexpectedly

Unmarked legacy CSV must treat `json:` as ordinary tag text and use legacy pipe-separated semantics.

Structured `json:` tag decoding occurs only under current TaskMint marked encoding.

If an unmarked legacy file is being decoded as structured tags, report a compatibility regression.

## 23. Spreadsheet changes formula-like fields

Use a current TaskMint CSV export. It marks `safe-text-v1` and neutralizes formula-like title/notes/project values reversibly.

This includes prefixes after leading spaces/tabs/newlines.

CSV remains readable data; neutralization is not encryption/privacy protection.

## 24. Cannot select the same import file twice

Current Settings clears the hidden file input value immediately after capturing the selected `File`, before asynchronous import work settles.

Therefore reselecting the same exact JSON/CSV file should trigger another change event.

If it does not:

- reproduce in a current supported browser;
- verify `SettingsDialog.tsx` still resets `event.target.value` before `await`/locked return;
- run `tests/SettingsDialog.test.tsx`.

## 25. Export fails

Browser Blob/object-URL/download APIs can fail because of browser policy/environment.

TaskMint contains export failures behind safe Settings copy. Failed export does not intentionally alter IndexedDB task data.

Try:

- a standard non-private browser profile;
- allowing downloads for the site;
- checking browser download restrictions;
- inspecting console for development diagnostics that do not expose task content.

## 26. Download is created but object URL seems revoked

TaskMint intentionally schedules object URL revocation for a later timer turn after the anchor click.

`tests/download.test.ts` protects this lifecycle.

## 27. `npm run docs:check` fails

Read the reported Markdown path/target.

The checker rejects:

- missing repository-relative target;
- relative link escaping repository;
- invalid percent-encoding.

External URLs are intentionally not fetched.

If you added a new root Markdown file, ensure `scripts/check-doc-links.mjs` includes it if it is outside walked `docs/`/`.github/` roots.

## 28. `npm run format:check` fails

The custom guard checks:

- LF line endings;
- final newline;
- trailing whitespace.

It is not only a Prettier style check.

Use the reported path/line. `.editorconfig` provides matching editor defaults.

## 29. `npm run secrets:check` fails

Inspect reported path/line/category.

Never weaken a pattern around a real credential.

If a real secret was committed:

1. revoke/rotate it;
2. remove it from active configuration;
3. follow `../SECURITY.md`;
4. evaluate repository-history cleanup as needed.

## 30. `npm run release:check` fails because lockfile is missing

Expected before the real npm-generated `package-lock.json` is committed.

Do not fabricate one.

Generate it in a network-enabled npm environment, review it, run locked verification, then commit it.

## 31. `npm run release:check` reports tag mismatch

The supplied tag must exactly equal:

```text
v${package.json.version}
```

Update package version intentionally or use the correct intended tag. Do not bypass the guard.

## 32. Dependency installation fails

Confirm:

- Node 22.12+;
- npm works;
- DNS/network/registry access;
- no proxy/firewall issue;
- package registry is reachable.

Generated `node_modules` can be removed/reinstalled, but do not delete TaskMint browser IndexedDB while troubleshooting Node tooling.

## 33. Playwright browser install fails

Run:

```bash
npm run test:e2e:install
```

from an environment with network access and permission to install system Chromium dependencies.

A release must not be tagged while required browser verification remains unavailable/unverified.

## 34. Playwright test fails only in CI

CI uses:

- Linux `ubuntu-latest`;
- Chromium;
- retries;
- GitHub reporter;
- failure report artifact.

Inspect the actual job log and `playwright-report` artifact. Do not guess from the test filename alone.

Try local production-build E2E and inspect trace on retry where available.

## 35. GitHub workflow is queued for a long time

Queued is not success.

Check:

- current exact PR head SHA;
- whether older runs are stale/superseded;
- GitHub Actions runner/service state;
- repository Actions permissions/limits;
- concurrency cancellation.

Do not merge/release based on an older SHA just because its run eventually completes.

## 36. PR says mergeable but checks are pending

Mergeable means Git can currently merge the branches. It is not a quality/security conclusion.

Follow `github.md` and `release.md`: require explicit successful CI/E2E/CodeQL on the exact current head where those checks are required.

## 37. CodeQL fails

Inspect CodeQL result/action log for the exact SHA.

Fix the proven code/config/security issue. Do not disable CodeQL solely to make the status green.

## 38. `npm audit` fails

Inspect the vulnerable dependency path, severity, available fixed version, and whether it is runtime/dev-only.

Because release gate is `--audit-level=high`, high/critical findings block release until resolved or the repository makes a documented, reviewed exception.

Dependency changes still require full quality/E2E verification.

## 39. Statistics look stale after midnight

TaskMint refreshes current time periodically and on window focus/document visibility change.

Try refocusing the window. If Today/Overdue/statistics remain stale, inspect the time-refresh effect and corresponding task-domain tests.

## 40. Show more disappears after changing filters

Changing filters/search/sort resets progressive rendering to its initial 100-task page. This is expected.

If more tasks still match, the current remaining-count logic should show the load-more button again.

## 41. Need deeper help

- End-user behavior: `user-guide.md`
- Data/import contract: `data-model.md`
- Architecture: `architecture.md`
- Setup: `setup.md`
- Testing: `testing.md` / `test-matrix.md`
- CI/release: `operations.md` / `release.md`
- File ownership: `repository-reference.md`
- Security: `../SECURITY.md`
- Support: `../SUPPORT.md`
