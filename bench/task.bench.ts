import { test } from 'vitest';
import { calculateStats, createTask, filterAndSortTasks } from '../src/domain/task';
import type { Task, TaskFilters } from '../src/domain/types';

const now = new Date('2026-08-19T12:00:00.000Z');
const tasks: Task[] = Array.from({ length: 10_000 }, (_, index) =>
  createTask(
    {
      title: `Benchmark task ${index}`,
      notes: index % 3 === 0 ? 'searchable performance note' : '',
      project: `Project ${index % 25}`,
      tags: [`tag-${index % 20}`],
      priority: (['low', 'medium', 'high', 'urgent'] as const)[index % 4],
      dueDate: `2026-08-${String(1 + (index % 28)).padStart(2, '0')}`
    },
    now,
    index * 1000
  )
);

const filters: TaskFilters = {
  search: 'performance',
  view: 'all',
  project: '',
  tag: '',
  priority: 'all',
  sort: 'priority-desc'
};

test('10k task filtering and sorting', async ({ bench }) => {
  await bench('filterAndSortTasks', () => {
    filterAndSortTasks(tasks, filters, now);
  }).run();
});

test('10k task statistics', async ({ bench }) => {
  await bench('calculateStats', () => {
    calculateStats(tasks, now);
  }).run();
});
