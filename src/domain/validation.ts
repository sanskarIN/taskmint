import type { AppSettings, Priority, Recurrence, Task, TaskBackup, TaskStatus } from './types';

const priorities = new Set<Priority>(['low', 'medium', 'high', 'urgent']);
const recurrences = new Set<Recurrence>(['none', 'daily', 'weekly', 'monthly']);
const statuses = new Set<TaskStatus>(['active', 'completed', 'archived']);

export function validateBackup(input: unknown): TaskBackup {
  if (!isRecord(input)) throw new Error('Backup must be a JSON object.');
  if (input.app !== 'TaskMint' || input.schemaVersion !== 2 || !Array.isArray(input.tasks)) {
    throw new Error('Unsupported or invalid TaskMint backup.');
  }
  if (input.tasks.length > 100_000) throw new Error('Backup contains too many tasks.');
  const tasks = input.tasks.map(validateTask);
  const settings = input.settings === undefined ? undefined : validateSettings(input.settings);
  return {
    app: 'TaskMint',
    schemaVersion: 2,
    exportedAt: typeof input.exportedAt === 'string' ? input.exportedAt : new Date().toISOString(),
    tasks,
    ...(settings ? { settings } : {})
  };
}

export function validateTask(value: unknown): Task {
  if (!isRecord(value)) throw new Error('Invalid task in backup.');
  const title = string(value.title, 'title').trim();
  if (!title || title.length > 240) throw new Error('Invalid task title.');
  const priority = string(value.priority, 'priority') as Priority;
  const recurrence = string(value.recurrence, 'recurrence') as Recurrence;
  const status = string(value.status, 'status') as TaskStatus;
  if (!priorities.has(priority) || !recurrences.has(recurrence) || !statuses.has(status)) {
    throw new Error('Invalid task enum value.');
  }
  return {
    id: string(value.id, 'id').slice(0, 100),
    title,
    notes: string(value.notes, 'notes').slice(0, 20_000),
    priority,
    dueDate: nullableString(value.dueDate),
    reminderAt: nullableString(value.reminderAt),
    tags: Array.isArray(value.tags) ? value.tags.filter((v): v is string => typeof v === 'string').slice(0, 12) : [],
    project: string(value.project, 'project').slice(0, 80),
    recurrence,
    status,
    completedAt: nullableString(value.completedAt),
    archivedAt: nullableString(value.archivedAt),
    createdAt: string(value.createdAt, 'createdAt'),
    updatedAt: string(value.updatedAt, 'updatedAt'),
    order: typeof value.order === 'number' && Number.isFinite(value.order) ? value.order : Date.now()
  };
}

function validateSettings(value: unknown): AppSettings {
  if (!isRecord(value)) throw new Error('Invalid settings in backup.');
  const theme = value.theme === 'light' || value.theme === 'dark' || value.theme === 'system' ? value.theme : 'system';
  return {
    key: 'app',
    theme,
    onboardingComplete: Boolean(value.onboardingComplete),
    reduceMotion: Boolean(value.reduceMotion),
    notificationsEnabled: Boolean(value.notificationsEnabled)
  };
}

function string(value: unknown, field: string): string {
  if (typeof value !== 'string') throw new Error(`Invalid ${field}.`);
  return value;
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
