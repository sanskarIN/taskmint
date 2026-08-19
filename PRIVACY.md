# Privacy

TaskMint is designed to work without an account or application backend.

## Data stored locally

Task records and TaskMint settings are stored in the browser's IndexedDB database named `taskmint`. This can include task titles, notes, project names, tags, due dates, reminders, and completion/archive metadata.

## Network behavior

The application itself does not intentionally send task content to a TaskMint server because no TaskMint server is required. Normal browser requests may still occur when you explicitly follow external links such as GitHub or Buy Me a Coffee.

## Notifications

Browser notification permission is requested only after the user selects the enable-notifications action. Reminder checks run while the application is open. Notification behavior is controlled by the browser and operating system.

## Exports and deletion

Users can export JSON backups or CSV task data from Settings. Users can also delete TaskMint's local task/settings records from Settings. Browser uninstall/site-data controls may remove cached PWA assets and IndexedDB data independently.

## Logging

TaskMint's helper logger is development-only and redacts common fields that may contain sensitive content. Production builds do not intentionally emit TaskMint diagnostic logs through that helper.

## Contact

Privacy questions: `sanskarin@outlook.in` or `supportramsandesh@gmail.com`.
