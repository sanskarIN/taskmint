import type { Task } from './types';

export function nextTaskOrder(tasks: ReadonlyArray<Pick<Task, 'order'>>, step = 1000): number {
  let maximum = 0;
  for (const task of tasks) {
    if (task.order > maximum) maximum = task.order;
  }
  return maximum + step;
}
