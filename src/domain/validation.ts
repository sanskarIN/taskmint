import { TASK_LIMITS } from './limits';
import { normalizeDuplicateTaskOrders } from './order';
import { parseStrictDateTime } from './datetime';
import { TaskMintError } from './errors';
import type { AppSettings, BackupPayload, Priority, Recurrence, Task, TaskStatus } from './types';

function fail(code: string): never {
  throw new TaskMintError(code, 'Invalid backup data.');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function string(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string') fail(`backup-${field}-invalid`);
  const normalized = value.trim();
  if (!normalized || normalized.length > max) fail(`backup-${field}-invalid`);
  return normalized;
}

function optionalString(value: unknown, field: string, max: number): string {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string') fail(`backup-${field}-invalid`);
  if (value.length > max) fail(`backup-${field}-invalid`);
  return value;
}

function boolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') fail(`backup-${field}-invalid`);
  return value;
}

function nullableDate(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    fail(`backup-${field}-invalid`);
  }
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    fail(`backup-${field}-invalid`);
  }
  return value;
}

function validateTimestamp(value: unknown, field: string): string {
  if (typeof value !== 'string') fail(`backup-${field}-invalid`);
  const parsed = parseStrictDateTime(value);
  if (!parsed) fail(`backup-${field}-invalid`);
  return parsed.toISOString();
}

function nullableTimestamp(value: unknown, field: string): string | null {
  if (value === null) return null;
  return validateTimestamp(value, field);
}

export function validateTask(value: unknown): Task {
  if (!isRecord(value)) fail('backup-task-invalid');

  const id = string(value.id, 'task-id', TASK_LIMITS.id);
  const title = string(value.title, 'task-title', TASK_LIMITS.title);
  const notes = optionalString(value.notes, 'task-notes', TASK_LIMITS.notes);
  const project = optionalString(value.project, 'task-project', TASK_LIMITS.project);
  const priority = value.priority as Priority;
  if (!['low', 'medium', 'high'].includes(priority)) fail('backup-task-priority-invalid');
  const recurrence = value.recurrence as Recurrence;
  if (!['none', 'daily', 'weekly', 'monthly', 'yearly'].includes(recurrence)) {
    fail('backup-task-recurrence-invalid');
  }
  const status = value.status as TaskStatus;
  if (!['open', 'completed', 'archived'].includes(status)) fail('backup-task-status-invalid');
  const completedAt = nullableTimestamp(value.completedAt, 'completedAt');
  const archivedAt = nullableTimestamp(value.archivedAt, 'archivedAt');

  if (!Array.isArray(value.tags)) fail('backup-task-tags-invalid');
  if (value.tags.length > TASK_LIMITS.tags) fail('backup-task-tags-too-many');
  const normalizedTags = value.tags.map((tag) => {
    if (typeof tag !== 'string') fail('backup-task-tag-invalid');
    const normalized = tag.trim().toLowerCase();
    if (!normalized || normalized.length > TASK_LIMITS.tag) fail('backup-task-tag-invalid');
    return normalized;
  });
  const tags = [...new Set(normalizedTags)];
  if (tags.length > TASK_LIMITS.tags) fail('backup-task-tags-too-many');

  const order = value.order;
  if (typeof order !== 'number' || !Number.isSafeInteger(order)) {
    fail('backup-task-order-invalid');
  }

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

export function validateBackup(value: unknown): BackupPayload {
  if (!isRecord(value)) fail('backup-invalid');
  if (value.schemaVersion !== 1) fail('backup-version-invalid');
  const exportedAt = validateTimestamp(value.exportedAt, 'exportedAt');
  if (!Array.isArray(value.tasks)) fail('backup-tasks-invalid');
  if (value.tasks.length > TASK_LIMITS.tasks) fail('backup-tasks-too-many');
  const tasks = normalizeDuplicateTaskOrders(value.tasks.map(validateTask));
  const ids = new Set<string>();
  for (const task of tasks) {
    if (ids.has(task.id)) fail('backup-task-id-duplicate');
    ids.add(task.id);
  }
  return {
    schemaVersion: 1,
    exportedAt,
    tasks,
    settings: validateSettings(value.settings)
  };
}
