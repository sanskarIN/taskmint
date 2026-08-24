# TaskMint Performance Guide

TaskMint is designed to keep normal operations local, bounded, and understandable. Correctness, accessibility, and data safety take precedence over speculative micro-optimization.

## 1. Current performance principles

- No TaskMint application API request is required for ordinary task CRUD after the PWA shell is available.
- Avoid adding large UI/runtime frameworks for isolated controls without measured value.
- Keep production bundle growth reviewable.
- Avoid synchronous storage work inside render paths.
- Keep mounted task cards bounded even when imported/local datasets are large.
- Keep task-order arithmetic safe and iterative at the 100,000-task import boundary.
- Keep reminder delivery bounded so a large due set cannot produce an unbounded notification burst.
- Treat benchmarks as repeatable diagnostics, not universal wall-clock pass/fail thresholds.
- Prefer simple O(n) in-memory derivation until measurement proves indexed queries/workers/virtualization are needed.

## 2. Current in-memory model

TaskMint currently loads validated tasks through the repository and derives views/statistics in memory.

Important distinction: IndexedDB schema defines useful indexes, but current UI filtering/statistics primarily operate on the in-memory task set rather than querying each smart view through IndexedDB indexes.

Do not describe the mere presence of an IndexedDB index as proof that every UI query uses that index.

## 3. Memoized derivation

`App.tsx` memoizes major derived values such as:

- filtered/sorted visible task set;
- rendered page slice;
- productivity statistics;
- project list;
- tag list.

These recompute when their logical dependencies change.

## 4. Progressive task rendering

Matching tasks are progressively mounted in pages of 100 cards.

Behavior:

- full filtered count remains visible;
- first 100 cards mount initially;
- user chooses Show more for additional pages;
- search/filter/sort changes reset the page limit.

This bounds React component/DOM work without changing the underlying filtered data result.

`e2e/pagination.spec.ts` protects the 101-task boundary behavior.

## 5. Reordering and visible scope

Keyboard and drag reordering operate on currently rendered eligible active task slots in Manual mode.

This avoids unexpectedly reordering hidden progressive-page entries or tasks outside the current rendered/action scope.

Manual-order comparison/allocation is centralized in `src/domain/order.ts`.

## 6. Safe large-order allocation

Task order allocation is iterative and safe-integer checked.

The implementation avoids spreading a huge order array into `Math.max(...)`, which could create argument-count/stack limitations at large import sizes.

`tests/order.test.ts` exercises 100,000 order entries and overflow rejection.

## 7. Duplicate order normalization

Persisted/restored duplicate safe order slots are normalized only when duplicates exist.

Already unique arrays can remain unchanged, avoiding unnecessary rewriting/work while preserving deterministic visible ordering for tied legacy/corrupt-but-safe slots.

## 8. New-order collision prevention

Performance shortcuts must not create ordering correctness problems.

Current App/domain behavior allocates collision-free order slots for:

- new ordinary tasks;
- generated next recurring occurrence;
- CSV append imports.

Do not replace those scans/allocations with an assumption that `Date.now()` is always unique against arbitrary imported/persisted data.

## 9. Persistence batching

Multi-task persistence uses explicit Dexie transactions.

This may have a small coordination cost compared with independent writes, but it prevents partial-success state for operations such as:

- reorder;
- CSV import;
- recurring completion with a next occurrence.

Data integrity is the priority.

## 10. Application-wide mutation serialization

TaskMint serializes user-triggered persistence-sensitive task writes through an App-wide exclusive gate.

This deliberately reduces write concurrency.

Why it is acceptable:

- human task actions are low-frequency relative to CPU/network workloads;
- IndexedDB writes are local;
- avoiding stale-snapshot recurrence/reorder races is more valuable than parallelizing clicks from different cards;
- UI exposes pending disabled/busy state.

If future measured use cases require higher write concurrency, redesign around explicit per-record/version conflict semantics rather than simply removing the gate.

## 11. CSV parsing limits

A CSV import is bounded by:

- total input-size limit;
- nonblank task-record count limit;
- per-task field/tag limits.

Blank records do not count as tasks but still contribute to total file/input size.

CSV parser work is necessarily proportional to the input text. Avoid adding repeated whole-input passes without measurement/security need.

