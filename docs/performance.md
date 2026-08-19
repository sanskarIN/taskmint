# Performance

TaskMint is designed to keep normal operations local and inexpensive.

## Current budgets

- No application network request is required for task CRUD after the PWA shell is cached.
- Avoid adding large UI frameworks for isolated controls.
- Keep production JavaScript small enough that bundle growth is reviewed in pull requests.
- Avoid synchronous storage loops in render paths.

## Current design choices

- Task filtering/statistics are memoized from in-memory data.
- IndexedDB indexes support primary status/date/project/tag lookups and migrations are explicit.
- Persistence uses bulk operations for reorder/import paths.
- Service-worker caching reduces repeat asset downloads.

## Large-list threshold

Virtualization is intentionally not included without measurement. Before adding it, benchmark at 1,000, 10,000, and 50,000 tasks and measure render latency, memory, search latency, and reorder behavior. The JSON import validator caps backups at 100,000 tasks as an abuse/corruption guard.
