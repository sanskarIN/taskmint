import type { Task } from './types';

export function compareTaskOrder(
  first: Pick<Task, 'id' | 'order'>,
  second: Pick<Task, 'id' | 'order'>
): number {
  return first.order - second.order || first.id.localeCompare(second.id);
}

export function normalizeDuplicateTaskOrders(tasks: Task[], step = 1000): Task[] {
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
  let maximum = 0;
  for (const task of tasks) {
    if (task.order > maximum) maximum = task.order;
  }
  return maximum + step;
}
