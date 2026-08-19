import { db, type TaskMintDatabase } from './db';
import type { AppSettings, Task, TaskBackup } from '../domain/types';

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
    return this.database.tasks.toArray();
  }

  async putTask(task: Task): Promise<void> {
    await this.database.tasks.put(task);
  }

  async putTasks(tasks: Task[]): Promise<void> {
    await this.database.tasks.bulkPut(tasks);
  }

  async deleteTask(id: string): Promise<void> {
    await this.database.tasks.delete(id);
  }

  async replaceAllTasks(tasks: Task[]): Promise<void> {
    await this.database.transaction('rw', this.database.tasks, async () => {
      await this.database.tasks.clear();
      if (tasks.length) await this.database.tasks.bulkPut(tasks);
    });
  }

  async getSettings(): Promise<AppSettings> {
    return (await this.database.settings.get('app')) ?? defaultSettings;
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await this.database.settings.put(settings);
  }

  async restoreBackup(backup: TaskBackup): Promise<void> {
    await this.database.transaction('rw', this.database.tasks, this.database.settings, async () => {
      await this.database.tasks.clear();
      if (backup.tasks.length) await this.database.tasks.bulkPut(backup.tasks);
      if (backup.settings) await this.database.settings.put(backup.settings);
    });
  }

  async deleteAllLocalData(): Promise<void> {
    await this.database.transaction('rw', this.database.tasks, this.database.settings, async () => {
      await this.database.tasks.clear();
      await this.database.settings.clear();
    });
  }
}

export const repository = new TaskRepository();
