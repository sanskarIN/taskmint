import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  addRecurrence,
  calculateStats,
  completeTask,
  createTask,
  filterAndSortTasks,
  reorderVisibleTasks
} from '../src/domain/task';
import { TASK_LIMITS } from '../src/domain/limits';
import type { TaskFilters } from '../src/domain/types';

const filters: TaskFilters = {
  search: '',
  view: 'all',
  project: '',
  tag: '',
  priority: 'all',
  sort: 'manual'
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('task domain', () => {
  it('normalizes task input', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'task-1' });
    const task = createTask(
      { title: '  Write   report  ', tags: [' Work ', 'work', 'Deep'] },
      new Date('2026-08-19T08:00:00Z'),
      10
    );
    expect(task.title).toBe('Write report');
    expect(task.tags).toEqual(['work', 'deep']);
    expect(task.status).toBe('active');
  });

  it('normalizes stored tags without depending on the host locale', () => {
    const localeLowercase = vi
      .spyOn(String.prototype, 'toLocaleLowerCase')
      .mockImplementation(() => 'locale-specific-value');
    const task = createTask({ title: 'Locale-safe tags', tags: ['WORK', 'Deep'] });
    expect(task.tags).toEqual(['work', 'deep']);
    expect(localeLowercase).not.toHaveBeenCalled();
  });

  it('clamps monthly recurrence to month end', () => {
    const next = addRecurrence(new Date(2026, 0, 31, 12), 'monthly');
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(1);
    expect(next.getDate()).toBe(28);
  });

  it('creates a next occurrence when completing a recurring task', () => {
    const original = createTask(
      { title: 'Weekly review', dueDate: '2026-08-19', recurrence: 'weekly' },
      new Date('2026-08-18T08:00:00Z'),
      20
    );
    const result = completeTask(original, new Date('2026-08-19T09:00:00Z'));
    expect(result.completed.status).toBe('completed');
    expect(result.next?.status).toBe('active');
    expect(result.next?.dueDate).toBe('2026-08-26');
  });

  it('rejects impossible calendar dates instead of dropping them silently', () => {
    expect(() => createTask({ title: 'Calendar edge', dueDate: '2026-02-31' })).toThrow(
      /due date is invalid/i
    );
  });

  it('rejects oversized task content instead of truncating it', () => {
    expect(() =>
      createTask({ title: 'Long notes', notes: 'x'.repeat(TASK_LIMITS.notes + 1) })
    ).toThrow(/notes/i);
    expect(() =>
      createTask({
        title: 'Too many tags',
        tags: Array.from({ length: TASK_LIMITS.tags + 1 }, (_, index) => `tag-${index}`)
      })
    ).toThrow(/at most/i);
    expect(() =>
      createTask({ title: 'Long tag', tags: ['x'.repeat(TASK_LIMITS.tag + 1)] })
    ).toThrow(/each tag/i);
  });

  it('carries recurring reminders forward without a due date', () => {
    const now = new Date('2026-08-19T10:00:00.000Z');
    const original = createTask(
      {
        title: 'Daily reminder',
        reminderAt: '2026-08-19T09:30:00.000Z',
        recurrence: 'daily'
      },
      now,
      20
    );
    const result = completeTask(original, now);
    expect(result.next?.reminderAt).toBe('2026-08-20T09:30:00.000Z');
    expect(result.next?.order).toBe(now.getTime());
  });

  it('reorders only the supplied visible task slots', () => {
    const now = new Date('2026-08-19T12:00:00.000Z');
    const first = createTask({ title: 'First' }, now, 1000);
    const second = createTask({ title: 'Second' }, now, 3000);
    const third = createTask({ title: 'Third' }, now, 5000);
    const changed = reorderVisibleTasks([first, second, third], third.id, first.id, now);
    const byId = new Map(changed.map((task) => [task.id, task]));
    expect(byId.get(third.id)?.order).toBe(1000);
    expect(byId.get(first.id)?.order).toBe(3000);
    expect(byId.get(second.id)?.order).toBe(5000);
    expect(changed.every((task) => task.updatedAt === now.toISOString())).toBe(true);
  });

  it('filters by smart view and computes useful statistics', () => {
    const now = new Date(2026, 7, 19, 12);
    const dueToday = createTask({ title: 'Today', dueDate: '2026-08-19' }, now, 10);
    const overdue = createTask({ title: 'Late', dueDate: '2026-08-18' }, now, 20);
    const finished = {
      ...createTask({ title: 'Done' }, now, 30),
      status: 'completed' as const,
      completedAt: now.toISOString()
    };
    expect(
      filterAndSortTasks([dueToday, overdue, finished], { ...filters, view: 'overdue' }, now).map(
        (task) => task.title
      )
    ).toEqual(['Late']);
    expect(calculateStats([dueToday, overdue, finished], now)).toMatchObject({
      active: 2,
      completed: 1,
      overdue: 1,
      dueToday: 1,
      completionRate: 33
    });
  });
});
