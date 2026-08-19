import Dexie, { type EntityTable } from 'dexie';
import type { AppSettings, Task } from '../domain/types';

export class TaskMintDatabase extends Dexie {
  tasks!: EntityTable<Task, 'id'>;
  settings!: EntityTable<AppSettings, 'key'>;

  constructor() {
    super('taskmint');
    this.version(1).stores({
      tasks: 'id, status, dueDate, project, priority, order, createdAt',
      settings: 'key'
    });
    this.version(2)
      .stores({
        tasks: 'id, status, dueDate, reminderAt, project, priority, order, createdAt, updatedAt, *tags',
        settings: 'key'
      })
      .upgrade(async (tx) => {
        await tx.table<Task, string>('tasks').toCollection().modify((task) => {
          task.reminderAt ??= null;
          task.tags ??= [];
          task.project ??= '';
          task.recurrence ??= 'none';
        });
      });
  }
}

export const db = new TaskMintDatabase();
