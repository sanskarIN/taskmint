# TaskMint Accessibility Guide

TaskMint treats accessibility as a product/architecture constraint rather than a final visual pass. This document describes the current implemented baseline, component semantics, keyboard model, pending-operation behavior, and release review expectations.

Automated coverage exists, but manual review remains required.

## 1. Semantic structure

TaskMint uses native semantic elements wherever practical:

- headings;
- buttons;
- inputs;
- selects;
- textareas;
- forms;
- navigation;
- main regions;
- lists/list items;
- dialogs.

Native controls are preferred over custom role reimplementations because browser keyboard/accessibility behavior is more predictable.

## 2. Sidebar navigation

The Sidebar contains both smart-view and project selectors inside a navigation landmark.

Current selection is exposed with:

```text
aria-current="page"
```

Rules:

- active smart view is current when no project selection is active;
- active project is current when a project is selected;
- the previously selected smart view is not simultaneously announced as current during project navigation.

Regression: `tests/Sidebar.test.tsx`.

## 3. Search/filter semantics

Toolbar search/filter controls are wrapped in a named group:

```text
role="group"
aria-label=<search/filter label>
```

This gives assistive technology a meaningful relationship among Search, Priority, Tag, and Sort controls.

The search input exposes shortcut metadata through `aria-keyshortcuts`.

Regression: `tests/Toolbar.test.tsx`.

## 4. Task form labels

TaskComposer uses visible or screen-reader-only labels for task fields as appropriate.

The task title input:

- has a programmatic label;
- exposes the `N` shortcut through `aria-keyshortcuts`;
- uses native required/maxlength behavior in addition to domain validation.

Tag help is connected with `aria-describedby`.

## 5. Pending-operation semantics

Asynchronous mutation safety is also an accessibility concern: controls should communicate that an operation cannot currently accept another action.

### TaskComposer

During local submit or App-wide task mutation blocking:

- inputs/buttons are disabled;
- form uses `aria-busy` for its own active submission;
- external disabled state is exposed through `aria-disabled`.

### TaskItem

During local row mutation:

- row exposes `aria-busy`;
- action buttons disable;
- drag is disabled.

During App-wide task mutation blocking:

- row exposes external `aria-disabled` state;
- all row actions/drag are unavailable.

### Task list

App marks the task list busy while the application-wide task mutation gate is active.

### Settings / onboarding / PWA update

These flows expose busy/disabled states while their serialized asynchronous action is pending.

## 6. Keyboard ordering

Drag-and-drop is never the only reordering mechanism.

When Manual sort is active, eligible active tasks expose:

- Move up;
- Move down.

Manual ordering uses the same deterministic comparator as list rendering and drag reorder. Persisted duplicate order slots are normalized so keyboard moves remain meaningful rather than becoming no-ops.

## 7. Global shortcuts

Supported shortcuts:

| Shortcut | Action |
| --- | --- |
| `Ctrl+K` / `Cmd+K` | Focus/select task search |
| `N` | Focus task title for new task |

Shortcut behavior is guarded so it does not steal typing/context when:

- focus is in an editable control;
- onboarding is open;
- Settings is open;
- an App-wide task mutation is pending;
- the modifier combination is not supported.

`N` also respects an active task edit state.

Pure resolver coverage: `tests/keyboard.test.ts`.

Browser focus coverage: `e2e/keyboard.spec.ts`.

## 8. Modal focus management

### Onboarding

Onboarding is modal and keeps keyboard focus on its available action while active.

Repeated completion activation is locked while persistence is pending.

### Settings

When Settings opens:

- prior focused element is remembered;
- focus moves into the dialog;
- Tab/Shift+Tab remain inside focusable dialog controls;
- Escape closes when idle;
- close/backdrop dismissal is blocked while a settings/data action is pending;
- focus returns to the prior element on close.

Hidden file inputs are removed from normal tab order; visible import buttons remain keyboard accessible.

Selected import values are reset immediately after file capture, supporting reliable same-file retry without changing keyboard entry points.

## 9. Current-navigation and state communication

TaskMint avoids color-only state where important.

Examples:

- priority badges contain text labels;
- active navigation uses both visual styling and `aria-current`;
- Offline state has text;
- form/import/persistence errors contain text;
- completed state has visible check/text treatment;
- busy states disable controls and use ARIA state where appropriate.

## 10. Live/status messages

Transient task/status feedback uses a polite live region.

The PWA update prompt also uses polite announcement semantics and has an accessible label.

