import { describe, expect, it } from 'vitest';
import {
  compareTaskOrder,
  nextTaskOrder,
  normalizeDuplicateTaskOrders
} from '../src/domain/order';
import { createTask, filterAndSortTasks, reorderVisibleTasks } from '../src/domain/task';
import type { TaskFilters } from '../src/domain/types';

const manualFilters: TaskFilters = {
  search: '',
  view: 'all',
  project: '',
  tag: '',
  priority: 'all',
  sort: 'manual'
};

describe('task order allocation', () => {
  it('allocates the first order from the configured step', () => {
    expect(nextTaskOrder([])).toBe(1000);
  });

  it('uses the highest existing order without relying on argument spreading', () => {
    const tasks = Array.from({ length: 100_000 }, (_, index) => ({ order: index * 1000 }));
    expect(nextTaskOrder(tasks)).toBe(100_000_000);
  });

  it('supports a custom positive order step', () => {
    expect(nextTaskOrder([{ order: 10 }, { order: 50 }, { order: 20 }], 25)).toBe(75);
  });

  it('breaks equal order values deterministically by task id', () => {
    expect(compareTaskOrder({ id: 'b', order: 1000 }, { id: 'a', order: 1000 })).toBeGreaterThan(0);
    expect(compareTaskOrder({ id: 'a', order: 1000 }, { id: 'b', order: 1000 })).toBeLessThan(0);
  });

  it('uses the same deterministic tie-break in manual list sorting', () => {
    const now = new Date('2026-08-19T06:00:00.000Z');
    const first = { ...createTask({ title: 'First' }, now, 1000), id: 'b' };
    const second = { ...createTask({ title: 'Second' }, now, 1000), id: 'a' };

    expect(filterAndSortTasks([first, second], manualFilters, now).map((task) => task.id)).toEqual([
      'a',
      'b'
    ]);
  });

  it('normalizes duplicate numeric slots while preserving deterministic visible order', () => {
    const now = new Date('2026-08-19T06:00:00.000Z');
    const tasks = [
      { ...createTask({ title: 'B' }, now, 1000), id: 'b' },
      { ...createTask({ title: 'A' }, now, 1000), id: 'a' },
      { ...createTask({ title: 'C' }, now, 3000), id: 'c' }
    ];

    const normalized = normalizeDuplicateTaskOrders(tasks);
    expect([...normalized].sort(compareTaskOrder).map((task) => task.id)).toEqual(['a', 'b', 'c']);
    expect(new Set(normalized.map((task) => task.order)).size).toBe(normalized.length);
    expect(reorderVisibleTasks(normalized, 'b', 'a')).not.toHaveLength(0);
  });

  it('leaves already unique task orders untouched', () => {
    const tasks = [createTask({ title: 'One' }, new Date(), 1000), createTask({ title: 'Two' }, new Date(), 2000)];
    expect(normalizeDuplicateTaskOrders(tasks)).toBe(tasks);
  });
});
