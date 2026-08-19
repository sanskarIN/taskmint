import { TASK_LIMITS } from '../domain/limits';
import { createTask } from '../domain/task';
import type { AppSettings, Priority, Recurrence, Task, TaskBackup, TaskStatus } from '../domain/types';
import { validateBackup } from '../domain/validation';

const csvHeaders = [
  'title',
  'notes',
  'priority',
  'dueDate',
  'reminderAt',
  'tags',
  'project',
  'recurrence',
  'status'
] as const;

const priorities = new Set<Priority>(['low', 'medium', 'high', 'urgent']);
const recurrences = new Set<Recurrence>(['none', 'daily', 'weekly', 'monthly']);
const statuses = new Set<TaskStatus>(['active', 'completed', 'archived']);

export function createBackup(tasks: Task[], settings?: AppSettings): TaskBackup {
  return {
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    app: 'TaskMint',
    tasks,
    ...(settings ? { settings } : {})
  };
}

export function serializeBackup(tasks: Task[], settings?: AppSettings): string {
  return JSON.stringify(createBackup(tasks, settings), null, 2);
}

export function parseBackup(text: string): TaskBackup {
  if (text.length > TASK_LIMITS.importBytes) throw new Error('Backup file is too large.');
  return validateBackup(JSON.parse(text) as unknown);
}

export function tasksToCsv(tasks: Task[]): string {
  const rows = [csvHeaders.join(',')];
  for (const task of tasks) {
    rows.push(
      [
        task.title,
        task.notes,
        task.priority,
        task.dueDate ?? '',
        task.reminderAt ?? '',
        task.tags.join('|'),
        task.project,
        task.recurrence,
        task.status
      ]
        .map(csvCell)
        .join(',')
    );
  }
  return rows.join('\r\n');
}

export function csvToTasks(csv: string): Task[] {
  if (csv.length > TASK_LIMITS.importBytes) throw new Error('CSV file is too large.');
  const rows = parseCsv(csv);
  if (rows.length === 0) return [];
  if (rows.length - 1 > TASK_LIMITS.backupTasks) throw new Error('CSV contains too many tasks.');

  const headers = rows[0]?.map((header, index) => {
    const trimmed = header.trim();
    return index === 0 ? trimmed.replace(/^\uFEFF/, '') : trimmed;
  }) ?? [];
  const missing = csvHeaders.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`CSV is missing columns: ${missing.join(', ')}`);
  const duplicates = headers.filter((header, index) => headers.indexOf(header) !== index);
  if (duplicates.length) throw new Error(`CSV contains duplicate columns: ${[...new Set(duplicates)].join(', ')}`);

  return rows
    .slice(1)
    .filter((row) => row.some((cell) => cell.trim() !== ''))
    .map((row, index) => parseCsvTask(row, headers, index + 2));
}

export function downloadText(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function parseCsvTask(row: string[], headers: string[], rowNumber: number): Task {
  const value = (name: (typeof csvHeaders)[number]) => row[headers.indexOf(name)] ?? '';
  const priority = value('priority') as Priority;
  const recurrence = value('recurrence') as Recurrence;
  const status = value('status') as TaskStatus;

  if (!priorities.has(priority)) throw new Error(`CSV row ${rowNumber} has an invalid priority.`);
  if (!recurrences.has(recurrence)) throw new Error(`CSV row ${rowNumber} has an invalid recurrence.`);
  if (!statuses.has(status)) throw new Error(`CSV row ${rowNumber} has an invalid status.`);

  try {
    const now = new Date();
    const task = createTask(
      {
        title: value('title'),
        notes: value('notes'),
        priority,
        dueDate: value('dueDate') || null,
        reminderAt: value('reminderAt') || null,
        tags: value('tags').split('|').filter(Boolean),
        project: value('project'),
        recurrence
      },
      now,
      now.getTime() + rowNumber
    );
    if (status === 'completed') {
      task.status = 'completed';
      task.completedAt = now.toISOString();
    } else if (status === 'archived') {
      task.status = 'archived';
      task.archivedAt = now.toISOString();
    }
    return task;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid task data.';
    throw new Error(`CSV row ${rowNumber}: ${message}`);
  }
}

function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quoted) {
      if (char === '"' && input[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"' && cell === '') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (quoted) throw new Error('CSV contains an unterminated quoted field.');
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ''));
    rows.push(row);
  }
  return rows;
}
