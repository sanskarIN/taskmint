import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TaskItem } from '../src/components/TaskItem';
import { createTask } from '../src/domain/task';

function noopAsync() {
  return Promise.resolve();
}

describe('TaskItem', () => {
  it('prevents duplicate mutations while an action is pending', async () => {
    let resolveToggle: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
      resolveToggle = resolve;
    });
    const onToggle = vi.fn().mockReturnValue(pending);
    const task = createTask({ title: 'Ship TaskMint' });

    render(
      <TaskItem
        task={task}
        isOverdue={false}
        canReorder={true}
        onToggle={onToggle}
        onEdit={vi.fn()}
        onArchive={noopAsync}
        onRestore={noopAsync}
        onDelete={noopAsync}
        onMove={noopAsync}
        onDragStart={vi.fn()}
        onDrop={noopAsync}
      />
    );

    const complete = screen.getByRole('button', { name: 'Complete Ship TaskMint' });
    fireEvent.click(complete);
    fireEvent.click(complete);

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect((complete as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole('listitem').getAttribute('aria-busy')).toBe('true');

    resolveToggle?.();
    await vi.waitFor(() => {
      expect((screen.getByRole('button', { name: 'Complete Ship TaskMint' }) as HTMLButtonElement).disabled).toBe(false);
    });
  });
});