Error messages that require stronger attention use alert semantics where implemented by the form/dialog.

## 11. Progressive rendering

Large task sets mount in bounded pages.

The load-more control is a normal button and uses `aria-controls` pointing to the task list.

The full matching task count remains visible even when only the current rendered page is mounted.

Progressive rendering should not be replaced with inaccessible scroll-only discovery.

## 12. Focus visibility

Global styles use `:focus-visible` so keyboard focus has a visible indicator.

Any design refresh must manually verify focus on:

- topbar actions;
- Sidebar navigation;
- task composer fields;
- filter controls;
- task card actions;
- load-more;
- toast Undo;
- Settings controls;
- update prompt.

## 13. Touch targets

Primary task/action controls are designed around a documented ~40px-or-larger baseline, including the complete/reopen control and responsive/mobile action controls.

Touch target review should include spacing: a large target that overlaps or is too tightly packed can still be hard to use.

## 14. Responsive reflow

Layouts reflow for tablet/phone widths.

Manual release review must test at 200% browser zoom and narrow viewport equivalents to confirm:

- content is not clipped;
- controls remain reachable;
- task actions wrap sensibly;
- dialogs remain usable;
- horizontal scrolling is not required for ordinary primary content unless intrinsically necessary.

## 15. Theme/contrast

Light/dark/system themes are based on centralized styling tokens.

Do not rely on color alone for meaning.

Every significant palette change requires contrast/manual review for:

- body text;
- muted text;
- priority/status labels;
- links;
- focused controls;
- danger actions;
- disabled/busy controls;
- toast/dialog states.

## 16. Reduced motion

Settings includes a reduced-motion preference.

Motion-sensitive behavior should respect that preference, including scroll/transition behavior controlled by the application/styles.

Avoid introducing autoplaying or unnecessary decorative motion.

## 17. Recovery/error accessibility

If IndexedDB data cannot be validated safely, TaskMint renders a blocking recovery state with:

- clear heading;
- explanatory text;
- reload action.

Normal editor/settings actions are intentionally absent so inaccessible hidden data cannot be mixed with new writes.

Unexpected React failures use ErrorBoundary with a recovery/reload path.

## 18. PWA update accessibility

Update prompt provides explicit:

- Update now;
- Later.

It does not silently force reload.

While activation is pending:

- prompt exposes busy state;
- both update actions are disabled.

This protects both accessibility predictability and unsaved draft safety.

## 19. Automated coverage

### Component/unit

Relevant files include:

- `tests/Sidebar.test.tsx`
- `tests/Toolbar.test.tsx`
- `tests/TaskComposer.test.tsx`
- `tests/TaskItem.test.tsx`
- `tests/SettingsDialog.test.tsx`
- `tests/Onboarding.test.tsx`
- `tests/PwaUpdatePrompt.test.tsx`
- `tests/keyboard.test.ts`
- `tests/AppMutation.test.tsx`

### Browser

`e2e/accessibility.spec.ts` checks core browser semantics such as landmarks, unnamed buttons/unlabeled form controls, and shortcut metadata.

`e2e/keyboard.spec.ts` checks real focus movement.

These are smoke/regression checks, not full WCAG certification.

## 20. Manual release review

Before release, manually verify at minimum:

1. complete primary task workflow without a mouse;
2. `Ctrl/Cmd+K` and `N` in typing/non-typing contexts;
3. shortcuts while onboarding/Settings/pending task mutation are blocked correctly;
4. per-row and App-wide pending disabled/busy behavior;
5. smart-view/project current-state announcement;
6. filter group names and form labels;
7. task ordering using keyboard buttons only;
8. Settings focus trap, Escape/close behavior, and focus restoration;
9. Settings cannot be dismissed during a pending data action;
10. same-file import retry remains reachable/understandable;
11. update prompt is keyboard-operable and understandable;
12. corrupt-data recovery exposes no normal editing controls;
13. large-list Show more is announced/usable;
14. 200% zoom/reflow;
15. light/dark/system themes;
16. reduced motion;
17. visible focus everywhere;
18. touch targets at narrow/mobile layout.

When screen-reader testing is available, verify task action labels, navigation current-state, dialogs, status messages, and update/recovery states with at least one mainstream screen reader/browser combination.

## 21. Contribution rule

Any change that alters UI structure, labels, focus, asynchronous disabled state, drag/drop, keyboard behavior, responsive layout, colors, motion, or modal behavior should update tests/manual expectations and this guide when the accessibility contract changes.
