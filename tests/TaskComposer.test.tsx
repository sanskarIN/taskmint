import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TaskComposer } from '../src/components/TaskComposer';

describe('TaskComposer', () => {
  it('submits a simple task through an accessible form', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskComposer onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), { target: { value: 'Read docs' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ title: 'Read docs', priority: 'medium', recurrence: 'none' });
  });
});