## 12. JSON validation

Backup validation scans tasks to:

- validate every record;
- enforce limits;
- detect duplicate IDs;
- normalize duplicate order slots when needed.

This work is intentional before destructive restore persistence begins.

For local-first backup restore, correctness/preflight safety takes precedence over shaving one validation pass.

## 13. Reminder polling

Reminder checks are periodic while the app is open.

Delivery is bounded per pass to:

- at most a small fixed number of individual title-bearing notifications;
- one count-only summary for excess due reminders.

This limits notification/API/UI disruption when a large imported set becomes due simultaneously.

## 14. Date-sensitive refresh

TaskMint updates its current time periodically and on focus/visibility changes so smart views/statistics remain correct across date rollover.

The one-minute refresh interval is deliberately coarse enough for task/day semantics while avoiding high-frequency render churn.

## 15. PWA caching

Service-worker precaching reduces repeat application asset downloads.

Update activation remains explicit; performance is not used as a reason to auto-reload over unsaved input.

Production PWA behavior should be evaluated against built/previewed output.

## 16. Production build settings

Current Vite build includes:

- ES2022 target;
- source maps;
- CSS code splitting.

Review bundle size/build output during significant dependency/UI changes.

Do not add a dependency solely for trivial utility behavior when native/simple code is clearer and smaller.

## 17. Repeatable domain benchmark

`bench/task.bench.ts` uses Vitest 4's top-level `bench()` API with deterministic 10,000-task data.

Current measured domain hot paths include:

- `filterAndSortTasks(...)`;
- `calculateStats(...)`.

Run:

```bash
npm run bench
```

## 18. How to compare benchmark results

For meaningful comparisons:

- use same machine when possible;
- use same Node/runtime version;
- close unrelated heavy workloads;
- run multiple samples;
- compare medians/distributions rather than one outlier;
- record before/after source SHA;
- report dataset/filters used;
- do not claim universal performance from one workstation.

## 19. Why benchmark is non-gating

CI runners differ in:

- CPU generation/share;
- noisy-neighbor load;
- virtualization;
- memory pressure;
- runtime scheduling.

A fixed millisecond threshold could fail healthy code or bless regressions on faster hardware.

Performance should become gating only with a controlled methodology and documented acceptable variance.

## 20. Large-list validation strategy

For deeper performance work, measure at:

- 1,000 tasks;
- 10,000 tasks;
- 50,000 tasks;
- 100,000 tasks.

Measure separately:

- filtering/sorting latency;
- statistics latency;
- React render/interaction latency;
- memory;
- IndexedDB load;
- CSV parse/import;
- JSON validate/restore;
- reorder operations;
- application startup.

The 100,000-task import cap is an abuse/corruption boundary, not a promise that every device provides identical interactive performance at 100,000 records.

## 21. When to consider indexed queries

Move more view/filter work into indexed repository queries only if measurement shows in-memory derivation is the bottleneck and the added persistence/query complexity is justified.

Consider impacts on:

- deterministic sorting;
- combined search/tag/project/priority filters;
- date rollover;
- tests;
- migration/index compatibility;
- offline behavior.

## 22. When to consider virtualization

If progressive 100-card rendering becomes insufficient, evaluate accessible virtualization.

Any replacement must preserve:

- keyboard navigation;
- focus stability;
- task counts;
- Show-more/discovery alternative if needed;
- screen-reader semantics;
- reorder behavior;
- deterministic testing.

Do not adopt virtualization solely because a library exists.

## 23. When to consider a worker

A Web Worker may be appropriate if measured CPU-heavy filtering/import processing causes main-thread interaction delays at realistic upper datasets.

A worker adds message serialization, lifecycle/error handling, and test complexity, so it should solve a measured problem.

## 24. Performance regression checklist

For a change affecting hot paths:

1. run correctness tests first;
2. run benchmark before/after on same environment;
3. test large-list browser interaction;
4. inspect bundle change if dependency/UI code changed;
5. verify no accessibility regression;
6. verify persistence/data safety remains intact;
7. document meaningful performance tradeoffs in PR/change notes.

## 25. Related documentation

- `architecture.md`
- `data-model.md`
- `testing.md`
- `test-matrix.md`
- `development.md`
- `repository-reference.md`
