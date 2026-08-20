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

  it('honors an app-wide mutation lock across every row action', () => {
    const task = createTask({ title: 'Locked task' });
    const onToggle = vi.fn().mockResolvedValue(undefined);
    const onEdit = vi.fn();
    const onArchive = vi.fn().mockResolvedValue(undefined);
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const onMove = vi.fn().mockResolvedValue(undefined);
    const onDragStart = vi.fn();
    const onDrop = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskItem
        task={task}
        isOverdue={false}
        canReorder={true}
        disabled
        onToggle={onToggle}
        onEdit={onEdit}
        onArchive={onArchive}
        onRestore={noopAsync}
        onDelete={onDelete}
        onMove={onMove}
        onDragStart={onDragStart}
        onDrop={onDrop}
      />
    );

    const row = screen.getByRole('listitem');
    expect(row.getAttribute('aria-disabled')).toBe('true');
    expect(row.getAttribute('draggable')).toBe('false');

    const buttons = screen.getAllByRole('button') as HTMLButtonElement[];
    expect(buttons.every((button) => button.disabled)).toBe(true);

    fireEvent.drop(row);
    expect(onDrop).not.toHaveBeenCalled();
    expect(onToggle).not.toHaveBeenCalled();
    expect(onEdit).not.toHaveBeenCalled();
    expect(onArchive).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
    expect(onMove).not.toHaveBeenCalled();
    expect(onDragStart).not.toHaveBeenCalled();
  });
});
