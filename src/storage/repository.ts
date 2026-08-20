import { fail } from '../domain/errors';
import { normalizeDuplicateTaskOrders } from '../domain/order';
import { validateBackup, validateSettings, validateTask } from '../domain/validation';
import type { AppSettings, Task, TaskBackup } from '../domain/types';
import { db, type TaskMintDatabase } from './db';

export const defaultSettings: AppSettings = {
  key: 'app',
  theme: 'system',
  onboardingComplete: false,
  reduceMotion: false,
  notificationsEnabled: false
};

export class TaskRepository {
  constructor(private readonly database: TaskMintDatabase = db) {}

  async listTasks(): Promise<Task[]> {
    const tasks = (await this.database.tasks.toArray()).map(validateTask);
    return normalizeDuplicateTaskOrders(tasks);
  }

  async putTask(task: Task): Promise<void> {
    await this.database.tasks.put(validateTask(task));
  }

  async putTasks(tasks: Task[]): Promise<void> {
    if (tasks.length === 0) return;
    const validatedTasks = validateTaskBatch(tasks);
    await this.database.transaction('rw', this.database.tasks, async () => {
      await this.database.tasks.bulkPut(validatedTasks);
    });
  }

  async deleteTask(id: string): Promise<void> {
    await this.database.tasks.delete(id);
  }

  async replaceAllTasks(tasks: Task[]): Promise<void> {
    const validatedTasks = validateTaskBatch(tasks);
    await this.database.transaction('rw', this.database.tasks, async () => {
      await this.database.tasks.clear();
      if (validatedTasks.length) await this.database.tasks.bulkPut(validatedTasks);
    });
  }

  async getSettings(): Promise<AppSettings> {
    const settings = await this.database.settings.get('app');
    return settings === undefined ? defaultSettings : validateSettings(settings);
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await this.database.settings.put(validateSettings(settings));
  }

  async restoreBackup(backup: TaskBackup): Promise<void> {
    const validatedBackup = validateBackup(backup);
    await this.database.transaction('rw', this.database.tasks, this.database.settings, async () => {
      await this.database.tasks.clear();
      if (validatedBackup.tasks.length) await this.database.tasks.bulkPut(validatedBackup.tasks);
      if (validatedBackup.settings) await this.database.settings.put(validatedBackup.settings);
    });
  }

  async deleteAllLocalData(): Promise<void> {
    await this.database.transaction('rw', this.database.tasks, this.database.settings, async () => {
      await this.database.tasks.clear();
      await this.database.settings.clear();
    });
  }
}

function validateTaskBatch(tasks: Task[]): Task[] {
  const validatedTasks = tasks.map(validateTask);
  const seenIds = new Set<string>();
  for (const task of validatedTasks) {
    if (seenIds.has(task.id)) fail('task-batch-duplicate-id', { id: task.id });
    seenIds.add(task.id);
  }
  return validatedTasks;
}

export const repository = new TaskRepository();
