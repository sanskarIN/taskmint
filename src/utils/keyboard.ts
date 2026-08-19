export type GlobalShortcut = 'search' | 'new-task' | null;

export interface ShortcutInput {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  editableTarget: boolean;
  blocked: boolean;
}

export function resolveGlobalShortcut(input: ShortcutInput): GlobalShortcut {
  if (input.blocked || input.altKey) return null;
  const key = input.key.toLocaleLowerCase();

  if ((input.ctrlKey || input.metaKey) && !input.shiftKey && key === 'k') return 'search';
  if (!input.ctrlKey && !input.metaKey && !input.shiftKey && !input.editableTarget && key === 'n') {
    return 'new-task';
  }
  return null;
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  );
}
