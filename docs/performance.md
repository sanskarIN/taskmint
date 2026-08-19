# Performance

TaskMint is designed to keep normal operations local and inexpensive.

## Current budgets

- No application network request is required for task CRUD after the PWA shell is cached.
- Avoid adding large UI frameworks for isolated controls.
- Keep production JavaScript small enough that bundle growth is reviewed in pull requests.
- Avoid synchronous storage loops in render paths.
- Keep the number of rendered task cards bounded even when imports contain very large datasets.

## Current design choices

- Task filtering/statistics are memoized from in-memory data.
- Matching task results are progressively rendered in pages of 100 cards instead of mounting the entire result set at once.
- Changing search/filter/sort criteria resets the rendered page to the first 100 matches.
- The full matching task count remains visible even when only the current page is mounted.
- Keyboard and drag reordering operate only on the currently rendered page so hidden page entries are not unexpectedly reordered.
- IndexedDB indexes support primary status/date/project/tag lookups and migrations are explicit.
- Persistence uses bulk operations for reorder/import paths.
- Service-worker caching reduces repeat asset downloads.

## Large-list validation

`e2e/pagination.spec.ts` seeds 101 tasks directly into the browser's TaskMint IndexedDB store and verifies that only 100 task cards are initially mounted, that the remaining-count control is visible, and that the final task is mounted only after explicit progressive loading.

For deeper performance work, benchmark at 1,000, 10,000, 50,000, and 100,000 tasks and measure filtering latency, statistics latency, memory, IndexedDB import/restore time, and interaction responsiveness. If measurement shows filtering itself becoming a bottleneck, the next optimization should move queries toward indexed repository lookups or a worker rather than increasing the mounted-card count.

The JSON/CSV import guard caps a single import at 100,000 tasks as an abuse/corruption boundary, not as a promise that every device can interact with 100,000 records at identical speed.
