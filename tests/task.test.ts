import { describe, expect, it, vi } from 'vitest';
import { addRecurrence, calculateStats, completeTask, createTask, filterAndSortTasks } from '../src/domain/task';
import type { TaskFilters } from '../src/domain/types';

const filters: TaskFilters = {
  search: '', view: 'all', project: '', tag: '', priority: 'all', sort: 'manual'
};

describe('task domain', () => {
  it('normalizes task input', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'task-1' });
    const task = createTask({ title: '  Write   report  ', tags: [' Work ', 'work', 'Deep'] }, new Date('2026-08-19T08:00:00Z'), 10);
    expect(task.title).toBe('Write report');
    expect(task.tags).toEqual(['work', 'deep']);
    expect(task.status).toBe('active');
  });

  it('clamps monthly recurrence to month end', () => {
    const next = addRecurrence(new Date(2026, 0, 31, 12), 'monthly');
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(1);
    expect(next.getDate()).toBe(28);
  });

  it('creates a next occurrence when completing a recurring task', () => {
    const original = createTask({ title: 'Weekly review', dueDate: '2026-08-19', recurrence: 'weekly' }, new Date('2026-08-18T08:00:00Z'), 20);
    const result = completeTask(original, new Date('2026-08-19T09:00:00Z'));
    expect(result.completed.status).toBe('completed');
    expect(result.next?.status).toBe('active');
    expect(result.next?.dueDate).toBe('2026-08-26');
  });

  it('filters by smart view and computes useful statistics', () => {
    const now = new Date(2026, 7, 19, 12);
    const dueToday = createTask({ title: 'Today', dueDate: '2026-08-19' }, now, 10);
    const overdue = createTask({ title: 'Late', dueDate: '2026-08-18' }, now, 20);
    const finished = { ...createTask({ title: 'Done' }, now, 30), status: 'completed' as const, completedAt: now.toISOString() };
    expect(filterAndSortTasks([dueToday, overdue, finished], { ...filters, view: 'overdue' }, now).map((t) => t.title)).toEqual(['Late']);
    expect(calculateStats([dueToday, overdue, finished], now)).toMatchObject({ active: 2, completed: 1, overdue: 1, dueToday: 1, completionRate: 33 });
  });
});
