import { describe, expect, it } from 'vitest';
import { resolveGlobalShortcut } from '../src/utils/keyboard';

const base = {
  key: '',
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  shiftKey: false,
  editableTarget: false,
  blocked: false
};

describe('global keyboard shortcuts', () => {
  it('resolves Ctrl/Cmd+K to search', () => {
    expect(resolveGlobalShortcut({ ...base, key: 'k', ctrlKey: true })).toBe('search');
    expect(resolveGlobalShortcut({ ...base, key: 'K', metaKey: true })).toBe('search');
  });

  it('resolves N to new task outside editable controls', () => {
    expect(resolveGlobalShortcut({ ...base, key: 'n' })).toBe('new-task');
  });

  it('does not steal N while the user is typing', () => {
    expect(resolveGlobalShortcut({ ...base, key: 'n', editableTarget: true })).toBeNull();
  });

  it('does not run shortcuts while a modal context blocks them', () => {
    expect(resolveGlobalShortcut({ ...base, key: 'k', ctrlKey: true, blocked: true })).toBeNull();
    expect(resolveGlobalShortcut({ ...base, key: 'n', blocked: true })).toBeNull();
  });

  it('ignores modified shortcut variants that have no binding', () => {
    expect(resolveGlobalShortcut({ ...base, key: 'n', ctrlKey: true })).toBeNull();
    expect(resolveGlobalShortcut({ ...base, key: 'k', ctrlKey: true, shiftKey: true })).toBeNull();
    expect(resolveGlobalShortcut({ ...base, key: 'k', ctrlKey: true, altKey: true })).toBeNull();
  });
});
