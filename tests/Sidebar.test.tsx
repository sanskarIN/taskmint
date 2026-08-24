import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from '../src/components/Sidebar';
import { strings } from '../src/i18n/en';

describe('Sidebar', () => {
  it('exposes the active smart view with aria-current', () => {
    render(
      <Sidebar
        activeView="today"
        projects={[]}
        activeProject=""
        onView={vi.fn()}
        onProject={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: strings.viewToday }).getAttribute('aria-current')).toBe(
      'page'
    );
    expect(screen.getByRole('button', { name: strings.viewInbox }).hasAttribute('aria-current')).toBe(
      false
    );
  });

  it('exposes the active project with aria-current and preserves project selection behavior', () => {
    const onProject = vi.fn();
    render(
      <Sidebar
        activeView="inbox"
        projects={['TaskMint', 'Docs']}
        activeProject="TaskMint"
        onView={vi.fn()}
        onProject={onProject}
      />
    );

    const taskMint = screen.getByRole('button', { name: 'TaskMint' });
    const docs = screen.getByRole('button', { name: 'Docs' });
    expect(taskMint.getAttribute('aria-current')).toBe('page');
    expect(docs.hasAttribute('aria-current')).toBe(false);
    expect(screen.getByRole('button', { name: strings.viewInbox }).hasAttribute('aria-current')).toBe(false);

    fireEvent.click(docs);
    expect(onProject).toHaveBeenCalledWith('Docs');
  });

  it('keeps smart-view and project selectors inside the navigation landmark', () => {
    render(
      <Sidebar
        activeView="inbox"
        projects={['TaskMint']}
        activeProject=""
        onView={vi.fn()}
        onProject={vi.fn()}
      />
    );

    const navigation = screen.getByRole('navigation');
    expect(navigation.contains(screen.getByRole('button', { name: strings.viewInbox }))).toBe(true);
    expect(navigation.contains(screen.getByRole('button', { name: 'TaskMint' }))).toBe(true);
  });
});
