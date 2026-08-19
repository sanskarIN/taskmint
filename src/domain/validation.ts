import { TASK_LIMITS } from './limits';
import type { AppSettings, Priority, Recurrence, Task, TaskBackup, TaskStatus } from './types';

const priorities = new Set<Priority>(['low', 'medium', 'high', 'urgent']);
const recurrences = new Set<Recurrence>(['none', 'daily', 'weekly', 'monthly']);
const statuses = new Set<TaskStatus>(['active', 'completed', 'archived']);

export function validateBackup(input: unknown): TaskBackup {
  if (!isRecord(input)) throw new Error('Backup must be a JSON object.');
  if (input.app !== 'TaskMint' || input.schemaVersion !== 2 || !Array.isArray(input.tasks)) {
    throw new Error('Unsupported or invalid TaskMint backup.');
  }
  if (input.tasks.length > TASK_LIMITS.backupTasks) {
    throw new Error('Backup contains too many tasks.');
  }

  const tasks = input.tasks.map(validateTask);
  const seenIds = new Set<string>();
  for (const task of tasks) {
    if (seenIds.has(task.id)) throw new Error(`Backup contains duplicate task id: ${task.id}`);
    seenIds.add(task.id);
  }

  const settings = input.settings === undefined ? undefined : validateSettings(input.settings);
  const exportedAt = validateTimestamp(input.exportedAt, 'exportedAt');

  return {
    app: 'TaskMint',
    schemaVersion: 2,
    exportedAt,
    tasks,
    ...(settings ? { settings } : {})
  };
}

export function validateTask(value: unknown): Task {
  if (!isRecord(value)) throw new Error('Invalid task in backup.');

  const id = string(value.id, 'id').trim();
  if (!id || id.length > TASK_LIMITS.id) throw new Error('Invalid task id.');

  const title = string(value.title, 'title').trim();
  if (!title || title.length > TASK_LIMITS.title) throw new Error('Invalid task title.');

  const notes = string(value.notes, 'notes');
  if (notes.length > TASK_LIMITS.notes) throw new Error('Task notes are too long.');

  const project = string(value.project, 'project').trim();
  if (project.length > TASK_LIMITS.project) throw new Error('Task project is too long.');

  const priority = string(value.priority, 'priority') as Priority;
  const recurrence = string(value.recurrence, 'recurrence') as Recurrence;
  const status = string(value.status, 'status') as TaskStatus;
  if (!priorities.has(priority) || !recurrences.has(recurrence) || !statuses.has(status)) {
    throw new Error('Invalid task enum value.');
  }

  const completedAt = nullableTimestamp(value.completedAt, 'completedAt');
  const archivedAt = nullableTimestamp(value.archivedAt, 'archivedAt');
  if (status === 'active' && (completedAt || archivedAt)) {
    throw new Error('Active task contains incompatible completion/archive timestamps.');
  }
  if (status === 'completed' && (!completedAt || archivedAt)) {
    throw new Error('Completed task contains incompatible completion/archive timestamps.');
  }
  if (status === 'archived' && !archivedAt) {
    throw new Error('Archived task is missing archivedAt.');
  }

  if (!Array.isArray(value.tags)) throw new Error('Invalid task tags.');
  const normalizedTags = value.tags.map((tag) => {
    if (typeof tag !== 'string') throw new Error('Invalid task tag.');
    const normalized = tag.trim().toLocaleLowerCase();
    if (!normalized || normalized.length > TASK_LIMITS.tag) throw new Error('Invalid task tag.');
    return normalized;
  });
  const tags = [...new Set(normalizedTags)];
  if (tags.length > TASK_LIMITS.tags) throw new Error('Task contains too many tags.');

  const order = value.order;
  if (typeof order !== 'number' || !Number.isFinite(order)) throw new Error('Invalid task order.');

  return {
    id,
    title,
    notes,
    priority,
    dueDate: nullableDate(value.dueDate, 'dueDate'),
    reminderAt: nullableTimestamp(value.reminderAt, 'reminderAt'),
    tags,
    project,
    recurrence,
    status,
    completedAt,
    archivedAt,
    createdAt: validateTimestamp(value.createdAt, 'createdAt'),
    updatedAt: validateTimestamp(value.updatedAt, 'updatedAt'),
    order
  };
}

function validateSettings(value: unknown): AppSettings {
  if (!isRecord(value)) throw new Error('Invalid settings in backup.');
  const theme =
    value.theme === 'light' || value.theme === 'dark' || value.theme === 'system'
      ? value.theme
      : null;
  if (!theme) throw new Error('Invalid settings theme.');
  return {
    key: 'app',
    theme,
    onboardingComplete: boolean(value.onboardingComplete, 'onboardingComplete'),
    reduceMotion: boolean(value.reduceMotion, 'reduceMotion'),
    notificationsEnabled: boolean(value.notificationsEnabled, 'notificationsEnabled')
  };
}

function string(value: unknown, field: string): string {
  if (typeof value !== 'string') throw new Error(`Invalid ${field}.`);
  return value;
}

function boolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') throw new Error(`Invalid ${field}.`);
  return value;
}

function nullableDate(value: unknown, field: string): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid ${field}.`);
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1, 12, 0, 0, 0);
  const normalized = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  if (normalized !== value) throw new Error(`Invalid ${field}.`);
  return value;
}

function nullableTimestamp(value: unknown, field: string): string | null {
  if (value === null || value === undefined) return null;
  return validateTimestamp(value, field);
}

function validateTimestamp(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Invalid ${field}.`);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid ${field}.`);
  return date.toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
