# TaskMint User Guide

This guide documents the complete user-facing behavior of TaskMint v0.1 as implemented in the current repository. TaskMint is an offline-first browser task manager: normal task operations are local to the browser and do not require an account or backend service.

## 1. First launch

On first launch TaskMint shows an onboarding dialog that explains the local-first model and core capabilities. Choosing **Start using TaskMint** persists the onboarding-complete setting locally. If that local settings write fails, onboarding remains available and shows safe product copy rather than raw browser/IndexedDB details.

The onboarding dialog is keyboard-contained while open. The Start action is serialized, so repeated activation cannot create competing settings writes.

## 2. Main workspace

The application is organized into four primary areas:

1. **Top bar** — product identity, offline status, statistics, and Settings.
2. **Sidebar** — smart views and project navigation.
3. **Task composer and filters** — creation/editing plus search/filter/sort controls.
4. **Task list** — task cards, lifecycle actions, ordering controls, and progressive rendering.

The footer links to the source repository and project funding page.

## 3. Creating a task

Enter a title in **What needs to be done?** and choose **Add task**.

The expanded composer supports:

- title
- notes
- priority: Low, Medium, High, or Urgent
- due date
- reminder date/time
- project
- comma-separated tags
- recurrence: Never, Daily, Weekly, or Monthly

### Validation rules

TaskMint validates input before persistence. Important limits are centralized in `src/domain/limits.ts` and currently include:

- title: up to 240 characters
- notes: up to 20,000 characters
- project: up to 80 characters
- tags: up to 12 per task
- each tag: up to 32 characters

Blank/whitespace-only titles are rejected. Impossible dates and invalid reminder timestamps are rejected instead of being silently normalized by JavaScript.

Tags are trimmed, lower-cased in a locale-independent way, deduplicated, and stored canonically.

### Duplicate-submit protection

While a task save is pending, composer fields and submit/cancel controls are disabled. A synchronous submission lock prevents two rapid submit events from entering the same persistence operation.

TaskMint also has an application-wide task mutation gate. If another task mutation is already being persisted, the composer is disabled until that operation completes.

## 4. Editing a task

Choose **Edit** on an active or completed non-archived task. The composer loads the existing task values and changes its action to **Save changes**.

After a successful edit:

- IndexedDB is updated first;
- React state changes only after persistence succeeds;
- reminder notification suppression is reset only when the saved reminder actually changed;
- edit mode closes;
- stale edited values are cleared from the composer.

Choose **Cancel** to leave edit mode without saving.

## 5. Task lifecycle

### Complete

Choose the circular completion control to mark an active task complete. The task receives a completion timestamp.

For recurring tasks, completion can create the next occurrence in the same atomic persistence operation. The next occurrence receives a collision-free manual-order slot after the current maximum task order.

### Reopen

A completed task can be reopened. Its completion timestamp is cleared and it returns to active status.

### Archive

Choose **Archive** to move an active or completed task into Archived. Archived tasks retain their other task content and receive an archive timestamp.

### Restore

Choose **Restore** in the Archived view to restore the task. If the task had previously been completed it returns to Completed; otherwise it returns to Active.

### Delete and Undo

Choose **Delete** to permanently remove the task record from IndexedDB. After a successful delete, TaskMint offers an **Undo** action for a short period. Undo re-persists the deleted task before putting it back into UI state.

Task deletion and Undo are protected by the same application-wide exclusive mutation gate used for other task writes.

## 6. Recurring tasks

Recurrence options are:

- Daily
- Weekly
- Monthly

When a recurring task is completed, TaskMint creates a fresh active occurrence.

Monthly recurrence clamps to the final valid day of shorter months. For example, a task recurring monthly from January 31 advances to the final valid day of February.

If a recurring task has a reminder but no due date, the reminder itself advances according to the recurrence interval.

If a due date exists, reminder timing is carried forward by preserving the reminder's offset relative to the due date.

## 7. Smart views

The Sidebar exposes these smart views:

- **Inbox** — active tasks without a project
- **Today** — active tasks due today
- **Upcoming** — active tasks due after today
- **Overdue** — active tasks due before today
- **Completed** — completed tasks
- **Archived** — archived tasks
- **All Tasks** — all statuses

The current smart view or project is exposed with `aria-current="page"` for assistive technology.

Date-sensitive views refresh while the application remains open. TaskMint also refreshes its internal current time when the window regains focus or document visibility changes, so Today/Overdue calculations do not remain stale across a date rollover.

