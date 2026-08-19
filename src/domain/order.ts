import { fail } from './errors';
import type { Task } from './types';

export function compareTaskOrder(
  first: Pick<Task, 'id' | 'order'>,
  second: Pick<Task, 'id' | 'order'>
): number {
  return first.order - second.order || first.id.localeCompare(second.id);
}

export function normalizeDuplicateTaskOrders(tasks: Task[], step = 1000): Task[] {
  if (!Number.isSafeInteger(step) || step <= 0) fail('task-order-invalid');
  const seen = new Set<number>();
  let hasDuplicate = false;
  for (const task of tasks) {
    if (seen.has(task.order)) {
      hasDuplicate = true;
      break;
    }
    seen.add(task.order);
  }
  if (!hasDuplicate) return tasks;

  const normalized = new Map(
    [...tasks]
      .sort(compareTaskOrder)
      .map((task, index) => [task.id, (index + 1) * step] as const)
  );
  return tasks.map((task) => ({ ...task, order: normalized.get(task.id) ?? task.order }));
}

export function nextTaskOrder(tasks: ReadonlyArray<Pick<Task, 'order'>>, step = 1000): number {
  if (!Number.isSafeInteger(step) || step <= 0) fail('task-order-invalid');
  let maximum = 0;
  for (const task of tasks) {
    if (!Number.isSafeInteger(task.order)) fail('task-order-invalid');
    if (task.order > maximum) maximum = task.order;
  }
  const next = maximum + step;
  if (!Number.isSafeInteger(next)) fail('task-order-invalid');
  return next;
}
