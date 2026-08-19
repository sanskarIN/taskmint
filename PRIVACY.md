# Privacy

TaskMint is designed to work without an account or application backend.

## Data stored locally

Task records and TaskMint settings are stored in the browser's IndexedDB database named `taskmint`. This can include task titles, notes, project names, tags, due dates, reminders, and completion/archive metadata.

TaskMint validates persisted task/settings rows before loading them into application state. If current local records cannot be validated safely, the normal editor is blocked and the existing browser data is left in place rather than being silently replaced or treated as an empty task list.

## Network behavior

The application itself does not intentionally send task content to a TaskMint server because no TaskMint server is required. Normal browser requests may still occur when you explicitly follow external links such as GitHub or Buy Me a Coffee.

The installed PWA/browser may also make ordinary application-update requests for static TaskMint assets from the site hosting the app. Task content is not intentionally attached to those requests. New service-worker versions wait for explicit activation instead of automatically reloading the current tab over unsaved task input.

## Notifications

Browser notification permission is requested only after the user selects the enable-notifications action. Reminder checks run while the application is open. Notification behavior is controlled by the browser and operating system.

For a small number of due reminders, TaskMint places the task title in each individual notification body. Depending on browser/OS notification settings, that title may appear outside the TaskMint window, including notification centers or lock-screen surfaces. Users who consider task titles sensitive should keep browser notifications disabled or configure private notification previews at the operating-system level.

If more than the individual notification batch are due at once, excess reminders are combined into one summary notification that reports only how many additional reminders are waiting; it does not include those excess task titles. A failed summary remains retryable rather than silently marking those reminders as delivered.

## Exports and deletion

Users can export JSON backups or CSV task data from Settings. Exported files may contain task titles, notes, tags, projects, dates, and other task data in readable form. Once downloaded, those files are controlled by the user's filesystem, backup/sync software, and sharing choices rather than TaskMint's IndexedDB storage controls.

New TaskMint CSV exports neutralize spreadsheet-formula prefixes in user-controlled text and mark their encoding so TaskMint can safely reverse that protection when re-importing its own export. This does not encrypt or hide the exported content.

Users can delete TaskMint's local task/settings records from Settings. Browser uninstall/site-data controls may remove cached PWA assets and IndexedDB data independently. Deleting browser-local TaskMint data does not delete previously exported JSON/CSV files.

## Logging

TaskMint's helper logger is development-only. Event metadata redacts common sensitive field names, and error logging records only a coarse error kind or stable TaskMint error code rather than arbitrary exception-message text. Production builds do not intentionally emit TaskMint diagnostic logs through that helper.

## Contact

Privacy questions: `sanskarin@outlook.in` or `supportramsandesh@gmail.com`.
