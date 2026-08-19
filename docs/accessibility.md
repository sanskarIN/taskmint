# Accessibility

TaskMint targets WCAG-oriented baseline practices rather than treating accessibility as a later visual pass.

## Implemented baseline

- Native buttons, inputs, selects, textareas, and headings.
- Visible keyboard focus using `:focus-visible`.
- Move up/down controls provide a keyboard alternative to drag-and-drop.
- Task priorities are written as text and not represented only by color.
- Status toasts use a polite live region.
- Input labels are visible or screen-reader-only as appropriate.
- Touch targets are generally at least 40px high.
- Layout reflows for tablet and phone widths.
- Light/dark themes use centralized contrast-conscious tokens.
- Reduced-motion preference is available in Settings.
- Error and offline states use text, not color alone.

## Manual release review

Before release, navigate the full primary workflow without a mouse, verify zoom/reflow at 200%, check screen-reader labels for task controls, and test reduced motion plus both color themes.
