# TaskMint Release Screenshot Policy

This directory intentionally contains documentation only until real screenshots are captured from a browser-verified release candidate.

Do **not** add generated/mock images and describe them as proof of the shipped UI. Release screenshots are evidence of the real built product and must correspond to the exact candidate being released.

## Preconditions

Capture screenshots only after:

1. the candidate source tree is frozen;
2. a real npm-generated lockfile exists for the release process;
3. clean locked quality/audit/E2E gates pass;
4. required exact-SHA hosted checks pass;
5. the production build is running in a real browser/PWA environment;
6. manual release verification has not found a blocking UI/data/accessibility issue.

If the source tree changes after capture, review whether screenshots must be recaptured. Any visible UI change requires new captures.

## Privacy requirements

Use fictional/demo data only.

Never include:

- real personal task titles or notes;
- real private project/customer names;
- credentials/tokens;
- personal email/account pages outside the deliberate public project contact content;
- browser bookmarks/history/profile identifiers;
- OS notification content from private tasks;
- other unrelated desktop applications/windows containing private information.

Use a dedicated test browser/profile when practical.

## Required capture set

### 1. Light theme desktop — Inbox

Show:

- TaskMint brand/top bar;
- Sidebar smart views/projects;
- task composer;
- representative fictional active tasks with different priorities/tags/due states;
- Toolbar/search/filter controls;
- footer where practical.

Avoid a dataset so crowded that the product layout becomes unreadable.

### 2. Dark theme desktop — filtering/smart view

Show a distinct real state such as:

- Today/Upcoming/Completed view; or
- a search/filter combination;
- dark theme applied consistently;
- active navigation state visible.

Do not make this a duplicate of the light Inbox capture with only the palette changed if a more useful state can be shown.

### 3. Mobile/narrow width — composer + task list

Show the responsive layout at a realistic narrow viewport.

Verify before capture:

- no unintended horizontal clipping;
- task actions wrap/reflow;
- controls remain reachable;
- touch targets remain usable;
- composer and list remain understandable.

### 4. Settings

Show the real Settings dialog with visible areas covering as much as practical of:

- appearance/reduced motion;
- reminders;
- data/privacy export/import/delete controls;
- updates;
- About/support/funding links.

Do not trigger a destructive delete or reveal a local file path in the screenshot.

### 5. Offline PWA indicator

Capture the production PWA/app shell while browser network is disabled and the Offline indicator is visible.

Before capture verify that:

- the shell loaded from the real generated service-worker/cache path;
- existing local tasks remain available;
- this is not merely a styled mock of the Offline badge.

## Recommended additional captures

If release notes/documentation benefit from them, also consider:

### 6. Productivity statistics

Show the Statistics panel with fictional derived counts.

### 7. Archived/restore workflow

Show the Archived view with fictional tasks and Restore controls.

### 8. PWA update prompt

Capture a real waiting-service-worker state showing Update now/Later.

Only add this if a reproducible real update scenario was created. Do not fake the prompt state solely for a screenshot.

### 9. Large-list progressive rendering

Show a real demo dataset with the Show more control if documenting scalability/pagination behavior.

### 10. Recovery screen

Only if release documentation specifically needs it, capture the real fail-closed local-data recovery UI in a dedicated disposable profile containing synthetic malformed data.

Never corrupt real user storage for a screenshot.

## Capture consistency

For a coherent release set:

- use the same application version/build;
- use one consistent fictional demo dataset where practical;
- keep browser zoom at a documented standard for primary screenshots;
- use clean browser chrome/cropping consistently;
- avoid devtools overlays unless the screenshot is explicitly technical documentation;
- avoid cursor/tooltips covering important UI;
- ensure text is legible at repository rendering sizes.

## File naming

Use predictable lowercase descriptive names, for example:

```text
light-inbox-desktop.png
dark-filtered-desktop.png
mobile-task-list.png
settings-data-privacy.png
offline-pwa.png
```

If additional states are captured, keep names descriptive rather than numbered-only.

## Image format

PNG is preferred for UI documentation because it preserves text/interface sharpness losslessly.

Do not commit unnecessarily huge raw desktop captures if a clean crop/resolution can show the same product state clearly.

## Accessibility review before capture

A screenshot cannot prove accessibility, but do not publish a capture of a state that obviously violates the release baseline.

Before capture verify:

- visible focus when the screenshot is intended to demonstrate keyboard state;
- readable contrast;
- no clipped text at the chosen viewport;
- labels/current navigation are understandable;
- disabled/busy states are not accidentally frozen from an unfinished action.

## README integration

After real screenshots exist:

1. update the root `README.md` screenshot section;
2. link/embed only actual committed screenshot files;
3. update `docs/file-index.md` for every newly tracked image;
4. update `docs/repository-reference.md` if the screenshot set/responsibility changes materially;
5. run `npm run docs:inventory`;
6. run `npm run docs:check`;
7. run `npm run format:check`.

Because newly committed image files are tracked files, the documentation inventory intentionally requires them to be added to `docs/file-index.md`.

## Release handoff record

After capture, record in `what_changed.md`:

- exact release-candidate SHA;
- screenshot filenames;
- confirmation that fictional/demo data was used;
- confirmation that captures came from the verified real build.

## Current status

Until the required release verification/capture process is completed, this documentation file is the only intended tracked content of `docs/screenshots/`.
