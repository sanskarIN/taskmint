# Accessibility

TaskMint targets WCAG-oriented baseline practices rather than treating accessibility as a later visual pass.

## Implemented baseline

- Native buttons, inputs, selects, textareas, and headings.
- Visible keyboard focus using `:focus-visible`.
- Move up/down controls provide a keyboard alternative to drag-and-drop and appear only when manual ordering is active.
- Task priorities are written as text and not represented only by color.
- Status toasts use a polite live region.
- Input labels are visible or screen-reader-only as appropriate.
- Primary task/action controls are at least 40px high, including the complete/reopen control on desktop and mobile.
- Layout reflows for tablet and phone widths.
- Light/dark themes use centralized contrast-conscious tokens.
- Reduced-motion preference is available in Settings.
- Error and offline states use text, not color alone.
- `Ctrl+K`/`Cmd+K` focuses and selects global task search.
- `N` focuses the new-task title only when the user is not already typing in an editable control.
- Global shortcuts are disabled while onboarding or Settings is open so modal keyboard behavior wins.
- Shortcut-enabled inputs expose `aria-keyshortcuts` metadata.
- Onboarding keeps keyboard focus on its only action while the modal is active.
- Settings moves focus into the dialog, traps Tab/Shift+Tab within dialog controls, closes on Escape, and restores the previously focused control on close.
- Hidden file inputs are removed from the normal tab order while their visible trigger buttons remain keyboard accessible.
- Progressive large-list loading uses a normal button with `aria-controls` pointing at the task list.

## Manual release review

Before release, navigate the full primary workflow without a mouse, verify `Ctrl/Cmd+K` and `N` in both typing and non-typing contexts, verify zoom/reflow at 200%, check screen-reader labels for task controls, test focus restoration around Settings, confirm the large-list load-more control is announced clearly, and test reduced motion plus both color themes.
