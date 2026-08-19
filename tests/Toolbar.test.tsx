import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toolbar } from '../src/components/Toolbar';
import { strings } from '../src/i18n/en';

describe('Toolbar', () => {
  it('exposes search and filters as a named accessibility group', () => {
    render(
      <Toolbar
        search=""
        priority="all"
        tag=""
        sort="manual"
        tags={['release']}
        onSearch={vi.fn()}
        onPriority={vi.fn()}
        onTag={vi.fn()}
        onSort={vi.fn()}
      />
    );

    expect(screen.getByRole('group', { name: strings.searchFiltersLabel })).toBeDefined();
    expect(screen.getByRole('searchbox', { name: strings.search }).getAttribute('aria-keyshortcuts')).toBe(
      'Control+K Meta+K'
    );
  });

  it('preserves filter callbacks', () => {
    const onPriority = vi.fn();
    const onTag = vi.fn();
    const onSort = vi.fn();
    render(
      <Toolbar
        search=""
        priority="all"
        tag=""
        sort="manual"
        tags={['release']}
        onSearch={vi.fn()}
        onPriority={onPriority}
        onTag={onTag}
        onSort={onSort}
      />
    );

    fireEvent.change(screen.getByLabelText(strings.priority), { target: { value: 'urgent' } });
    fireEvent.change(screen.getByLabelText(strings.tag), { target: { value: 'release' } });
    fireEvent.change(screen.getByLabelText(strings.sort), { target: { value: 'title-asc' } });

    expect(onPriority).toHaveBeenCalledWith('urgent');
    expect(onTag).toHaveBeenCalledWith('release');
    expect(onSort).toHaveBeenCalledWith('title-asc');
  });
});
