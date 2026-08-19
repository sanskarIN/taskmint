import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TaskComposer } from '../src/components/TaskComposer';
import { createTask } from '../src/domain/task';

describe('TaskComposer', () => {
  it('submits a simple task through an accessible form', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskComposer onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: 'Read docs' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      title: 'Read docs',
      priority: 'medium',
      recurrence: 'none'
    });
  });

  it('serializes submissions while a save is pending', async () => {
    let resolveSubmit: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });
    const onSubmit = vi.fn().mockReturnValue(pending);
    render(<TaskComposer onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: 'Only once' }
    });
    const form = screen.getByRole('form', { name: 'Add task' });
    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect((screen.getByRole('button', { name: 'Add task' }) as HTMLButtonElement).disabled).toBe(true);

    resolveSubmit?.();
    await vi.waitFor(() => {
      expect((screen.getByRole('button', { name: 'Add task' }) as HTMLButtonElement).disabled).toBe(false);
    });
  });

  it('clears stale edit values after an edit is saved', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const editingTask = createTask({ title: 'Original title', notes: 'Original notes' });
    const { rerender } = render(<TaskComposer editingTask={editingTask} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: 'Updated title' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

    rerender(<TaskComposer editingTask={null} onSubmit={onSubmit} />);
    await vi.waitFor(() => {
      const input = screen.getByPlaceholderText('What needs to be done?') as HTMLInputElement;
      expect(input.value).toBe('');
    });
    expect(screen.getByRole('button', { name: 'Add task' })).toBeDefined();
  });
});