## 8. Projects

A task may have one project string. Existing non-empty project values are collected from tasks and shown in the Sidebar.

Selecting a project switches to the All Tasks smart-view basis while applying that exact project filter. Selecting a smart view clears the active project selection.

Projects are local task metadata; TaskMint does not create separate project records or cloud workspaces.

## 9. Tags

A task may contain multiple tags. Tags are canonicalized to lower case and deduplicated.

The Toolbar includes a tag filter generated from all tags present in local tasks.

CSV export uses a structured encoding for tags so tags containing the legacy `|` separator remain lossless. See `data-model.md` for the portability format.

## 10. Priorities

Supported priorities are:

- Low
- Medium
- High
- Urgent

Priority can be used as both a task attribute and a list filter. Priority sorting ranks Urgent highest, then High, Medium, and Low.

## 11. Search

The search box matches case-insensitively against:

- task title
- notes
- project
- tags

Use `Ctrl+K` on Windows/Linux or `Cmd+K` on macOS to focus and select search when global shortcuts are allowed.

## 12. Filters and sorting

The Toolbar supports:

- text search
- priority filter
- tag filter
- sort mode

Sort modes are:

- Manual
- Due date
- Priority
- Newest
- Title

The filters live in a named accessibility group.

## 13. Manual ordering

Manual sorting uses a safe-integer task order plus task ID as a deterministic tie-breaker.

When Manual sort is selected, active rendered tasks expose:

- drag-and-drop ordering
- Move up
- Move down

Reordering is persisted transactionally. A failed persistence operation does not update the visible React ordering.

Only currently rendered/visible active task slots participate in the row-reorder controls. This keeps behavior predictable with filters and progressive rendering.

## 14. Large task lists

TaskMint progressively renders matching tasks in pages of 100 cards. The full filtered count is still shown, but only the first page mounts initially.

When more matching tasks exist, choose the **Show more** control to reveal another page.

Changing search/filter/sort criteria resets progressive rendering to the initial page size.

## 15. Productivity statistics

Choose **Statistics** in the top bar to show local productivity metrics:

- active tasks
- completed tasks
- archived tasks
- overdue tasks
- tasks due today
- completion rate
- completed in the last seven days

Future completion timestamps are not counted in the seven-day completion metric.

Statistics are derived locally from validated task state and are not uploaded.

## 16. Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl+K` / `Cmd+K` | Focus and select Search |
| `N` | Focus the new-task title |

Global shortcuts are ignored when:

- focus is already in an editable control;
- onboarding is open;
- Settings is open;
- an application-wide task mutation is pending;
- disallowed modifier combinations are used.

If a task is already being edited, `N` does not replace that edit context with a new task.

## 17. Settings

Open **Settings** from the top bar.

Settings operations are serialized: while one Settings/data action is pending, competing controls are disabled and the dialog cannot be dismissed by Close, Escape, or backdrop interaction.

### Theme

Choose:

- System
- Light
- Dark

System follows the browser/OS `prefers-color-scheme` setting and reacts when it changes.

### Reduced motion

Enable **Reduce motion** to disable or reduce nonessential smooth motion in supported interactions.

### Browser notifications

Choose **Enable browser notifications** to explicitly request permission. TaskMint does not request notification permission automatically on first launch.

If permission is granted, the setting is stored locally.

### Data portability

Settings contains controls for:

- JSON backup
- CSV export
- JSON restore
- CSV import

Selected import input values are cleared immediately after TaskMint captures the `File` object, before asynchronous processing completes. This allows the same file to be chosen again reliably after an error or retry.

### Delete all local data

**Delete all local data** asks for confirmation before clearing TaskMint's IndexedDB tables. The UI is cleared only after the database operation succeeds.

TaskMint recommends taking a JSON backup first when the data matters.

## 18. JSON backup and restore

JSON is TaskMint's full-fidelity backup format.

A backup includes:

- schema version
- export timestamp
- application identifier
- all tasks
- optional application settings

Restore input is treated as untrusted. TaskMint validates and normalizes the complete backup before opening the destructive transaction that clears/replaces local data.

If existing tasks are present, the UI asks for confirmation before replacement.

Malformed backup data is rejected without clearing current task data.

See `data-model.md` for the exact schema and validation invariants.

## 19. CSV export and import

CSV is intended for human-readable interchange rather than complete archival fidelity.

The required task columns are:

- `title`
- `notes`
- `priority`
- `dueDate`
- `reminderAt`
- `tags`
- `project`
- `recurrence`
- `status`

