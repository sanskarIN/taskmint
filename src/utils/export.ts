import { fail } from '../domain/errors';
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
const csvEncodingHeader = 'taskmintEncoding';
const csvEncodingValue = 'safe-text-v1';
const exportCsvHeaders = [...csvHeaders, csvEncodingHeader] as const;
const structuredTagsPrefix = 'json:';

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
  if (text.length > TASK_LIMITS.importBytes) fail('backup-file-too-large');
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    fail('backup-json-invalid');
  }
  return validateBackup(parsed);
}

export function tasksToCsv(tasks: Task[]): string {
  const rows = [exportCsvHeaders.join(',')];
  for (const task of tasks) {
    rows.push(
      [
        encodeSpreadsheetText(task.title),
        encodeSpreadsheetText(task.notes),
        task.priority,
        task.dueDate ?? '',
        task.reminderAt ?? '',
        encodeCsvTags(task.tags),
        encodeSpreadsheetText(task.project),
        task.recurrence,
        task.status,
        csvEncodingValue
      ]
        .map(csvCell)
        .join(',')
    );
  }
  return rows.join('\r\n');
}

export function csvToTasks(csv: string): Task[] {
  if (csv.length > TASK_LIMITS.importBytes) fail('csv-file-too-large');
  const rows = parseCsv(csv);
  if (rows.length === 0) return [];
  if (rows.length - 1 > TASK_LIMITS.backupTasks) fail('csv-too-many-tasks');

  const headers =
    rows[0]?.map((header, index) => {
      const trimmed = header.trim();
      return index === 0 ? trimmed.replace(/^\uFEFF/, '') : trimmed;
    }) ?? [];
  const missing = csvHeaders.filter((header) => !headers.includes(header));
  if (missing.length) fail('csv-missing-columns', { columns: missing });
  const duplicates = headers.filter((header, index) => headers.indexOf(header) !== index);
  if (duplicates.length) {
    fail('csv-duplicate-columns', { columns: [...new Set(duplicates)] });
  }

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
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function parseCsvTask(row: string[], headers: string[], rowNumber: number): Task {
  const value = (name: (typeof csvHeaders)[number]) => row[headers.indexOf(name)] ?? '';
  const encodingIndex = headers.indexOf(csvEncodingHeader);
  const encoding = encodingIndex >= 0 ? (row[encodingIndex] ?? '') : '';
  const priority = value('priority') as Priority;
  const recurrence = value('recurrence') as Recurrence;
  const status = value('status') as TaskStatus;

  if (!priorities.has(priority)) fail('csv-invalid-priority', { row: rowNumber });
  if (!recurrences.has(recurrence)) fail('csv-invalid-recurrence', { row: rowNumber });
  if (!statuses.has(status)) fail('csv-invalid-status', { row: rowNumber });

  try {
    const now = new Date();
    const task = createTask(
      {
        title: decodeSpreadsheetText(value('title'), encoding),
        notes: decodeSpreadsheetText(value('notes'), encoding),
        priority,
        dueDate: value('dueDate') || null,
        reminderAt: value('reminderAt') || null,
        tags: decodeCsvTags(value('tags')),
        project: decodeSpreadsheetText(value('project'), encoding),
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
    const causeMessage = error instanceof Error ? error.message : 'Invalid task data.';
    fail('csv-row-invalid', { row: rowNumber, causeMessage });
  }
}

function encodeCsvTags(tags: string[]): string {
  return `${structuredTagsPrefix}${JSON.stringify(tags)}`;
}

function decodeCsvTags(value: string): string[] {
  if (!value) return [];
  if (!value.startsWith(structuredTagsPrefix)) return value.split('|').filter(Boolean);

  try {
    const parsed = JSON.parse(value.slice(structuredTagsPrefix.length)) as unknown;
    if (Array.isArray(parsed) && parsed.every((tag) => typeof tag === 'string')) return parsed;
  } catch {
    // The stable user-safe error below intentionally hides parser internals.
  }
  fail('csv-invalid-tags');
}

function encodeSpreadsheetText(value: string): string {
  if (value.startsWith("'")) return `'${value}`;
  return /^[\t\r\n ]*[=+\-@]/.test(value) ? `'${value}` : value;
}

function decodeSpreadsheetText(value: string, encoding: string): string {
  if (encoding !== csvEncodingValue) return value;
  if (value.startsWith("''")) return value.slice(1);
  return /^'[\t\r\n ]*[=+\-@]/.test(value) ? value.slice(1) : value;
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
  if (quoted) fail('csv-unterminated-quote');
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ''));
    rows.push(row);
  }
  return rows;
}
