# Accessibility

TaskMint targets WCAG-oriented baseline practices rather than treating accessibility as a later visual pass.

## Implemented baseline

- Native buttons, inputs, selects, textareas, and headings.
- Visible keyboard focus using `:focus-visible`.
- Move up/down controls provide a keyboard alternative to drag-and-drop and appear only when manual ordering is active.
- Task priorities are written as text and not represented only by color.
- Status toasts use a polite live region.
- Input labels are visible or screen-reader-only as appropriate.
- Touch targets are generally at least 40px high.
- Layout reflows for tablet and phone widths.
- Light/dark themes use centralized contrast-conscious tokens.
- Reduced-motion preference is available in Settings.
- Error and offline states use text, not color alone.
- Onboarding keeps keyboard focus on its only action while the modal is active.
- Settings moves focus into the dialog, traps Tab/Shift+Tab within dialog controls, closes on Escape, and restores the previously focused control on close.
- Hidden file inputs are removed from the normal tab order while their visible trigger buttons remain keyboard accessible.

## Manual release review

Before release, navigate the full primary workflow without a mouse, verify zoom/reflow at 200%, check screen-reader labels for task controls, test focus restoration around Settings, and test reduced motion plus both color themes.