New TaskMint exports also add:

- `taskmintEncoding=safe-text-v1`

### Spreadsheet-formula protection

User-controlled title, notes, and project fields beginning with spreadsheet formula prefixes are exported with reversible neutralization. This also covers prefixes after leading spaces, tabs, or newlines.

### Tags

New encoded CSV uses `json:` followed by a JSON array for tags. Legacy unmarked CSV continues to accept pipe-separated tag cells.

TaskMint never interprets a legacy unmarked `json:` prefix as structured tags.

### Strict parsing

CSV import rejects:

- missing required columns
- duplicate columns
- unsupported non-empty TaskMint encoding versions
- invalid priority/recurrence/status values
- impossible dates/timestamps
- malformed structured tags
- quote characters in invalid positions
- unterminated quoted fields
- oversized input
- too many nonblank task records

Blank logical records do not count toward the task-count limit, but the independent file-size limit still bounds the total input.

CSV error row numbers refer to the original logical source record even when earlier records are blank.

### Merge ordering

CSV import appends tasks rather than replacing existing tasks. Imported manual-order values are rebased after the current maximum local order and assigned contiguously, preventing valid merges from introducing duplicate order slots.

## 20. Reminders and notification privacy

TaskMint reminders use the browser Notification API.

Important limitation: browsers do not provide a reliable cross-platform local background scheduler for a closed PWA. TaskMint therefore checks due reminders while the application is open.

To avoid notification floods and excessive title exposure, each polling pass is bounded:

- only a small fixed number of due tasks receive individual title-bearing notifications;
- additional due reminders are summarized in one title-free count notification;
- failed individual/summary delivery remains eligible for retry.

## 21. Offline behavior

Task data lives in IndexedDB. Normal task actions do not require network access.

After the PWA shell has been cached by the generated service worker, the installed/app shell is designed to remain available offline.

The top bar displays an **Offline** badge when `navigator.onLine` is false.

Production service-worker behavior should be tested against `npm run build` + `npm run preview`, not the development server.

## 22. PWA updates

TaskMint intentionally uses a prompt-based service-worker update flow rather than automatic reload.

When a new service worker is waiting, TaskMint displays an update prompt with:

- Update now
- Later

Choosing Update now activates the waiting service worker via `updateServiceWorker(true)`.

The update action is serialized so repeated clicks cannot trigger competing activations. While activation is pending, both update controls are disabled.

This design protects unsaved task-composer input from an automatic service-worker reload.

## 23. Local-data corruption recovery

Persisted browser data is not trusted merely because it is local.

On startup TaskMint validates stored tasks and settings. If current IndexedDB records cannot be validated safely:

- the normal editor does not render;
- Settings/task actions are not exposed;
- existing browser data is left untouched;
- a recovery message and reload path are shown.

TaskMint does not silently delete or rewrite malformed records during this failure state.

## 24. Accessibility

TaskMint's accessibility baseline includes:

- semantic headings, forms, navigation, lists, and controls
- visible focus styles
- labels for form controls
- named action groups
- `aria-current` for active navigation
- `aria-busy` for pending operations
- `aria-keyshortcuts` metadata
- keyboard ordering controls as an alternative to drag-and-drop
- reduced-motion support
- non-color-only priority labels
- touch-friendly action targets
- focus trapping/restoration for modal experiences
- status/update announcements

See `accessibility.md` for implementation and manual verification guidance.

## 25. Privacy model

TaskMint has no required account, backend, analytics service, or cloud synchronization.

Normal task content remains in browser storage. Export/import occurs only when the user explicitly chooses it.

Development diagnostic helpers are designed to fail closed: arbitrary strings, nested structures, unsafe identifier values, sensitive-key metadata, and raw exception messages are not intentionally emitted.

See `../PRIVACY.md` and `../SECURITY.md`.

## 26. Limits and unsupported expectations

TaskMint v0.1 does not promise:

- cloud synchronization
- multi-user collaboration
- background reminders while every TaskMint window/PWA instance is closed
- server-side backup
- account recovery
- mobile-native OS integrations beyond browser/PWA capabilities
- desktop wrapper behavior

These are deliberate scope boundaries, not hidden dependencies.

## 27. Getting help

For usage help see:

- `../SUPPORT.md`
- `troubleshooting.md`

For project/development questions see:

- `development.md`
- `architecture.md`
- `repository-reference.md`

For security reports follow `../SECURITY.md` rather than opening a public issue when disclosure could put users at risk.
