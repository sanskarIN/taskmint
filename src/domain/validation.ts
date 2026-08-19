import { parseStrictDateTime } from './datetime';
import { fail } from './errors';
import { TASK_LIMITS } from './limits';
import { normalizeDuplicateTaskOrders } from './order';
import type { AppSettings, Priority, Recurrence, Task, TaskBackup, TaskStatus } from './types';

const priorities = new Set<Priority>(['low', 'medium', 'high', 'urgent']);
const recurrences = new Set<Recurrence>(['none', 'daily', 'weekly', 'monthly']);
const statuses = new Set<TaskStatus>(['active', 'completed', 'archived']);

export function validateBackup(input: unknown): TaskBackup {
  if (!isRecord(input)) fail('backup-object-invalid');
  if (input.app !== 'TaskMint' || input.schemaVersion !== 2 || !Array.isArray(input.tasks)) {
    fail('backup-schema-invalid');
  }
  if (input.tasks.length > TASK_LIMITS.backupTasks) fail('backup-too-many-tasks');

  const tasks = input.tasks.map(validateTask);
  const seenIds = new Set<string>();
  for (const task of tasks) {
    if (seenIds.has(task.id)) fail('backup-duplicate-task-id', { id: task.id });
    seenIds.add(task.id);
  }

  const settings = input.settings === undefined ? undefined : validateSettings(input.settings);
  const exportedAt = validateTimestamp(input.exportedAt, 'exportedAt');

  return {
    app: 'TaskMint',
    schemaVersion: 2,
    exportedAt,
    tasks: normalizeDuplicateTaskOrders(tasks),
    ...(settings ? { settings } : {})
  };
}

export function validateTask(value: unknown): Task {
  if (!isRecord(value)) fail('backup-task-invalid');

  const id = string(value.id, 'id').trim();
  if (!id || id.length > TASK_LIMITS.id) fail('backup-task-id-invalid');

  const title = string(value.title, 'title').trim();
  if (!title || title.length > TASK_LIMITS.title) fail('backup-task-title-invalid');

  const notes = string(value.notes, 'notes');
  if (notes.length > TASK_LIMITS.notes) fail('backup-task-notes-too-long');

  const project = string(value.project, 'project').trim();
  if (project.length > TASK_LIMITS.project) fail('backup-task-project-too-long');

  const priority = string(value.priority, 'priority') as Priority;
  const recurrence = string(value.recurrence, 'recurrence') as Recurrence;
  const status = string(value.status, 'status') as TaskStatus;
  if (!priorities.has(priority) || !recurrences.has(recurrence) || !statuses.has(status)) {
    fail('backup-task-enum-invalid');
  }

  const completedAt = nullableTimestamp(value.completedAt, 'completedAt');
  const archivedAt = nullableTimestamp(value.archivedAt, 'archivedAt');
  if (status === 'active' && (completedAt || archivedAt)) {
    fail('backup-active-timestamps-invalid');
  }
  if (status === 'completed' && (!completedAt || archivedAt)) {
    fail('backup-completed-timestamps-invalid');
  }
  if (status === 'archived' && !archivedAt) fail('backup-archived-timestamp-missing');

  if (!Array.isArray(value.tags)) fail('backup-task-tags-invalid');
  const normalizedTags = value.tags.map((tag) => {
    if (typeof tag !== 'string') fail('backup-task-tag-invalid');
    const normalized = tag.trim().toLowerCase();
    if (!normalized || normalized.length > TASK_LIMITS.tag) fail('backup-task-tag-invalid');
    return normalized;
  });
  const tags = [...new Set(normalizedTags)];
  if (tags.length > TASK_LIMITS.tags) fail('backup-task-tags-too-many');

  const order = value.order;
  if (!Number.isSafeInteger(order)) fail('backup-task-order-invalid');

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

export function validateSettings(value: unknown): AppSettings {
  if (!isRecord(value)) fail('backup-settings-invalid');
  const theme =
    value.theme === 'light' || value.theme === 'dark' || value.theme === 'system'
      ? value.theme
      : null;
  if (!theme) fail('backup-settings-theme-invalid');
  return {
    key: 'app',
    theme,
    onboardingComplete: boolean(value.onboardingComplete, 'onboardingComplete'),
    reduceMotion: boolean(value.reduceMotion, 'reduceMotion'),
    notificationsEnabled: boolean(value.notificationsEnabled, 'notificationsEnabled')
  };
}

function string(value: unknown, field: string): string {
  if (typeof value !== 'string') fail('backup-field-invalid', { field });
  return value;
}

function boolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') fail('backup-field-invalid', { field });
  return value;
}

function nullableDate(value: unknown, field: string): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    fail('backup-field-invalid', { field });
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1, 12, 0, 0, 0);
  const normalized = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  if (normalized !== value) fail('backup-field-invalid', { field });
  return value;
}

function nullableTimestamp(value: unknown, field: string): string | null {
  if (value === null || value === undefined) return null;
  return validateTimestamp(value, field);
}

function validateTimestamp(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) fail('backup-field-invalid', { field });
  const date = parseStrictDateTime(value);
  if (!date) fail('backup-field-invalid', { field });
  return date.toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
