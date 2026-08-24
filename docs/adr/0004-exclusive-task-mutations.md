# ADR 0004: Serialize user-visible task mutations

- Status: Accepted
- Date: 2026-08-19

## Context

TaskMint intentionally persists before updating React state. That rule prevents the UI from claiming success when IndexedDB failed, but it also means an asynchronous write can remain pending while the previous task snapshot is still rendered.

A local button disabled state alone is not sufficient. Two immediate events can occur before React commits a state update, and two different task cards can initiate operations from the same stale application snapshot.

This is especially important for:

- completing recurring tasks, where one completion can create a new occurrence;
- manual reorder operations, which calculate writes from multiple visible task slots;
- create/edit operations that allocate order values;
- delete/Undo interactions.

## Decision

Use layered synchronous mutation locks.

### Local component locks

`TaskComposer` owns a synchronous submit lock so duplicate submit events cannot enter the same create/edit persistence call.

`TaskItem` owns a synchronous row mutation lock so duplicate complete/archive/delete/reorder/drop events on the same rendered task cannot overlap.

### Application-wide task mutation gate

`App.tsx` owns a single synchronous task mutation lock implemented through `src/utils/mutation.ts`.

It serializes persistence-sensitive task operations across different components/tasks:

- create;
- edit;
- complete;
- reopen;
- archive;
- restore;
- delete;
- Undo delete;
- keyboard reorder;
- drag/drop reorder.

While the App-wide gate is held, task rows and the composer are externally disabled, task shortcuts are blocked, and Settings cannot be opened into a competing data-action flow.

### Settings/onboarding/PWA actions

Independent non-task asynchronous UI flows also use local synchronous locks where duplicate activation could cause competing operations:

- Settings/data actions;
- onboarding completion;
- PWA update activation.

## Why a synchronous ref lock

React state is used to render accessible busy/disabled feedback, but state updates are asynchronous. A mutable ref is set synchronously before awaiting persistence, closing the same-tick gap that UI state alone cannot close.

## Consequences

### Positive

- Rapid double activation cannot duplicate ordinary task writes.
- Different rows cannot race reorder or recurrence calculations from one stale snapshot.
- Recurring task completion cannot create duplicate next occurrences through competing UI actions.
- Pending operations expose clear disabled/busy semantics.
- Persistence-first state integrity is preserved without requiring optimistic rollback logic.

### Costs

- Task writes are serialized even when two operations might theoretically be independent.
- The application favors correctness and predictability over maximum write concurrency.
- New task-writing entry points must be routed through the gate.

For a local task manager, the accepted tradeoff is small: human-triggered writes are low frequency, while stale-snapshot races are correctness bugs.

## Invariants

- A lock is acquired before the asynchronous action begins.
- Lock cleanup occurs in `finally`.
- Busy UI cleanup must not strand the synchronous lock if an action fails.
- A competing operation must not enter its persistence callback.
- Component local locks do not replace the App-wide lock; they protect different scopes.
- New task mutation entry points must document whether they are covered by the App-wide gate.

## Related files

- `src/App.tsx`
- `src/utils/mutation.ts`
- `src/components/TaskComposer.tsx`
- `src/components/TaskItem.tsx`
- `src/components/SettingsDialog.tsx`
- `src/components/Onboarding.tsx`
- `src/components/PwaUpdatePrompt.tsx`
- `tests/mutation.test.ts`
- `tests/AppMutation.test.tsx`
- component lock tests.

## Documentation impact

Changes to mutation concurrency should update:

- `../architecture.md`
- `../development.md`
- `../user-guide.md`
- `../test-matrix.md`
- release/manual verification instructions.
